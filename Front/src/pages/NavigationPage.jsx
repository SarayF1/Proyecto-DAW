// src/pages/NavigationPage.jsx
// GPS Navigation using Google Maps JavaScript API
// - 2D mode: standard map with DirectionsRenderer polyline
// - 3D mode: tilt:67 + heading = Google Maps' native 3D perspective GPS mode
// - Real-time watchPosition tracking
// - DirectionsService for routing with turn-by-turn steps

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './NavigationPage.module.css'

const GOOGLE_API_KEY = 'AIzaSyAQymGXo2lB1t3Tr-PFQdBJPlB7uNMNevk'

// ── Helpers ────────────────────────────────────────────────────────────────────
function loadGoogleMapsAPI(apiKey) {
  return new Promise((resolve, reject) => {
    if (window.google?.maps) { resolve(window.google.maps); return }
    const existing = document.getElementById('gmaps-script')
    if (existing) {
      existing.addEventListener('load', () => resolve(window.google.maps))
      return
    }
    window.__gmapsInit = () => resolve(window.google.maps)
    const script = document.createElement('script')
    script.id = 'gmaps-script'
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,places&callback=__gmapsInit&v=weekly`
    script.async = true
    script.defer = true
    script.onerror = () => reject(new Error('Failed to load Google Maps'))
    document.head.appendChild(script)
  })
}

function formatDist(meters) {
  if (!meters && meters !== 0) return ''
  if (meters < 1000) return `${Math.round(meters)} m`
  return `${(meters / 1000).toFixed(1)} km`
}

function formatTime(seconds) {
  if (!seconds && seconds !== 0) return ''
  const m = Math.round(seconds / 60)
  if (m < 60) return `${m} min`
  return `${Math.floor(m / 60)}h ${m % 60}min`
}

// Compass bearing from OSRM/Google step modifier → emoji arrow
function stepArrow(instruction = '') {
  const txt = instruction.toLowerCase()
  if (txt.includes('llegado') || txt.includes('destino') || txt.includes('arrive')) return '🏁'
  if (txt.includes('rotonda') || txt.includes('roundabout')) return '⭕'
  if (txt.includes('sharp right') || txt.includes('fuerte derecha')) return '↪️'
  if (txt.includes('sharp left') || txt.includes('fuerte izquierda')) return '↩️'
  if (txt.includes('slight right') || txt.includes('ligeramente derecha')) return '↗️'
  if (txt.includes('slight left') || txt.includes('ligeramente izquierda')) return '↖️'
  if (txt.includes('right') || txt.includes('derecha')) return '➡️'
  if (txt.includes('left') || txt.includes('izquierda')) return '⬅️'
  if (txt.includes('uturn') || txt.includes('vuelta')) return '🔄'
  return '⬆️'
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function NavigationPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()

  const destLat  = parseFloat(params.get('lat')    ?? '28.4986')
  const destLng  = parseFloat(params.get('lng')    ?? '-13.8599')
  const destName = params.get('nombre') ?? 'Destino'

  // refs
  const mapDivRef        = useRef(null)
  const mapRef           = useRef(null)
  const directSvcRef     = useRef(null)
  const directRenderRef  = useRef(null)
  const userMarkerRef    = useRef(null)
  const headingCircleRef = useRef(null)
  const watchIdRef       = useRef(null)
  const lastPosRef       = useRef(null)

  // state
  const [mapsReady,  setMapsReady]  = useState(false)
  const [gpsState,   setGpsState]   = useState('requesting')   // requesting | denied | active
  const [mode,       setMode]       = useState('2d')            // 2d | 3d
  const [userPos,    setUserPos]    = useState(null)            // {lat,lng}
  const [heading,    setHeading]    = useState(0)
  const [speed,      setSpeed]      = useState(null)
  const [route,      setRoute]      = useState(null)            // DirectionsResult
  const [steps,      setSteps]      = useState([])              // parsed step list
  const [stepIdx,    setStepIdx]    = useState(0)
  const [tracking,   setTracking]   = useState(true)
  const [arrived,    setArrived]    = useState(false)
  const [calcStatus, setCalcStatus] = useState('idle')          // idle | loading | done | error
  const [showSteps,  setShowSteps]  = useState(false)
  const [totalDist,  setTotalDist]  = useState(null)
  const [totalTime,  setTotalTime]  = useState(null)
  const [permDenied, setPermDenied] = useState(false)

  // ── 1. Load Google Maps API ─────────────────────────────────────────────────
  useEffect(() => {
    loadGoogleMapsAPI(GOOGLE_API_KEY)
      .then(() => setMapsReady(true))
      .catch(() => console.error('Google Maps failed to load'))
  }, [])

  // ── 2. Init map once API ready ──────────────────────────────────────────────
  useEffect(() => {
    if (!mapsReady || !mapDivRef.current || mapRef.current) return
    const G = window.google.maps

    const map = new G.Map(mapDivRef.current, {
      center:           { lat: destLat, lng: destLng },
      zoom:             15,
      tilt:             0,
      heading:          0,
      mapTypeId:        G.MapTypeId.ROADMAP,
      disableDefaultUI: true,
      gestureHandling:  'greedy',
      styles: [
        { featureType: 'poi',            elementType: 'labels', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit',        elementType: 'labels', stylers: [{ visibility: 'off' }] },
        { featureType: 'road',           elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
        { featureType: 'road.arterial',  elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
        { featureType: 'road.highway',   elementType: 'geometry', stylers: [{ color: '#e8e8e8' }] },
        { featureType: 'landscape',      elementType: 'geometry', stylers: [{ color: '#f0f4ea' }] },
        { featureType: 'water',          elementType: 'geometry', stylers: [{ color: '#c9d8f0' }] },
        { featureType: 'administrative', elementType: 'labels.text.fill', stylers: [{ color: '#274C4A' }] },
      ],
    })

    mapRef.current = map

    // DirectionsService + Renderer
    const svc = new G.DirectionsService()
    const ren = new G.DirectionsRenderer({
      map,
      suppressMarkers: true,
      polylineOptions: {
        strokeColor:   '#2F5D5B',
        strokeWeight:  6,
        strokeOpacity: 0.9,
      },
    })
    directSvcRef.current   = svc
    directRenderRef.current = ren

    // Destination marker
    new G.Marker({
      map,
      position: { lat: destLat, lng: destLng },
      icon: {
        path:         G.SymbolPath.CIRCLE,
        scale:        12,
        fillColor:    '#2F5D5B',
        fillOpacity:  1,
        strokeColor:  '#D6DEC7',
        strokeWeight: 3,
      },
      title: destName,
    })

    // Prevent map from being unmounted on double-render in dev mode
    return () => {}
  }, [mapsReady])

  // ── 3. Request GPS ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!navigator.geolocation) { setGpsState('denied'); setPermDenied(true); return }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng, speed: spd, heading: hdg } = pos.coords
        const newPos = { lat, lng }
        setUserPos(newPos)
        setGpsState('active')
        lastPosRef.current = newPos

        if (spd  !== null)                      setSpeed(spd)
        if (hdg  !== null && !isNaN(hdg))       setHeading(hdg)
      },
      (err) => {
        if (err.code === GeolocationPositionError.PERMISSION_DENIED) {
          setGpsState('denied')
          setPermDenied(true)
        }
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 500 }
    )

    // iOS compass
    const onOrientation = (e) => {
      const h = e.webkitCompassHeading ?? (e.alpha !== null ? 360 - e.alpha : null)
      if (h !== null && !isNaN(h)) setHeading(h)
    }
    if (typeof DeviceOrientationEvent?.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then(p => { if (p === 'granted') window.addEventListener('deviceorientation', onOrientation, true) })
        .catch(() => {})
    } else {
      window.addEventListener('deviceorientation', onOrientation, true)
    }

    return () => {
      if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current)
      window.removeEventListener('deviceorientation', onOrientation, true)
    }
  }, [])

  // ── 4. Calculate route once user position & map are ready ──────────────────
  const calcRoute = useCallback((origin) => {
    if (!directSvcRef.current || !directRenderRef.current) return
    setCalcStatus('loading')
    const G = window.google.maps

    directSvcRef.current.route(
      {
        origin:      { lat: origin.lat, lng: origin.lng },
        destination: { lat: destLat,    lng: destLng },
        travelMode:  G.TravelMode.DRIVING,
        region:      'ES',
        language:    'es',
      },
      (result, status) => {
        if (status === G.DirectionsStatus.OK) {
          directRenderRef.current.setDirections(result)
          setRoute(result)
          setCalcStatus('done')

          // Extract legs/steps
          const leg = result.routes[0]?.legs[0]
          if (leg) {
            setTotalDist(leg.distance?.value ?? null)
            setTotalTime(leg.duration?.value ?? null)
            const parsed = leg.steps.map(s => ({
              instruction: s.instructions?.replace(/<[^>]+>/g, '') ?? '',
              distance:    s.distance?.value    ?? 0,
              duration:    s.duration?.value    ?? 0,
              lat:         s.start_location.lat(),
              lng:         s.start_location.lng(),
            }))
            setSteps(parsed)
            setStepIdx(0)
          }
        } else {
          setCalcStatus('error')
          console.error('Directions error:', status)
        }
      }
    )
  }, [destLat, destLng])

  // Trigger route calc as soon as GPS + map both ready
  useEffect(() => {
    if (userPos && mapRef.current && calcStatus === 'idle') {
      calcRoute(userPos)
    }
  }, [userPos, calcStatus, calcRoute])

  // ── 5. Update user marker & camera as position changes ─────────────────────
  useEffect(() => {
    if (!userPos || !mapRef.current) return
    const G   = window.google.maps
    const pos = { lat: userPos.lat, lng: userPos.lng }

    // User dot marker
    if (!userMarkerRef.current) {
      userMarkerRef.current = new G.Marker({
        map:      mapRef.current,
        position: pos,
        zIndex:   999,
        icon: {
          path:         G.SymbolPath.CIRCLE,
          scale:        9,
          fillColor:    '#2563EB',
          fillOpacity:  1,
          strokeColor:  '#ffffff',
          strokeWeight: 3,
        },
      })
    } else {
      userMarkerRef.current.setPosition(pos)
    }

    // Heading triangle overlay
    if (!headingCircleRef.current) {
      headingCircleRef.current = new G.Marker({
        map:      mapRef.current,
        position: pos,
        zIndex:   998,
        icon: {
          path:         G.SymbolPath.FORWARD_CLOSED_ARROW,
          scale:        5,
          fillColor:    '#2563EB',
          fillOpacity:  0.7,
          strokeColor:  '#fff',
          strokeWeight: 1,
          rotation:     heading,
        },
      })
    } else {
      headingCircleRef.current.setPosition(pos)
      headingCircleRef.current.setIcon({
        ...headingCircleRef.current.getIcon(),
        rotation: heading,
      })
    }

    // Camera follow
    if (tracking) {
      if (mode === '3d') {
        mapRef.current.moveCamera({ center: pos, zoom: 18, tilt: 67, heading })
      } else {
        mapRef.current.panTo(pos)
      }
    }

    // Advance steps
    if (steps.length > 0 && stepIdx < steps.length - 1) {
      const next = steps[stepIdx + 1]
      const dist = window.google.maps.geometry.spherical.computeDistanceBetween(
        new window.google.maps.LatLng(userPos.lat, userPos.lng),
        new window.google.maps.LatLng(next.lat, next.lng)
      )
      if (dist < 25) setStepIdx(i => Math.min(i + 1, steps.length - 1))
    }

    // Arrival check
    if (!arrived) {
      const distToDest = window.google.maps.geometry.spherical.computeDistanceBetween(
        new window.google.maps.LatLng(userPos.lat, userPos.lng),
        new window.google.maps.LatLng(destLat, destLng)
      )
      if (distToDest < 30) setArrived(true)
    }
  }, [userPos, heading, tracking, mode, steps, stepIdx, arrived, destLat, destLng])

  // ── 6. Switch 2D ↔ 3D ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return
    if (mode === '3d') {
      mapRef.current.moveCamera({
        tilt:    67,
        heading: heading,
        zoom:    18,
        ...(userPos ? { center: { lat: userPos.lat, lng: userPos.lng } } : {}),
      })
    } else {
      mapRef.current.moveCamera({
        tilt:    0,
        heading: 0,
        zoom:    16,
        ...(userPos ? { center: { lat: userPos.lat, lng: userPos.lng } } : {}),
      })
    }
  }, [mode])

  // ── 7. Recalculate ──────────────────────────────────────────────────────────
  const recalc = () => {
    if (!userPos) return
    setCalcStatus('idle')
    setStepIdx(0)
    setArrived(false)
    calcRoute(userPos)
  }

  // ── Remaining distance to destination (live) ────────────────────────────────
  const distToDest = userPos && window.google?.maps
    ? (() => {
        try {
          return window.google.maps.geometry.spherical.computeDistanceBetween(
            new window.google.maps.LatLng(userPos.lat, userPos.lng),
            new window.google.maps.LatLng(destLat, destLng)
          )
        } catch { return null }
      })()
    : null

  const currentStep = steps[stepIdx]
  const distToStep  = userPos && currentStep && window.google?.maps
    ? (() => {
        try {
          return window.google.maps.geometry.spherical.computeDistanceBetween(
            new window.google.maps.LatLng(userPos.lat, userPos.lng),
            new window.google.maps.LatLng(currentStep.lat, currentStep.lng)
          )
        } catch { return null }
      })()
    : null

  // ────────────────────────────────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      {/* ── The Google Map div — always mounted so the map object persists ── */}
      <div ref={mapDivRef} className={styles.mapDiv} aria-label="Mapa de navegación" />

      {/* ── Permission screens (overlay over map) ── */}
      <AnimatePresence>
        {gpsState === 'requesting' && !permDenied && (
          <motion.div className={styles.overlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className={styles.permCard}>
              <div className={styles.permEmoji} aria-hidden="true">📍</div>
              <h2 className={styles.permTitle}>Activar ubicación</h2>
              <p className={styles.permDesc}>
                Para guiarte hasta <strong>{destName}</strong>, necesitamos acceder a tu GPS en tiempo real.
              </p>
              <div className={styles.permList}>
                {['Ruta en tiempo real por Google Maps', 'Instrucciones paso a paso', 'Vista 3D tipo GPS', 'Tiempo y distancia al destino'].map(f => (
                  <div key={f} className={styles.permItem}>
                    <span className={styles.permCheck} aria-hidden="true">✓</span>{f}
                  </div>
                ))}
              </div>
              <p className={styles.permHint}>Acepta el permiso de ubicación en el diálogo del navegador</p>
              <div className={styles.spinnerWrap}><span className={styles.spinnerLight} /></div>
            </div>
          </motion.div>
        )}

        {gpsState === 'denied' && (
          <motion.div className={styles.overlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className={styles.permCard}>
              <div className={styles.permEmoji} aria-hidden="true">🔒</div>
              <h2 className={styles.permTitle}>Ubicación bloqueada</h2>
              <p className={styles.permDesc}>
                El acceso al GPS fue denegado. Activa el permiso en los ajustes de tu navegador y recarga la página.
              </p>
              <div className={styles.permActions}>
                <button className={styles.permBtnPrimary} onClick={() => { setPermDenied(false); setGpsState('requesting'); window.location.reload() }}>
                  Reintentar
                </button>
                <button className={styles.permBtnGhost} onClick={() => navigate('/mapa')}>
                  Volver al mapa
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Active navigation UI ── */}
      {gpsState === 'active' && (
        <>
          {/* ── Top bar ── */}
          <div className={styles.topBar}>
            <button className={styles.backBtn} onClick={() => navigate('/mapa')} aria-label="Volver al mapa">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18" aria-hidden="true">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
            </button>

            <div className={styles.destPill}>
              <span className={styles.destPillName}>{destName}</span>
              {distToDest != null && (
                <span className={styles.destPillDist}>{formatDist(distToDest)}</span>
              )}
            </div>

            <div className={styles.topRight}>
              <button
                className={styles.iconBtn}
                onClick={recalc}
                disabled={calcStatus === 'loading'}
                title="Recalcular ruta"
                aria-label="Recalcular ruta"
              >
                {calcStatus === 'loading'
                  ? <span className={styles.spinnerSm} />
                  : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15" aria-hidden="true">
                      <path d="M1 4v6h6"/><path d="M23 20v-6h-6"/>
                      <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"/>
                    </svg>
                }
              </button>

              <button
                className={`${styles.modeToggle} ${mode === '3d' ? styles.modeToggle3d : ''}`}
                onClick={() => setMode(m => m === '2d' ? '3d' : '2d')}
                aria-pressed={mode === '3d'}
                title={mode === '2d' ? 'Activar vista 3D' : 'Volver a vista 2D'}
              >
                {mode === '2d' ? '3D' : '2D'}
              </button>
            </div>
          </div>

          {/* ── Next step instruction banner ── */}
          <AnimatePresence>
            {currentStep && !arrived && (
              <motion.div
                className={styles.stepBanner}
                key={stepIdx}
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.22 }}
              >
                <div className={styles.stepArrowIcon} aria-hidden="true">
                  {stepArrow(currentStep.instruction)}
                </div>
                <div className={styles.stepInfo}>
                  <div className={styles.stepInstruction}>{currentStep.instruction || 'Continuar'}</div>
                  {distToStep != null && (
                    <div className={styles.stepDist}>En {formatDist(distToStep)}</div>
                  )}
                </div>
                <button
                  className={styles.stepsListBtn}
                  onClick={() => setShowSteps(s => !s)}
                  aria-label="Ver lista de indicaciones"
                  title="Todas las indicaciones"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15" aria-hidden="true">
                    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
                    <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
                    <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                  </svg>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Arrived banner ── */}
          <AnimatePresence>
            {arrived && (
              <motion.div
                className={styles.arrivedBanner}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <span className={styles.arrivedEmoji} aria-hidden="true">🏁</span>
                <div>
                  <div className={styles.arrivedTitle}>¡Has llegado!</div>
                  <div className={styles.arrivedSub}>{destName}</div>
                </div>
                <button className={styles.arrivedBackBtn} onClick={() => navigate('/mapa')}>
                  Volver al mapa
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Bottom info bar ── */}
          <div className={styles.bottomBar}>
            {/* Center/follow toggle */}
            <button
              className={`${styles.trackBtn} ${tracking ? styles.trackBtnOn : ''}`}
              onClick={() => setTracking(t => !t)}
              aria-pressed={tracking}
              title={tracking ? 'Dejar de seguir posición' : 'Centrar en mi posición'}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" aria-hidden="true">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
              </svg>
              {tracking ? 'Siguiendo' : 'Centrar'}
            </button>

            {/* ETA card */}
            {calcStatus === 'done' && (totalDist != null || distToDest != null) && (
              <div className={styles.etaCard}>
                <div className={styles.etaTime}>{totalTime ? formatTime(totalTime) : '–'}</div>
                <div className={styles.etaDist}>
                  {distToDest != null ? formatDist(distToDest) + ' restantes' : formatDist(totalDist)}
                </div>
              </div>
            )}

            {/* Speed */}
            {speed != null && (
              <div className={styles.speedCard}>
                <div className={styles.speedVal}>{Math.round(speed * 3.6)}</div>
                <div className={styles.speedUnit}>km/h</div>
              </div>
            )}

            {/* Step counter */}
            {steps.length > 0 && (
              <div className={styles.stepCounter}>
                <div className={styles.stepCounterNum}>{stepIdx + 1}<span>/{steps.length}</span></div>
                <div className={styles.stepCounterLbl}>pasos</div>
              </div>
            )}
          </div>

          {/* ── Steps drawer ── */}
          <AnimatePresence>
            {showSteps && steps.length > 0 && (
              <motion.div
                className={styles.stepsDrawer}
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'tween', duration: 0.28 }}
                role="dialog"
                aria-label="Lista de indicaciones de la ruta"
              >
                <div className={styles.drawerHandle} aria-hidden="true" />
                <div className={styles.drawerHead}>
                  <h3 className={styles.drawerTitle}>Indicaciones</h3>
                  {totalDist && <span className={styles.drawerMeta}>{formatDist(totalDist)} · {totalTime ? formatTime(totalTime) : ''}</span>}
                  <button className={styles.drawerClose} onClick={() => setShowSteps(false)} aria-label="Cerrar indicaciones">✕</button>
                </div>
                <div className={styles.drawerBody}>
                  {steps.map((s, i) => (
                    <div
                      key={i}
                      className={`${styles.drawerStep} ${i === stepIdx ? styles.drawerStepCurrent : ''} ${i < stepIdx ? styles.drawerStepDone : ''}`}
                    >
                      <div className={styles.drawerStepIcon} aria-hidden="true">
                        {i < stepIdx ? '✓' : stepArrow(s.instruction)}
                      </div>
                      <div className={styles.drawerStepBody}>
                        <div className={styles.drawerStepText}>{s.instruction || 'Continuar'}</div>
                        <div className={styles.drawerStepDist}>{formatDist(s.distance)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Route calculating overlay ── */}
          <AnimatePresence>
            {calcStatus === 'loading' && (
              <motion.div className={styles.calcOverlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <span className={styles.spinnerSm} />
                <span>Calculando ruta…</span>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  )
}
