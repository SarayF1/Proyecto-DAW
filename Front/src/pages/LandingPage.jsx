// src/pages/LandingPage.jsx
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import AuthModal from '../components/AuthModal'
import { zonasApi } from '../api/client'
import styles from './LandingPage.module.css'

// ── Reveal wrapper ────────────────────────────
function Reveal({ children, delay = 0 }) {
  const ref = useRef(null)
  const [vis, setVis] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true) }, { threshold: 0.1 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 28 }} animate={vis ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.55, delay, ease: 'easeOut' }}>
      {children}
    </motion.div>
  )
}

// ── Feature card data ─────────────────────────
const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <circle cx="12" cy="12" r="3"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.41 1.41m11.31 11.31 1.41 1.41M4.93 19.07l1.41-1.41m11.31-11.31 1.41-1.41"/>
      </svg>
    ),
    title: 'Reserva en tiempo real',
    desc: 'Consulta disponibilidad al instante y reserva en segundos desde el mapa interactivo.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>
      </svg>
    ),
    title: 'Monedero digital',
    desc: 'Carga saldo y paga automáticamente al finalizar cada estancia. Sin fricciones.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M17.657 16.657 13.414 20.9a1.998 1.998 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z"/><circle cx="12" cy="11" r="3"/>
      </svg>
    ),
    title: 'Mapa de zonas',
    desc: 'Todos los parkings en un mapa con filtros por tarifa y disponibilidad.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M19 17H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h3l2 2h6a2 2 0 0 1 2 2v1"/><circle cx="16" cy="17" r="3"/><circle cx="7" cy="17" r="3"/>
      </svg>
    ),
    title: 'Gestión de vehículos',
    desc: 'Registra tu flota de vehículos y elige con cuál aparcar en cada reserva.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
      </svg>
    ),
    title: 'Historial completo',
    desc: 'Consulta reservas pasadas, duración, importe abonado y zonas utilizadas.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: 'Acceso seguro',
    desc: 'JWT, bcrypt y transacciones ACID garantizan la integridad de tus datos.',
  },
]

