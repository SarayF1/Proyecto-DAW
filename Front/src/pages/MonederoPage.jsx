// src/pages/MonederoPage.jsx
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { monederoApi } from '../api/client'
import styles from './MonederoPage.module.css'

const QUICK_AMOUNTS = [5, 10, 20, 50]
const PROMO_CODES = ['PRUEBA10', 'BONUS5', 'REGALO20']

export default function MonederoPage() {
  const [monedero, setMonedero] = useState(null)
  const [movimientos, setMovimientos] = useState([])
  const [loading, setLoading] = useState(true)
  const [recharging, setRecharging] = useState(false)
  const [customAmount, setCustomAmount] = useState('')
  const [promoCode, setPromoCode] = useState('')
  const [applyingPromo, setApplyingPromo] = useState(false)

  const load = async () => {
    try {
      const [m, mv] = await Promise.all([monederoApi.getMonedero(), monederoApi.getMovimientos()])
      setMonedero(m)
      setMovimientos(Array.isArray(mv) ? mv : [])
    } catch (err) {
      toast.error('Error cargando el monedero')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleRecharge = async (amount) => {
    const qty = Number(amount)
    if (!qty || qty <= 0) { toast.error('Introduce una cantidad válida'); return }
    setRecharging(true)
    try {
      await monederoApi.recargar(qty)
      toast.success(`+${qty.toFixed(2)} € añadidos`)
      setCustomAmount('')
      await load()
    } catch (err) {
      toast.error(err.message || 'Error al recargar')
    } finally { setRecharging(false) }
  }

  const handlePromo = async (e) => {
    e.preventDefault()
    if (!promoCode.trim()) { toast.error('Introduce un código'); return }
    setApplyingPromo(true)
    try {
      const res = await monederoApi.aplicarCodigo(promoCode.trim().toUpperCase())
      toast.success(`Código aplicado · Nuevo saldo: ${Number(res.saldo).toFixed(2)} €`)
      setPromoCode('')
      await load()
    } catch (err) {
      toast.error(err.message || 'Código inválido')
    } finally { setApplyingPromo(false) }
  }

  if (loading) return (
    <div className={styles.loading}><span className={styles.spinner} /> Cargando monedero...</div>
  )

  const saldo = Number(monedero?.saldo ?? 0)

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <motion.h1
          className={styles.pageTitle}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          Monedero
        </motion.h1>

        <div className={styles.grid}>
          {/* Left column */}
          <div className={styles.left}>
            {/* Wallet card */}
            <motion.div
              className={styles.walletCard}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
            >
              <div className={styles.walletTop}>
                <div>
                  <div className={styles.walletLabel}>Saldo disponible</div>
                  <div className={styles.walletAmount}>
                    {saldo.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    <span className={styles.walletCurrency}> {monedero?.moneda ?? 'EUR'}</span>
                  </div>
                </div>
                <div className={styles.walletIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>
                    <circle cx="16" cy="15" r="1.5" fill="currentColor"/>
                  </svg>
                </div>
              </div>
              <div className={styles.walletDivider} />
              <div className={styles.walletStats}>
                <div className={styles.walletStat}>
                  <span className={styles.wStatVal}>
                    {movimientos.filter(m => m.tipo === 'INGRESO').reduce((a, m) => a + Number(m.cantidad), 0).toFixed(2)} €
                  </span>
                  <span className={styles.wStatLbl}>Total recargado</span>
                </div>
                <div className={styles.walletStat}>
                  <span className={styles.wStatVal}>
                    {movimientos.filter(m => m.tipo === 'GASTO').reduce((a, m) => a + Number(m.cantidad), 0).toFixed(2)} €
                  </span>
                  <span className={styles.wStatLbl}>Total gastado</span>
                </div>
                <div className={styles.walletStat}>
                  <span className={styles.wStatVal}>{movimientos.length}</span>
                  <span className={styles.wStatLbl}>Movimientos</span>
                </div>
              </div>
            </motion.div>

            {/* Quick recharge */}
            <motion.div
              className={styles.card}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <h2 className={styles.cardTitle}>Recargar saldo</h2>
              <div className={styles.quickAmounts}>
                {QUICK_AMOUNTS.map(a => (
                  <button key={a} className={styles.quickBtn} onClick={() => handleRecharge(a)} disabled={recharging}>
                    +{a} €
                  </button>
                ))}
              </div>
              <div className={styles.customRow}>
                <input
                  className={styles.input}
                  type="number"
                  min="1"
                  placeholder="Cantidad personalizada (€)"
                  value={customAmount}
                  onChange={e => setCustomAmount(e.target.value)}
                />
                <button
                  className={styles.rechargeBtn}
                  onClick={() => handleRecharge(customAmount)}
                  disabled={recharging || !customAmount}
                >
                  {recharging ? <span className={styles.spinner} /> : null}
                  Añadir
                </button>
              </div>
            </motion.div>

            {/* Promo codes */}
            <motion.div
              className={styles.card}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              <h2 className={styles.cardTitle}>Código promocional</h2>
              <p className={styles.cardSub}>Prueba: <code>PRUEBA10</code>, <code>BONUS5</code>, <code>REGALO20</code></p>
              <form onSubmit={handlePromo} className={styles.promoRow}>
                <input
                  className={styles.input}
                  placeholder="Introduce tu código"
                  value={promoCode}
                  onChange={e => setPromoCode(e.target.value)}
                  style={{ textTransform: 'uppercase' }}
                />
                <button className={styles.rechargeBtn} type="submit" disabled={applyingPromo}>
                  {applyingPromo ? <span className={styles.spinner} /> : null}
                  Aplicar
                </button>
              </form>
            </motion.div>
          </div>

          {/* Right column – movements */}
          <motion.div
            className={styles.right}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.12 }}
          >
            <div className={styles.card} style={{ height: '100%' }}>
              <h2 className={styles.cardTitle}>Movimientos</h2>
              {movimientos.length === 0 ? (
                <div className={styles.empty}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="40" height="40" style={{ opacity: 0.3 }}>
                    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"/>
                  </svg>
                  Sin movimientos aún
                </div>
              ) : (
                <div className={styles.movList}>
                  {movimientos.map((m, i) => (
                    <motion.div
                      key={m.idMovimiento}
                      className={styles.movItem}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <div className={`${styles.movIcon} ${m.tipo === 'INGRESO' ? styles.movIconIn : styles.movIconOut}`}>
                        {m.tipo === 'INGRESO'
                          ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
                          : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
                        }
                      </div>
                      <div className={styles.movInfo}>
                        <div className={styles.movDesc}>{m.descripcion}</div>
                        <div className={styles.movDate}>
                          {m.zona && <span className={styles.movZona}>{m.zona} · </span>}
                          {m.fecha ? format(new Date(m.fecha), "d MMM yyyy · HH:mm", { locale: es }) : '–'}
                        </div>
                      </div>
                      <div className={`${styles.movAmount} ${m.tipo === 'INGRESO' ? styles.amountIn : styles.amountOut}`}>
                        {m.tipo === 'INGRESO' ? '+' : '–'}{Number(m.cantidad).toFixed(2)} €
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
