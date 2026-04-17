// src/pages/WelcomeFunnelPage.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { vehiculosApi, monederoApi } from '../api/client'
import { ECO_LABELS, PMR_DISCOUNT } from './VehiculosPage'
import styles from './WelcomeFunnelPage.module.css'

const STEPS = [
  { id: 'welcome', title: '¡Bienvenido!', icon: '👋' },
  { id: 'vehicle', title: 'Añade tu vehículo', icon: '🚗' },
  { id: 'wallet', title: 'Carga tu monedero', icon: '💳' },
  { id: 'done', title: '¡Todo listo!', icon: '✅' },
]

const AMOUNTS = [5, 10, 20, 50]

export default function WelcomeFunnelPage() {
  const { user, clearNewUser } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)

  // Vehicle form
  const [vehicle, setVehicle] = useState({ plate: '', brand: '', model: '', year: '', ecoLabel: 'C', pmr: false })
  const [vehicleAdded, setVehicleAdded] = useState(false)

  // Wallet
  const [selectedAmount, setSelectedAmount] = useState(null)
  const [customAmount, setCustomAmount] = useState('')
  const [walletCharged, setWalletCharged] = useState(false)

  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1))
  const skip = () => next()

  const handleAddVehicle = async (e) => {
    e.preventDefault()
    if (!vehicle.plate || !vehicle.brand || !vehicle.model) {
      toast.error('Matrícula, marca y modelo son obligatorios')
      return
    }
    setLoading(true)
    try {
      const created = await vehiculosApi.crear(vehicle)
      if (created?.idVehiculo) {
        try { localStorage.setItem(`mp_veh_meta_${created.idVehiculo}`, JSON.stringify({ ecoLabel: vehicle.ecoLabel, pmr: vehicle.pmr })) } catch {}
      }
      setVehicleAdded(true)
      toast.success('¡Vehículo añadido!')
      setTimeout(next, 600)
    } catch (err) {
      toast.error(err.message || 'Error al añadir vehículo')
    } finally { setLoading(false) }
  }

  const handleRecharge = async () => {
    const amount = Number(selectedAmount || customAmount)
    if (!amount || amount <= 0) { toast.error('Selecciona o introduce una cantidad'); return }
    setLoading(true)
    try {
      await monederoApi.recargar(amount)
      setWalletCharged(true)
      toast.success(`+${amount} € añadidos a tu monedero`)
      setTimeout(next, 600)
    } catch (err) {
      toast.error(err.message || 'Error al recargar')
    } finally { setLoading(false) }
  }

  const handleFinish = () => {
    clearNewUser?.()
    navigate('/mapa')
  }

  const variants = {
    enter: { opacity: 0, x: 40 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
  }

  return (
    <div className={styles.page}>
      {/* Progress bar */}
      <div className={styles.progressWrap} role="progressbar" aria-valuenow={step} aria-valuemin={0} aria-valuemax={STEPS.length - 1} aria-label={`Paso ${step + 1} de ${STEPS.length}`}>
        <div className={styles.progressBar} style={{ width: `${((step) / (STEPS.length - 1)) * 100}%` }} />
      </div>

      {/* Step indicators */}
      <div className={styles.steps} aria-label="Pasos del proceso">
        {STEPS.map((s, i) => (
          <div key={s.id} className={`${styles.stepDot} ${i <= step ? styles.stepDotDone : ''}`} aria-label={`${s.title}${i < step ? ' (completado)' : i === step ? ' (actual)' : ''}`}>
            <span className={styles.stepDotIcon}>{i < step ? '✓' : s.icon}</span>
            <span className={styles.stepLabel}>{s.title}</span>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className={styles.card}>
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="welcome" className={styles.stepContent} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
              <div className={styles.bigEmoji} aria-hidden="true">👋</div>
              <h1 className={styles.stepTitle}>¡Hola, {user?.Nombre}!</h1>
              <p className={styles.stepDesc}>
                Bienvenido a Myparking. Vamos a configurar tu cuenta en 2 pasos rápidos para que puedas empezar a reservar aparcamiento.
              </p>
              <div className={styles.featureList}>
                {['Reserva plazas en tiempo real', 'Paga con tu monedero digital', 'Gestiona tus vehículos', 'Historial completo de reservas'].map(f => (
                  <div key={f} className={styles.featureItem}>
                    <span className={styles.featureCheck} aria-hidden="true">✓</span>
                    {f}
                  </div>
                ))}
              </div>
              <button className={styles.primaryBtn} onClick={next}>
                Empezar configuración →
              </button>
              <button className={styles.ghostBtn} onClick={handleFinish}>Saltar por ahora</button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="vehicle" className={styles.stepContent} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
              <div className={styles.bigEmoji} aria-hidden="true">🚗</div>
              <h1 className={styles.stepTitle}>Añade tu vehículo</h1>
              <p className={styles.stepDesc}>Registra la matrícula de tu coche para poder hacer reservas.</p>
              {vehicleAdded ? (
                <div className={styles.successBox}>
                  <span aria-hidden="true">✓</span> Vehículo añadido correctamente
                </div>
              ) : (
                <form onSubmit={handleAddVehicle} className={styles.form} noValidate>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="veh-plate">Matrícula *</label>
                    <input id="veh-plate" className={styles.input} placeholder="1234ABC" value={vehicle.plate} onChange={e => setVehicle(p => ({...p, plate: e.target.value.toUpperCase()}))} required />
                  </div>
                  <div className={styles.row}>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="veh-brand">Marca *</label>
                      <input id="veh-brand" className={styles.input} placeholder="Toyota" value={vehicle.brand} onChange={e => setVehicle(p => ({...p, brand: e.target.value}))} required />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="veh-model">Modelo *</label>
                      <input id="veh-model" className={styles.input} placeholder="Corolla" value={vehicle.model} onChange={e => setVehicle(p => ({...p, model: e.target.value}))} required />
                    </div>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="veh-year">Año (opcional)</label>
                    <input id="veh-year" className={styles.input} type="number" placeholder="2020" value={vehicle.year} onChange={e => setVehicle(p => ({...p, year: e.target.value}))} />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="veh-eco">Etiqueta medioambiental DGT</label>
                    <select id="veh-eco" className={styles.input} value={vehicle.pmr ? '__PMR__' : vehicle.ecoLabel}
                      onChange={e => {
                        const v = e.target.value
                        if (v === '__PMR__') setVehicle(p => ({...p, pmr: true, ecoLabel: 'C'}))
                        else setVehicle(p => ({...p, pmr: false, ecoLabel: v}))
                      }}>
                      {Object.values(ECO_LABELS).map(l => (
                        <option key={l.id} value={l.id}>{l.icon} {l.label} — {l.surcharge ? `+${Math.round((l.discount??0.05)*100)}% recargo` : l.discount > 0 ? `−${Math.round(l.discount*100)}% descuento` : 'sin descuento'}</option>
                      ))}
                      <option value="__PMR__">♿ Movilidad reducida (PMR) — −30% descuento</option>
                    </select>
                  </div>
                  <button className={styles.primaryBtn} type="submit" disabled={loading}>
                    {loading ? <span className={styles.spinner} /> : null}
                    {loading ? 'Añadiendo...' : 'Añadir vehículo'}
                  </button>
                </form>
              )}
              <button className={styles.ghostBtn} onClick={skip}>Saltar este paso</button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="wallet" className={styles.stepContent} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
              <div className={styles.bigEmoji} aria-hidden="true">💳</div>
              <h1 className={styles.stepTitle}>Carga tu monedero</h1>
              <p className={styles.stepDesc}>Añade saldo para poder pagar tus reservas. Puedes recargar cuando quieras.</p>
              {walletCharged ? (
                <div className={styles.successBox}>
                  <span aria-hidden="true">✓</span> ¡Saldo añadido!
                </div>
              ) : (
                <>
                  <div className={styles.amountGrid} role="group" aria-label="Selecciona una cantidad">
                    {AMOUNTS.map(a => (
                      <button
                        key={a}
                        className={`${styles.amountBtn} ${selectedAmount === a ? styles.amountBtnActive : ''}`}
                        onClick={() => { setSelectedAmount(a); setCustomAmount('') }}
                        aria-pressed={selectedAmount === a}
                        type="button"
                      >
                        {a} €
                      </button>
                    ))}
                  </div>
                  <div className={styles.field} style={{ marginTop: '1rem' }}>
                    <label className={styles.label} htmlFor="custom-amount">O introduce otra cantidad</label>
                    <input
                      id="custom-amount"
                      className={styles.input}
                      type="number"
                      min="1"
                      placeholder="Cantidad en €"
                      value={customAmount}
                      onChange={e => { setCustomAmount(e.target.value); setSelectedAmount(null) }}
                    />
                  </div>
                  <button className={styles.primaryBtn} onClick={handleRecharge} disabled={loading} type="button">
                    {loading ? <span className={styles.spinner} /> : null}
                    {loading ? 'Recargando...' : `Cargar ${selectedAmount || customAmount || 0} €`}
                  </button>
                </>
              )}
              <button className={styles.ghostBtn} onClick={skip}>Hacerlo más tarde</button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="done" className={styles.stepContent} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
              <motion.div className={styles.bigEmoji} animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5, delay: 0.2 }} aria-hidden="true">🎉</motion.div>
              <h1 className={styles.stepTitle}>¡Todo listo!</h1>
              <p className={styles.stepDesc}>Tu cuenta está configurada. Ya puedes explorar el mapa y hacer tu primera reserva.</p>
              <div className={styles.summaryList}>
                {vehicleAdded && <div className={styles.summaryItem}><span aria-hidden="true">🚗</span> Vehículo registrado</div>}
                {walletCharged && <div className={styles.summaryItem}><span aria-hidden="true">💳</span> Monedero recargado</div>}
                <div className={styles.summaryItem}><span aria-hidden="true">🗺️</span> Mapa con zonas disponibles</div>
              </div>
              <button className={styles.primaryBtn} onClick={handleFinish}>
                Ir al mapa →
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
