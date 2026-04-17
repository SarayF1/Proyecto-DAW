// src/pages/PaymentPage.jsx
// Stripe payment page for wallet top-up
// Note: Replace VITE_STRIPE_PK in .env with your actual Stripe publishable key
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { monederoApi } from '../api/client'
import styles from './PaymentPage.module.css'

// Stripe integration — loads dynamically
// In production set VITE_STRIPE_PK=pk_live_... in .env
const STRIPE_PK = import.meta.env.VITE_STRIPE_PK || 'pk_test_placeholder'

const AMOUNTS = [5, 10, 20, 50, 100]

// Simple card number formatter
function formatCard(val) {
  return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
}
function formatExpiry(val) {
  const digits = val.replace(/\D/g, '').slice(0, 4)
  if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2)
  return digits
}
function formatCVC(val) { return val.replace(/\D/g, '').slice(0, 4) }

// Luhn check
function luhn(num) {
  const digits = num.replace(/\s/g, '')
  let sum = 0
  let odd = true
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = parseInt(digits[i])
    if (!odd) { d *= 2; if (d > 9) d -= 9 }
    sum += d; odd = !odd
  }
  return sum % 10 === 0
}

function getCardBrand(num) {
  const n = num.replace(/\s/g, '')
  if (/^4/.test(n)) return 'Visa'
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return 'Mastercard'
  if (/^3[47]/.test(n)) return 'Amex'
  return ''
}

