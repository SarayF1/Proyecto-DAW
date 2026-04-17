// src/pages/MapPage.jsx
import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { useNavigate } from 'react-router-dom'
import L from 'leaflet'
import toast from 'react-hot-toast'
import { zonasApi, plazasApi, reservasApi, vehiculosApi } from '../api/client'
import EcoModal from '../components/EcoModal'
import { calcDiscount, ECO_LABELS } from './VehiculosPage'
import { fetchPOI } from '../hooks/usePOI'
import POIPopup from '../components/POIPopup'
import 'leaflet/dist/leaflet.css'
import styles from './MapPage.module.css'

// ─── Leaflet icon setup ────────────────────────────────────────────────────────
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const makeParkingIcon = (libre) => L.divIcon({
  className: '',
  html: `<div style="
    width:38px;height:38px;border-radius:50% 50% 50% 0;
    background:${libre ? '#2F5D5B' : '#E24B4A'};
    border:3px solid ${libre ? '#D6DEC7' : '#fecaca'};
    transform:rotate(-45deg);
    box-shadow:0 3px 14px rgba(0,0,0,0.28);
    display:flex;align-items:center;justify-content:center;
  ">
    <span style="transform:rotate(45deg);font-size:13px;line-height:1;">${libre ? '🅿' : '🚫'}</span>
  </div>`,
  iconSize: [38,38], iconAnchor: [19,38], popupAnchor: [0,-42],
})

const makePOIIcon = (poi) => {
  const isEV   = poi.type === 'ev'
  const color  = isEV ? '#2563EB' : (poi.brandColor || '#D97706')
  const border = isEV ? '#BFDBFE' : '#FEF3C7'
  return L.divIcon({
    className: '',
    html: `<div style="
      width:32px;height:32px;border-radius:10px;
      background:${color};
      border:2.5px solid ${border};
      display:flex;align-items:center;justify-content:center;
      font-size:15px;line-height:1;
      box-shadow:0 2px 10px rgba(0,0,0,0.22);
    ">${isEV ? '⚡' : '⛽'}</div>`,
    iconSize: [32,32], iconAnchor: [16,16], popupAnchor: [0,-20],
  })
}

// ─── Determine POI buttons to show based on vehicle eco labels ─────────────────
// ZERO / ECO = electric / hybrid → needs EV chargers
// C / B / NONE = combustion → needs fuel
function detectVehicleCapabilities(vehiculos) {
  if (!vehiculos.length) return { hasFuel: true, hasEV: true }
  let hasFuel = false
  let hasEV   = false
  for (const v of vehiculos) {
    let meta = { ecoLabel: 'C', pmr: false }
    try { meta = JSON.parse(localStorage.getItem(`mp_veh_meta_${v.idVehiculo}`) || '{}') } catch {}
    const label = meta.ecoLabel || 'C'
    if (label === 'ZERO' || label === 'ECO') hasEV   = true
    else                                     hasFuel = true
  }
  return { hasFuel, hasEV }
}

