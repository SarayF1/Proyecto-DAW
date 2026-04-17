// src/components/POIPopup.jsx
// Clean, scannable popup for fuel stations and EV charging points
// Design principle: most important info first, details on demand
import { useState } from 'react'
import styles from './POIPopup.module.css'
import { getBusyProfile } from '../hooks/usePOI'

// Compact bar chart — only 6 "buckets" spanning the day (4h each)
function MiniChart({ profile, currentHour }) {
  // Group 24 hours into 6 blocks of 4h each
  const buckets = Array.from({ length: 6 }, (_, i) => {
    const avg = Math.round(profile.slice(i*4, i*4+4).reduce((a,b) => a+b,0) / 4)
    const isNow = currentHour >= i*4 && currentHour < (i+1)*4
    return { avg, isNow, label: `${i*4}h` }
  })
  return (
    <div className={styles.miniChart} aria-hidden="true">
      {buckets.map((b, i) => (
        <div key={i} className={styles.miniChartCol}>
          <div
            className={`${styles.miniBar} ${b.isNow ? styles.miniBarNow : ''}`}
            style={{ height: `${Math.max(15, b.avg)}%` }}
          />
          <span className={styles.miniChartLabel}>{b.label}</span>
        </div>
      ))}
    </div>
  )
}

export default function POIPopup({ poi }) {
  const [expanded, setExpanded] = useState(false)
  const hour    = new Date().getHours()
  const profile = getBusyProfile(poi.type)
  const isEV    = poi.type === 'ev'

  // Primary fuel / price — just the first 2 most relevant
  const mainFuels = poi.fuels.slice(0, 2)

  return (
    <div className={styles.card}>
      {/* ── TOP ROW: type chip + name ── */}
      <div className={styles.topRow}>
        <span className={`${styles.typeChip} ${isEV ? styles.typeChipEV : styles.typeChipFuel}`}>
          {isEV ? '⚡ Carga EV' : '⛽ Combustible'}
        </span>
        {poi.hours === '24 horas' && <span className={styles.h24Chip}>24h</span>}
      </div>

      <div className={styles.name}>{poi.name}</div>
      {poi.address && <div className={styles.address}>{poi.address}</div>}

      {/* ── PRICES ── */}
      <div className={styles.priceRow}>
        {mainFuels.map((f, i) => (
          <div key={i} className={styles.priceChip}>
            <span className={styles.fuelName}>{f.name}</span>
            <span className={styles.fuelPrice}>{f.price.toFixed(isEV ? 2 : 3)}<span className={styles.fuelUnit}>{f.unit || '€/L'}</span></span>
          </div>
        ))}
      </div>

      {/* ── BUSY STATUS ── */}
      <div className={styles.busyRow}>
        <span className={styles.busyDot} style={{ background: poi.busyColor }} aria-hidden="true"/>
        <span className={styles.busyLabel} style={{ color: poi.busyColor }}>{poi.busyLabel}</span>
        <span className={styles.busySep} aria-hidden="true">·</span>
        <span className={styles.busyHours}>{poi.hours}</span>
      </div>

      {/* ── MINI CHART ── */}
      <MiniChart profile={profile} currentHour={hour} />

      {/* ── EXPAND TOGGLE ── */}
      <button
        className={styles.expandBtn}
        onClick={() => setExpanded(e => !e)}
        aria-expanded={expanded}
      >
        {expanded ? 'Ver menos ▲' : 'Ver más ▼'}
      </button>

      {/* ── EXPANDED DETAILS ── */}
      {expanded && (
        <div className={styles.details}>
          {/* All fuels */}
          {poi.fuels.length > 2 && (
            <div className={styles.detailSection}>
              <div className={styles.detailTitle}>Todos los combustibles</div>
              {poi.fuels.map((f, i) => (
                <div key={i} className={styles.detailPriceRow}>
                  <span>{f.name}</span>
                  <strong>{f.price.toFixed(isEV ? 2 : 3)} {f.unit || '€/L'}</strong>
                </div>
              ))}
            </div>
          )}

          {/* EV sockets */}
          {isEV && poi.sockets.length > 0 && (
            <div className={styles.detailSection}>
              <div className={styles.detailTitle}>Conectores · {poi.totalSockets} punto{poi.totalSockets !== 1 ? 's' : ''}</div>
              {poi.sockets.map((s, i) => (
                <div key={i} className={styles.socketRow}>
                  <span className={styles.socketLabel}>{s.label}</span>
                  {s.count && s.count !== '?' && <span className={styles.socketCount}>×{s.count}</span>}
                </div>
              ))}
            </div>
          )}

          {/* Links */}
          {(poi.phone || poi.website || poi.operator) && (
            <div className={styles.detailSection}>
              {poi.operator && <div className={styles.detailMeta}>Operador: {poi.operator}</div>}
              <div className={styles.linksRow}>
                {poi.phone   && <a href={`tel:${poi.phone}`}                           className={styles.link}>📞 Llamar</a>}
                {poi.website && <a href={poi.website} target="_blank" rel="noreferrer" className={styles.link}>🌐 Web</a>}
              </div>
            </div>
          )}

          <p className={styles.priceNote}>Precios orientativos Canarias · No en tiempo real</p>
        </div>
      )}
    </div>
  )
}