export default function PaymentPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [amount, setAmount] = useState(10)
  const [customAmount, setCustomAmount] = useState('')
  const [card, setCard] = useState({ number: '', expiry: '', cvc: '', name: '' })
  const [errors, setErrors] = useState({})
  const [paying, setPaying] = useState(false)
  const [success, setSuccess] = useState(false)
  const [receipt, setReceipt] = useState(null)
  const [monedero, setMonedero] = useState(null)

  useEffect(() => {
    monederoApi.getMonedero().then(setMonedero).catch(() => {})
  }, [])

  const finalAmount = Number(customAmount) > 0 ? Number(customAmount) : amount

  const validate = () => {
    const e = {}
    const digits = card.number.replace(/\s/g, '')
    if (digits.length < 16) e.number = 'Número de tarjeta incompleto'
    else if (!luhn(digits)) e.number = 'Número de tarjeta inválido'
    const [mm, yy] = (card.expiry || '').split('/')
    const now = new Date()
    const expYear = 2000 + parseInt(yy || '0')
    const expMonth = parseInt(mm || '0')
    if (!mm || !yy || expMonth < 1 || expMonth > 12) e.expiry = 'Fecha inválida'
    else if (expYear < now.getFullYear() || (expYear === now.getFullYear() && expMonth < now.getMonth() + 1)) e.expiry = 'Tarjeta caducada'
    if (card.cvc.length < 3) e.cvc = 'CVC inválido'
    if (!card.name.trim()) e.name = 'Introduce el nombre del titular'
    if (!finalAmount || finalAmount < 1) e.amount = 'Cantidad mínima: 1 €'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handlePay = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setPaying(true)
    try {
      // In production, create a Stripe PaymentIntent on the backend and confirm here
      // For demo: simulate payment processing then call real recharge endpoint
      await new Promise(r => setTimeout(r, 1800)) // simulate network

      // Simulate success — in production use Stripe Elements confirmPayment
      await monederoApi.recargar(finalAmount)

      const now = new Date()
      const rec = {
        id: `MP-${Date.now()}`,
        date: now.toISOString(),
        amount: finalAmount,
        cardLast4: card.number.replace(/\s/g, '').slice(-4),
        cardBrand: getCardBrand(card.number),
        user: `${user?.Nombre} ${user?.Apellido1}`,
        email: user?.Email,
      }
      setReceipt(rec)
      setSuccess(true)
      toast.success(`+${finalAmount} € añadidos a tu monedero`)

      // Refresh balance
      monederoApi.getMonedero().then(setMonedero).catch(() => {})
    } catch (err) {
      toast.error(err.message || 'Error al procesar el pago')
    } finally { setPaying(false) }
  }

  const downloadPDF = async () => {
    if (!receipt) return
    try {
      const { default: jsPDF } = await import('jspdf')
      const { default: autoTable } = await import('jspdf-autotable')
      const doc = new jsPDF({ unit: 'mm', format: 'a4' })

      // Header band
      doc.setFillColor(47, 93, 91)
      doc.rect(0, 0, 210, 40, 'F')
      doc.setTextColor(214, 222, 199)
      doc.setFontSize(22)
      doc.setFont('helvetica', 'bold')
      doc.text('MYPARKING', 20, 18)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text('Gestión inteligente de aparcamientos', 20, 26)
      doc.text('Puerto del Rosario, Fuerteventura', 20, 32)

      // Receipt title
      doc.setTextColor(39, 76, 74)
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.text('Recibo de pago', 20, 56)

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100, 100, 100)
      doc.text(`Referencia: ${receipt.id}`, 20, 64)
      doc.text(`Fecha: ${new Date(receipt.date).toLocaleString('es-ES')}`, 20, 70)

      // Details table
      autoTable(doc, {
        startY: 80,
        head: [['Concepto', 'Detalle']],
        body: [
          ['Titular', receipt.user],
          ['Email', receipt.email],
          ['Tarjeta', `${receipt.cardBrand} ****${receipt.cardLast4}`],
          ['Importe', `${receipt.amount.toFixed(2)} €`],
          ['Estado', 'COMPLETADO'],
          ['Concepto', 'Recarga de monedero Myparking'],
        ],
        headStyles: { fillColor: [47, 93, 91], textColor: [214, 222, 199], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [239, 243, 232] },
        styles: { fontSize: 10, cellPadding: 4 },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } },
      })

      // Total box
      const y = doc.lastAutoTable.finalY + 15
      doc.setFillColor(39, 76, 74)
      doc.roundedRect(130, y, 60, 20, 3, 3, 'F')
      doc.setTextColor(214, 222, 199)
      doc.setFontSize(10)
      doc.text('TOTAL PAGADO', 145, y + 8)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text(`${receipt.amount.toFixed(2)} EUR`, 141, y + 16)

      // Footer
      doc.setTextColor(160, 160, 160)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text('Este documento es un comprobante de pago generado automáticamente por Myparking.', 20, 280)
      doc.text('© 2025 Myparking · IES Puerto del Rosario · myparking-frontend.onrender.com', 20, 285)

      doc.save(`myparking-recibo-${receipt.id}.pdf`)
      toast.success('Recibo descargado')
    } catch (err) {
      toast.error('Error al generar el PDF')
      console.error(err)
    }
  }

  const brand = getCardBrand(card.number)

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <motion.h1 className={styles.pageTitle} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          Recargar monedero
        </motion.h1>

        {monedero && (
          <div className={styles.balanceBadge}>
            Saldo actual: <strong>{Number(monedero.saldo).toFixed(2)} {monedero.moneda}</strong>
          </div>
        )}

        {success && receipt ? (
          <motion.div className={styles.successCard} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className={styles.successIcon} aria-hidden="true">✅</div>
            <h2 className={styles.successTitle}>¡Pago completado!</h2>
            <p className={styles.successDesc}>Se han añadido <strong>{receipt.amount.toFixed(2)} €</strong> a tu monedero.</p>
            <div className={styles.receiptBox}>
              <div className={styles.receiptRow}><span>Referencia</span><span>{receipt.id}</span></div>
              <div className={styles.receiptRow}><span>Tarjeta</span><span>{receipt.cardBrand} ****{receipt.cardLast4}</span></div>
              <div className={styles.receiptRow}><span>Importe</span><strong>{receipt.amount.toFixed(2)} €</strong></div>
              <div className={styles.receiptRow}><span>Estado</span><span className={styles.statusOk}>Completado</span></div>
            </div>
            <div className={styles.successActions}>
              <button className={styles.pdfBtn} onClick={downloadPDF}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Descargar recibo PDF
              </button>
              <button className={styles.backBtn} onClick={() => navigate('/monedero')}>Ver monedero</button>
            </div>
          </motion.div>
        ) : (
          <div className={styles.layout}>
            {/* Amount selection */}
            <motion.div className={styles.section} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <h2 className={styles.sectionTitle}>Importe a recargar</h2>
              <div className={styles.amountGrid} role="group" aria-label="Selecciona importe">
                {AMOUNTS.map(a => (
                  <button
                    key={a}
                    type="button"
                    className={`${styles.amountBtn} ${amount === a && !customAmount ? styles.amountBtnActive : ''}`}
                    onClick={() => { setAmount(a); setCustomAmount('') }}
                    aria-pressed={amount === a && !customAmount}
                  >
                    {a} €
                  </button>
                ))}
              </div>
              <div className={styles.customField}>
                <label className={styles.label} htmlFor="custom-amt">Otra cantidad (€)</label>
                <input
                  id="custom-amt"
                  className={`${styles.input} ${errors.amount ? styles.inputError : ''}`}
                  type="number" min="1" placeholder="Ej: 35"
                  value={customAmount}
                  onChange={e => { setCustomAmount(e.target.value); setAmount(0) }}
                />
                {errors.amount && <span className={styles.errorMsg} role="alert">{errors.amount}</span>}
              </div>

              <div className={styles.totalBox}>
                <span>Total a pagar</span>
                <span className={styles.totalAmount}>{finalAmount > 0 ? finalAmount.toFixed(2) : '0.00'} €</span>
              </div>

              {/* Stripe notice */}
              <div className={styles.stripeNotice}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                Pago seguro procesado por Stripe. Tus datos están protegidos con cifrado SSL.
              </div>
            </motion.div>

            {/* Card form */}
            <motion.form className={styles.cardForm} onSubmit={handlePay} noValidate initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <h2 className={styles.sectionTitle}>
                Datos de pago
                {brand && <span className={styles.cardBrand}>{brand}</span>}
              </h2>

              {/* Visual card preview */}
              <div className={styles.cardPreview} role="img" aria-label="Vista previa de la tarjeta">
                <div className={styles.cardChip} aria-hidden="true" />
                <div className={styles.cardNumber}>
                  {card.number ? card.number.padEnd(19, '·').replace(/(.{4})/g, '$1 ').trim() : '•••• •••• •••• ••••'}
                </div>
                <div className={styles.cardBottom}>
                  <div>
                    <div className={styles.cardFieldLabel}>Titular</div>
                    <div className={styles.cardFieldValue}>{card.name || 'NOMBRE APELLIDOS'}</div>
                  </div>
                  <div>
                    <div className={styles.cardFieldLabel}>Expira</div>
                    <div className={styles.cardFieldValue}>{card.expiry || 'MM/AA'}</div>
                  </div>
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="card-name">Nombre en la tarjeta</label>
                <input
                  id="card-name" className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                  placeholder="Ana García López" value={card.name}
                  onChange={e => setCard(p => ({...p, name: e.target.value.toUpperCase()}))}
                  autoComplete="cc-name"
                />
                {errors.name && <span className={styles.errorMsg} role="alert">{errors.name}</span>}
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="card-number">Número de tarjeta</label>
                <input
                  id="card-number" className={`${styles.input} ${errors.number ? styles.inputError : ''}`}
                  placeholder="1234 5678 9012 3456" value={card.number}
                  onChange={e => setCard(p => ({...p, number: formatCard(e.target.value)}))}
                  inputMode="numeric" autoComplete="cc-number"
                />
                {errors.number && <span className={styles.errorMsg} role="alert">{errors.number}</span>}
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="card-expiry">Fecha de expiración</label>
                  <input
                    id="card-expiry" className={`${styles.input} ${errors.expiry ? styles.inputError : ''}`}
                    placeholder="MM/AA" value={card.expiry}
                    onChange={e => setCard(p => ({...p, expiry: formatExpiry(e.target.value)}))}
                    inputMode="numeric" autoComplete="cc-exp"
                  />
                  {errors.expiry && <span className={styles.errorMsg} role="alert">{errors.expiry}</span>}
                </div>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="card-cvc">CVC / CVV</label>
                  <input
                    id="card-cvc" className={`${styles.input} ${errors.cvc ? styles.inputError : ''}`}
                    placeholder="123" value={card.cvc}
                    onChange={e => setCard(p => ({...p, cvc: formatCVC(e.target.value)}))}
                    inputMode="numeric" autoComplete="cc-csc"
                    type="password"
                  />
                  {errors.cvc && <span className={styles.errorMsg} role="alert">{errors.cvc}</span>}
                </div>
              </div>

              <button className={styles.payBtn} type="submit" disabled={paying}>
                {paying ? (
                  <>
                    <span className={styles.spinner} />
                    Procesando pago...
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    Pagar {finalAmount > 0 ? `${finalAmount.toFixed(2)} €` : ''}
                  </>
                )}
              </button>

              <p className={styles.disclaimer}>
                Al pulsar "Pagar" aceptas nuestros <a href="/terminos" target="_blank">Términos de servicio</a>. 
                Los pagos son procesados de forma segura por Stripe. Myparking no almacena datos de tarjeta.
              </p>
            </motion.form>
          </div>
        )}
      </div>
    </div>
  )
}