export default function LandingPage() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [authOpen, setAuthOpen] = useState(false)
  const [authTab, setAuthTab] = useState('login')
  const [zonas, setZonas] = useState([])
  const [zonasLoading, setZonasLoading] = useState(true)

  useEffect(() => {
    zonasApi.getZonas()
      .then(data => setZonas(Array.isArray(data) ? data : []))
      .catch(() => setZonas([]))
      .finally(() => setZonasLoading(false))
  }, [])

  const openModal = (tab = 'login') => {
    if (token) { navigate('/mapa'); return }
    setAuthTab(tab)
    setAuthOpen(true)
  }

  return (
    <div className={styles.page}>
      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <div className={styles.gridLines} />
          <div className={`${styles.blob} ${styles.blob1}`} />
          <div className={`${styles.blob} ${styles.blob2}`} />
        </div>

        <div className={styles.heroInner}>
          <motion.div
            className={styles.heroText}
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <div className={styles.heroTag}>
              <span className={styles.tagDot} />
              Puerto del Rosario · Fuerteventura
            </div>
            <h1 className={styles.heroTitle}>
              Tu plaza,<br /><em>sin vueltas.</em>
            </h1>
            <p className={styles.heroSub}>
              Reserva aparcamiento en tiempo real, paga desde tu monedero y olvídate de buscar. Gestión inteligente de parkings privados.
            </p>
            <div className={styles.heroCtas}>
              <button className={styles.btnPrimary} onClick={() => openModal('register')}>
                Empezar gratis
              </button>
              <button className={styles.btnOutline} onClick={() => openModal('login')}>
                Iniciar sesión
              </button>
            </div>
          </motion.div>

          <motion.div
            className={styles.heroCards}
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
          >
            <FloatingCard delay={0}>
              <div className={styles.cardLabel}>Zona disponible</div>
              <div className={styles.cardRow}>
                <span className={styles.cardZone}>Parking Ayuntamiento</span>
                <span className={`${styles.badge} ${styles.badgeFree}`}>Libre</span>
              </div>
              <div className={styles.cardDetail}>07:30 – 19:30 · 1,22 €/h</div>
              <div className={styles.progressBar}><div className={styles.progressFill} style={{ width: '28%' }} /></div>
            </FloatingCard>

            <FloatingCard delay={1.4}>
              <div className={styles.cardLabel}>Alta ocupación</div>
              <div className={styles.cardRow}>
                <span className={styles.cardZone}>C. Comercial</span>
                <span className={`${styles.badge} ${styles.badgeBusy}`}>75% lleno</span>
              </div>
              <div className={styles.cardDetail}>09:00 – 22:00 · 1,70 €/h</div>
              <div className={styles.progressBar}><div className={`${styles.progressFill} ${styles.progressBusy}`} style={{ width: '75%' }} /></div>
            </FloatingCard>

            <FloatingCard delay={0.7}>
              <div className={styles.cardStats}>
                {[['3','Zonas'],['7','Plazas'],['24/7','Acceso']].map(([n,l]) => (
                  <div key={l} className={styles.stat}>
                    <div className={styles.statNum}>{n}</div>
                    <div className={styles.statLbl}>{l}</div>
                  </div>
                ))}
              </div>
            </FloatingCard>
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className={styles.section}>
        <Reveal>
          <span className={styles.sectionTag}>Funcionalidades</span>
          <h2 className={styles.sectionTitle}>Todo lo que necesitas<br />para aparcar sin estrés</h2>
          <p className={styles.sectionSub}>Una plataforma completa para gestionar tus reservas, pagos y accesos desde cualquier dispositivo.</p>
        </Reveal>
        <div className={styles.featuresGrid}>
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.07}>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── ZONES ── */}
      <section className={styles.zonesSection}>
        <Reveal>
          <span className={`${styles.sectionTag} ${styles.sectionTagLight}`}>Zonas disponibles</span>
          <h2 className={`${styles.sectionTitle} ${styles.sectionTitleLight}`}>Parkings en Puerto<br />del Rosario</h2>
          <p className={`${styles.sectionSub} ${styles.sectionSubLight}`}>Datos en tiempo real. Selecciona una zona para reservar.</p>
        </Reveal>

        {zonasLoading ? (
          <div className={styles.zonesLoading}>
            <span className={styles.spinner} />
            Cargando zonas...
          </div>
        ) : zonas.length === 0 ? (
          <div className={styles.zonesLoading}>No se pudo conectar al servidor.</div>
        ) : (
          <div className={styles.zonesGrid}>
            {zonas.map((z, i) => {
              const total = Number(z.totalPlazas) || 0
              const libres = Number(z.plazasLibres) || 0
              const pct = total > 0 ? Math.round(((total - libres) / total) * 100) : 0
              const inicio = z.Horario_inicio?.substring(0, 5) ?? '--'
              const fin = z.Horario_fin?.substring(0, 5) ?? '--'
              return (
                <Reveal key={z.idZona} delay={i * 0.08}>
                  <div className={styles.zoneCard} onClick={() => openModal('login')}>
                    <div className={styles.zoneHeader}>
                      <div>
                        <div className={styles.zoneName}>{z.nombre}</div>
                        <div className={styles.zoneLoc}>{z.Localidad}</div>
                      </div>
                      <span className={`${styles.badge} ${libres > 0 ? styles.badgeFree : styles.badgeBusy}`}>
                        {libres > 0 ? `${libres} libre${libres > 1 ? 's' : ''}` : 'Completo'}
                      </span>
                    </div>
                    <div className={styles.zoneMeta}>
                      <span>🕐 {inicio}–{fin}</span>
                      <span>💶 {Number(z.Tarifa ?? 0).toFixed(2)} €/h</span>
                      <span>🅿 {total} plazas</span>
                    </div>
                    <div className={styles.progressBar}>
                      <div
                        className={`${styles.progressFill} ${pct > 60 ? styles.progressBusy : ''}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </Reveal>
              )
            })}
          </div>
        )}
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className={styles.section}>
        <Reveal>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className={styles.sectionTag}>¿Cómo funciona?</span>
            <h2 className={styles.sectionTitle} style={{ textAlign: 'center' }}>En 3 pasos, ya estás aparcado</h2>
          </div>
        </Reveal>
        <div className={styles.stepsGrid}>
          {[
            { n: '1', title: 'Crea tu cuenta', desc: 'Regístrate, añade tu vehículo y carga saldo en tu monedero digital.' },
            { n: '2', title: 'Elige tu zona', desc: 'Consulta el mapa, compara tarifas y selecciona la plaza más conveniente.' },
            { n: '3', title: 'Aparca y paga', desc: 'La reserva descuenta el importe automáticamente del monedero al finalizar.' },
          ].map((s, i) => (
            <Reveal key={s.n} delay={i * 0.1}>
              <div className={styles.step}>
                <div className={styles.stepNum}>{s.n}</div>
                <h3 className={styles.stepTitle}>{s.title}</h3>
                <p className={styles.stepDesc}>{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <Reveal>
        <div className={styles.cta}>
          <h2 className={styles.ctaTitle}>
            ¿Listo para aparcar<br /><em>sin preocupaciones?</em>
          </h2>
          <p className={styles.ctaSub}>Únete a Myparking y gestiona tus aparcamientos de forma inteligente.</p>
          <button className={styles.btnPrimary} style={{ fontSize: '1.05rem', padding: '1rem 2.5rem' }} onClick={() => openModal('register')}>
            Crear cuenta gratis
          </button>
        </div>
      </Reveal>

      {/* ── FOOTER ── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div>
            <div className={styles.footerBrand}>Myparking</div>
            <p className={styles.footerDesc}>Gestión inteligente de aparcamientos privados en Puerto del Rosario, Fuerteventura.</p>
          </div>
          <div className={styles.footerCol}>
            <h4>Plataforma</h4>
            <button onClick={() => openModal('register')}>Crear cuenta</button>
            <button onClick={() => openModal('login')}>Iniciar sesión</button>
          </div>
          <div className={styles.footerCol}>
            <h4>Proyecto</h4>
            <a href="https://github.com/SarayF1/Proyecto-DAW" target="_blank" rel="noreferrer">GitHub</a>
            <a href="https://myparking-frontend.onrender.com/" target="_blank" rel="noreferrer">App desplegada</a>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <span>© 2025 Myparking · Proyecto DAW · Puerto del Rosario</span>
          <span>React · Vite · Node.js · MySQL</span>
        </div>
      </footer>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} initialTab={authTab} />
    </div>
  )
}

function FloatingCard({ children, delay }) {
  return (
    <motion.div
      className={styles.floatingCard}
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 4, repeat: Infinity, delay, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  )
}