function FlyTo({ center }) {
  const map = useMap()
  useEffect(() => { if (center) map.flyTo(center, 16, { duration: 1.1 }) }, [center, map])
  return null
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function MapPage() {
  const [zonas,        setZonas]        = useState([])
  const [plazas,       setPlazas]       = useState([])
  const [vehiculos,    setVehiculos]    = useState([])
  const [loading,      setLoading]      = useState(true)
  const [selectedZona, setSelectedZona] = useState(null)
  const [flyTo,        setFlyTo]        = useState(null)
  const [reservaModal, setReservaModal] = useState(null)
  const [reservaForm,  setReservaForm]  = useState({ idVehiculo: '', Fecha_inicio: '', Fecha_fin: '' })
  const [reserving,    setReserving]    = useState(false)
  const [ecoOpen,      setEcoOpen]      = useState(false)
  const [navTarget,    setNavTarget]    = useState(null)

  // POI state
  const [pois,        setPois]        = useState([])
  const [poisLoading, setPoisLoading] = useState(false)
  const [poisLoaded,  setPoisLoaded]  = useState(false)
  const [poisErr,     setPoisErr]     = useState(null)
  const [showFuel,    setShowFuel]    = useState(false)
  const [showEV,      setShowEV]      = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([zonasApi.getZonas(), plazasApi.getPlazas(), vehiculosApi.getVehiculos()])
      .then(([z, p, v]) => {
        setZonas(Array.isArray(z) ? z : [])
        setPlazas(Array.isArray(p) ? p : [])
        setVehiculos(Array.isArray(v) ? v : [])
      })
      .catch(() => toast.error('Error cargando datos del mapa'))
      .finally(() => setLoading(false))
  }, [])

  // Derive vehicle capabilities (memoised so it doesn't re-run on every render)
  const { hasFuel, hasEV } = useMemo(
    () => detectVehicleCapabilities(vehiculos),
    [vehiculos]
  )

  const zonasConPlazas = useMemo(() =>
    zonas.map(z => ({
      ...z,
      plazasZona: plazas.filter(p => p.idZona === z.idZona || p.id_Zona === z.idZona),
    })),
    [zonas, plazas]
  )

  // ── POI loading ──────────────────────────────────────────────────────────────
  const loadPOI = async () => {
    if (poisLoaded) return
    setPoisLoading(true); setPoisErr(null)
    try {
      const results = await fetchPOI(28.4986, -13.8599, 6000)
      setPois(results)
      setPoisLoaded(true)
    } catch {
      setPoisErr('Error al cargar puntos de interés')
      toast.error('No se pudieron cargar los puntos de interés')
    } finally { setPoisLoading(false) }
  }

  const handleToggleFuel = () => {
    if (!poisLoaded && !poisLoading) loadPOI()
    setShowFuel(f => !f)
  }
  const handleToggleEV = () => {
    if (!poisLoaded && !poisLoading) loadPOI()
    setShowEV(e => !e)
  }

  // ── Map interaction ──────────────────────────────────────────────────────────
  const handleSelectZona = (z) => {
    setSelectedZona(z)
    if (z.lat && z.lng) setFlyTo([Number(z.lat), Number(z.lng)])
  }

  const handleNavigate = (z) => {
    if (!z.lat || !z.lng) { toast.error('Esta zona no tiene coordenadas'); return }
    navigate(`/navegar?lat=${z.lat}&lng=${z.lng}&nombre=${encodeURIComponent(z.nombre)}`)
  }

  const handleReservar = (plaza) => {
    if (plaza.Estado_Plaza !== 'LIBRE') { toast.error('Esta plaza no está disponible'); return }
    if (vehiculos.length === 0) { toast.error('Añade un vehículo antes de reservar'); return }
    const now = new Date()
    const pad = (n) => String(n).padStart(2, '0')
    const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
    setReservaForm({ idVehiculo: vehiculos[0].idVehiculo, Fecha_inicio: fmt(now), Fecha_fin: fmt(new Date(now.getTime() + 3600000)) })
    setReservaModal(plaza)
  }

  const submitReserva = async (e) => {
    e.preventDefault()
    if (!reservaForm.idVehiculo || !reservaForm.Fecha_inicio || !reservaForm.Fecha_fin) { toast.error('Rellena todos los campos'); return }
    if (new Date(reservaForm.Fecha_fin) <= new Date(reservaForm.Fecha_inicio)) { toast.error('La fecha fin debe ser posterior al inicio'); return }
    setReserving(true)
    try {
      const res = await reservasApi.crearReserva({
        idPlaza:      reservaModal.idPlaza,
        Fecha_inicio: reservaForm.Fecha_inicio.replace('T', ' ') + ':00',
        Fecha_fin:    reservaForm.Fecha_fin.replace('T', ' ') + ':00',
        idVehiculo:   Number(reservaForm.idVehiculo),
      })
      toast.success(`✅ Reserva creada · ${res.importe?.toFixed(2) ?? '–'} €`)
      const zonaObj = zonas.find(z => z.idZona === (reservaModal.idZona ?? reservaModal.id_Zona))
      setReservaModal(null)
      setNavTarget(zonaObj ? { lat: zonaObj.lat, lng: zonaObj.lng, nombre: zonaObj.nombre } : null)
      setEcoOpen(true)
      const p = await plazasApi.getPlazas()
      setPlazas(Array.isArray(p) ? p : [])
    } catch (err) { toast.error(err.message || 'Error al crear la reserva') }
    finally { setReserving(false) }
  }

  const handleEcoDonate = () => {
    setEcoOpen(false)
    navTarget?.lat ? navigate(`/navegar?lat=${navTarget.lat}&lng=${navTarget.lng}&nombre=${encodeURIComponent(navTarget.nombre ?? 'Parking')}`) : navigate('/reservas')
  }
  const handleEcoSkip = handleEcoDonate

  // ── Filtered POIs ────────────────────────────────────────────────────────────
  const visiblePOIs = useMemo(() =>
    pois.filter(p => (p.type === 'fuel' && showFuel) || (p.type === 'ev' && showEV)),
    [pois, showFuel, showEV]
  )

  if (loading) return <div className={styles.loadingWrap}><span className={styles.spinner} /> Cargando mapa...</div>

  return (
    <div className={styles.layout}>

      {/* ── SIDEBAR ── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>Zonas de parking</h2>
          <p className={styles.sidebarSub}>{zonas.length} zonas · Puerto del Rosario</p>
        </div>

        {/* POI filter buttons — inside sidebar, below header */}
        <div className={styles.poiBar}>
          <div className={styles.poiBarLabel}>Puntos de interés</div>
          <div className={styles.poiBarBtns}>
            {hasFuel && (
              <button
                className={`${styles.poiBtn} ${showFuel ? styles.poiBtnFuelActive : ''}`}
                onClick={handleToggleFuel}
                aria-pressed={showFuel}
                disabled={poisLoading}
              >
                {poisLoading && !poisLoaded
                  ? <span className={styles.poiBtnSpinner} />
                  : <span aria-hidden="true">⛽</span>
                }
                Gasolineras
              </button>
            )}
            {hasEV && (
              <button
                className={`${styles.poiBtn} ${showEV ? styles.poiBtnEVActive : ''}`}
                onClick={handleToggleEV}
                aria-pressed={showEV}
                disabled={poisLoading}
              >
                {poisLoading && !poisLoaded
                  ? <span className={styles.poiBtnSpinner} />
                  : <span aria-hidden="true">⚡</span>
                }
                Carga EV
              </button>
            )}
            {!hasFuel && !hasEV && (
              <span className={styles.poiBarHint}>
                Añade vehículos para ver puntos de interés relevantes
              </span>
            )}
          </div>
          {poisErr && <p className={styles.poiBarErr}>{poisErr}</p>}
        </div>

        {/* Zone list */}
        <div className={styles.zonaList}>
          {zonasConPlazas.map(z => {
            const libres     = Number(z.plazasLibres ?? z.plazasZona?.filter(p => p.Estado_Plaza === 'LIBRE').length ?? 0)
            const total      = Number(z.totalPlazas ?? z.plazasZona?.length ?? 0)
            const pct        = total > 0 ? Math.round(((total - libres) / total) * 100) : 0
            const isSelected = selectedZona?.idZona === z.idZona
            return (
              <div
                key={z.idZona}
                className={`${styles.zonaItem} ${isSelected ? styles.zonaItemActive : ''}`}
                onClick={() => handleSelectZona(z)}
              >
                <div className={styles.zonaItemRow}>
                  <div>
                    <div className={styles.zonaItemName}>{z.nombre}</div>
                    <div className={styles.zonaItemLoc}>{z.Localidad}</div>
                  </div>
                  <span className={`${styles.badge} ${libres > 0 ? styles.badgeFree : styles.badgeBusy}`}>
                    {libres > 0 ? `${libres} libre${libres > 1 ? 's' : ''}` : 'Lleno'}
                  </span>
                </div>

                <div className={styles.zonaItemMeta}>
                  <span>{Number(z.Tarifa ?? 0).toFixed(2)} €/h</span>
                  <span>{z.Horario_inicio?.substring(0,5)} – {z.Horario_fin?.substring(0,5)}</span>
                </div>

                <div className={styles.progressBar}>
                  <div className={`${styles.progressFill} ${pct > 60 ? styles.progressBusy : ''}`} style={{ width: `${pct}%` }} />
                </div>

                <button
                  className={styles.navBtn}
                  onClick={(e) => { e.stopPropagation(); handleNavigate(z) }}
                  aria-label={`Cómo llegar a ${z.nombre}`}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12" aria-hidden="true">
                    <polygon points="3 11 22 2 13 21 11 13 3 11"/>
                  </svg>
                  Cómo llegar
                </button>

                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      className={styles.plazaGrid}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {z.plazasZona.length === 0
                        ? <p className={styles.noPlazas}>Sin plazas registradas</p>
                        : z.plazasZona.map(p => (
                          <button
                            key={p.idPlaza}
                            className={`${styles.plazaBtn} ${p.Estado_Plaza === 'LIBRE' ? styles.plazaLibre : styles.plazaEnUso}`}
                            onClick={(e) => { e.stopPropagation(); handleReservar(p) }}
                            disabled={p.Estado_Plaza !== 'LIBRE'}
                          >
                            <span>#{p.idPlaza}</span>
                            <span className={styles.plazaStatus}>{p.Estado_Plaza === 'LIBRE' ? 'Libre' : 'Ocupada'}</span>
                          </button>
                        ))
                      }
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </aside>

      {/* ── MAP ── */}
      <div className={styles.mapWrap}>
        <MapContainer center={[28.4986, -13.8599]} zoom={14} className={styles.map} zoomControl={true}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          {flyTo && <FlyTo center={flyTo} />}

          {/* Parking zone markers */}
          {zonasConPlazas.map(z => {
            if (!z.lat || !z.lng) return null
            const libres = Number(z.plazasLibres ?? 0)
            return (
              <Marker
                key={`zona-${z.idZona}`}
                position={[Number(z.lat), Number(z.lng)]}
                icon={makeParkingIcon(libres > 0)}
                eventHandlers={{ click: () => handleSelectZona(z) }}
                zIndexOffset={1000}
              >
                <Popup className={styles.parkingPopup}>
                  <div className={styles.ppHeader}>
                    <strong className={styles.ppName}>{z.nombre}</strong>
                    <span className={`${styles.ppBadge} ${libres > 0 ? styles.ppBadgeFree : styles.ppBadgeBusy}`}>
                      {libres > 0 ? `${libres} libre${libres > 1 ? 's' : ''}` : 'Completo'}
                    </span>
                  </div>
                  <div className={styles.ppMeta}>
                    <span>🕐 {z.Horario_inicio?.substring(0,5)}–{z.Horario_fin?.substring(0,5)}</span>
                    <span>💶 {Number(z.Tarifa ?? 0).toFixed(2)} €/h</span>
                  </div>
                  <button className={styles.ppNavBtn} onClick={() => handleNavigate(z)}>
                    🧭 Cómo llegar
                  </button>
                </Popup>
              </Marker>
            )
          })}

          {/* POI markers — fuel & EV chargers */}
          {visiblePOIs.map(poi => (
            <Marker
              key={`poi-${poi.id}`}
              position={[poi.lat, poi.lng]}
              icon={makePOIIcon(poi)}
              zIndexOffset={0}
            >
              <Popup className="poi-leaflet-popup" maxWidth={270} minWidth={220}>
                <POIPopup poi={poi} />
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* ── RESERVATION MODAL ── */}
      <AnimatePresence>
        {reservaModal && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && setReservaModal(null)}
          >
            <motion.div
              className={styles.modal}
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.22 }}
            >
              <button className={styles.modalClose} onClick={() => setReservaModal(null)} aria-label="Cerrar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
              <h3 className={styles.modalTitle}>Nueva reserva</h3>
              <p className={styles.modalSub}>Plaza #{reservaModal.idPlaza} · {reservaModal.zona}</p>

              <form onSubmit={submitReserva} className={styles.form}>
                <div className={styles.field}>
                  <label className={styles.label}>Vehículo</label>
                  <select className={styles.input} value={reservaForm.idVehiculo} onChange={e => setReservaForm(p => ({ ...p, idVehiculo: e.target.value }))}>
                    {vehiculos.map(v => (
                      <option key={v.idVehiculo} value={v.idVehiculo}>{v.brand} {v.model} – {v.plate}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label}>Inicio</label>
                    <input className={styles.input} type="datetime-local" value={reservaForm.Fecha_inicio} onChange={e => setReservaForm(p => ({ ...p, Fecha_inicio: e.target.value }))} />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Fin</label>
                    <input className={styles.input} type="datetime-local" value={reservaForm.Fecha_fin} onChange={e => setReservaForm(p => ({ ...p, Fecha_fin: e.target.value }))} />
                  </div>
                </div>

                {/* Live price with eco discount */}
                {reservaForm.Fecha_inicio && reservaForm.Fecha_fin && (() => {
                  const mins   = (new Date(reservaForm.Fecha_fin) - new Date(reservaForm.Fecha_inicio)) / 60000
                  const zona   = zonas.find(z => z.idZona === (reservaModal.idZona ?? reservaModal.id_Zona))
                  const tarifa = Number(zona?.Tarifa ?? 0)
                  const base   = mins > 0 ? (mins / 60) * tarifa : null
                  if (!base) return null
                  const disc   = calcDiscount(Number(reservaForm.idVehiculo))
                  const final  = disc.type === 'discount'  ? base * (1 - disc.rate)
                               : disc.type === 'surcharge' ? base * (1 + disc.rate) : base
                  const saved  = disc.type === 'discount'  ? base - final : null
                  const extra  = disc.type === 'surcharge' ? final - base : null
                  return (
                    <div className={styles.importeBox}>
                      <div className={styles.importeRow}>
                        <span>{Math.round(mins)} min</span>
                        {disc.type !== 'none' && (
                          <span className={`${styles.discBadge} ${disc.type === 'surcharge' ? styles.discBadgeSur : ''}`}>
                            {disc.type === 'discount'  && `${disc.reason} −${Math.round(disc.rate*100)}%`}
                            {disc.type === 'surcharge' && `${disc.reason} +${Math.round(disc.rate*100)}%`}
                          </span>
                        )}
                      </div>
                      <div className={styles.importePriceRow}>
                        {disc.type !== 'none' && <span className={styles.importeBase}>{base.toFixed(2)} €</span>}
                        <span className={`${styles.importeNum} ${disc.type === 'surcharge' ? styles.importeNumSur : disc.type === 'discount' ? styles.importeNumDisc : ''}`}>
                          {final.toFixed(2)} €
                        </span>
                      </div>
                      {saved && <div className={styles.importeSaving}>🌿 Ahorras {saved.toFixed(2)} € con tu certificado</div>}
                      {extra && <div className={styles.importeExtra}>⚠️ +{extra.toFixed(2)} € recargo sin etiqueta</div>}
                    </div>
                  )
                })()}

                <button className={styles.submitBtn} type="submit" disabled={reserving}>
                  {reserving ? <span className={styles.spinner} /> : null}
                  {reserving ? 'Reservando...' : 'Confirmar reserva'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ECO MODAL ── */}
      <EcoModal
        isOpen={ecoOpen}
        zoneName={navTarget?.nombre ?? 'el parking'}
        onDonate={handleEcoDonate}
        onSkip={handleEcoSkip}
      />
    </div>
  )
}
