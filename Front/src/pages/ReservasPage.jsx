// src/pages/ReservasPage.jsx
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { format, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { reservasApi } from '../api/client'
import { useAuth } from '../context/AuthContext'
import styles from './ReservasPage.module.css'

async function downloadReciboReserva(reserva, user) {
  try {
    const { default: jsPDF } = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })

    // Header
    doc.setFillColor(47, 93, 91)
    doc.rect(0, 0, 210, 38, 'F')
    doc.setTextColor(214, 222, 199)
    doc.setFontSize(20); doc.setFont('helvetica', 'bold')
    doc.text('MYPARKING', 20, 16)
    doc.setFontSize(9); doc.setFont('helvetica', 'normal')
    doc.text('Gestión inteligente de aparcamientos · Puerto del Rosario', 20, 24)
    doc.text('myparking-frontend.onrender.com', 20, 31)

    // Title
    doc.setTextColor(39, 76, 74)
    doc.setFontSize(16); doc.setFont('helvetica', 'bold')
    doc.text('Factura de Reserva', 20, 52)

    doc.setFontSize(9); doc.setFont('helvetica', 'normal')
    doc.setTextColor(120, 120, 120)
    doc.text(`Nº Reserva: #${reserva.idReserva}`, 20, 59)
    doc.text(`Emitido: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: es })}`, 20, 65)

    const inicio = new Date(reserva.Fecha_inicio)
    const fin = new Date(reserva.Fecha_fin)
    const mins = Math.round((fin - inicio) / 60000)
    const horas = (mins / 60).toFixed(2)

    autoTable(doc, {
      startY: 75,
      head: [['Campo', 'Detalle']],
      body: [
        ['Cliente', `${user?.Nombre || ''} ${user?.Apellido1 || ''}`],
        ['Email', user?.Email || '–'],
        ['Zona de aparcamiento', reserva.zona || '–'],
        ['Localidad', reserva.Localidad || 'Puerto del Rosario'],
        ['Plaza', `#${reserva.idPlaza}`],
        ['Fecha inicio', format(inicio, "dd/MM/yyyy HH:mm", { locale: es })],
        ['Fecha fin', format(fin, "dd/MM/yyyy HH:mm", { locale: es })],
        ['Duración', `${mins} min (${horas} h)`],
        ['Estado', reserva.Estado],
      ],
      headStyles: { fillColor: [47, 93, 91], textColor: [214, 222, 199], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [239, 243, 232] },
      styles: { fontSize: 10, cellPadding: 4 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 55 } },
    })

    // Status badge
    const y = doc.lastAutoTable.finalY + 12
    const statusColor = reserva.Estado === 'EN CURSO' ? [15, 110, 86] : [47, 93, 91]
    doc.setFillColor(...statusColor)
    doc.roundedRect(130, y, 60, 18, 3, 3, 'F')
    doc.setTextColor(214, 222, 199)
    doc.setFontSize(8); doc.text('ESTADO DE RESERVA', 141, y + 7)
    doc.setFontSize(12); doc.setFont('helvetica', 'bold')
    doc.text(reserva.Estado, 148, y + 15)

    // Footer
    doc.setTextColor(180, 180, 180); doc.setFontSize(7.5); doc.setFont('helvetica', 'normal')
    doc.text('Este documento es un comprobante de reserva generado automáticamente.', 20, 278)
    doc.text('Myparking no se hace responsable de daños o pérdidas en las instalaciones.', 20, 283)
    doc.text('© 2025 Myparking · IES Puerto del Rosario', 20, 288)

    doc.save(`myparking-reserva-${reserva.idReserva}.pdf`)
    toast.success('Factura descargada')
  } catch (err) {
    toast.error('Error al generar la factura')
    console.error(err)
  }
}

export default function ReservasPage() {
  const { user } = useAuth()
  const [reservas, setReservas] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    reservasApi.getMisReservas()
      .then(data => setReservas(Array.isArray(data) ? data : []))
      .catch(() => toast.error('Error cargando reservas'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = reservas.filter(r =>
    filter === 'ALL' ? true : r.Estado === filter
  )

  const enCurso = reservas.filter(r => r.Estado === 'EN CURSO').length
  const finalizadas = reservas.filter(r => r.Estado === 'FINALIZADA').length

  if (loading) return (
    <div className={styles.loading}><span className={styles.spinner} /> Cargando reservas...</div>
  )

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className={styles.pageTitle}>Mis reservas</h1>
          <p className={styles.pageSub}>{reservas.length} reserva{reservas.length !== 1 ? 's' : ''} en total</p>
        </motion.div>

        <motion.div className={styles.statsRow} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.06 }}>
          {[
            { label: 'Total', value: reservas.length, color: '' },
            { label: 'En curso', value: enCurso, color: styles.statCurso },
            { label: 'Finalizadas', value: finalizadas, color: styles.statFinal },
          ].map(s => (
            <div key={s.label} className={`${styles.statCard} ${s.color}`}>
              <div className={styles.statNum}>{s.value}</div>
              <div className={styles.statLbl}>{s.label}</div>
            </div>
          ))}
        </motion.div>

        <div className={styles.filters} role="group" aria-label="Filtros de reservas">
          {['ALL', 'EN CURSO', 'FINALIZADA'].map(f => (
            <button
              key={f}
              className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ''}`}
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
            >
              {f === 'ALL' ? 'Todas' : f === 'EN CURSO' ? 'En curso' : 'Finalizadas'}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className={styles.empty} aria-live="polite">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48" aria-hidden="true">
              <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
            </svg>
            <p>No hay reservas en esta categoría</p>
          </div>
        ) : (
          <div className={styles.list}>
            {filtered.map((r, i) => {
              const inicio = new Date(r.Fecha_inicio)
              const fin = new Date(r.Fecha_fin)
              const mins = Math.round((fin - inicio) / 60000)
              const horas = Math.floor(mins / 60)
              const minRest = mins % 60
              const durStr = horas > 0 ? `${horas}h ${minRest}m` : `${minRest}m`
              const isEnCurso = r.Estado === 'EN CURSO'
              return (
                <motion.div
                  key={r.idReserva}
                  className={styles.resCard}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <div className={styles.resLeft}>
                    <div className={`${styles.resStatus} ${isEnCurso ? styles.statusCurso : styles.statusFinal}`}>
                      <span className={`${styles.statusDot} ${isEnCurso ? styles.dotCurso : styles.dotFinal}`} aria-hidden="true" />
                      {isEnCurso ? 'En curso' : 'Finalizada'}
                    </div>
                    <div className={styles.resZona}>{r.zona}</div>
                    <div className={styles.resLoc}>{r.Localidad}</div>
                  </div>

                  <div className={styles.resMid}>
                    <div className={styles.resTimeRow}>
                      <div className={styles.resTimeBlock}>
                        <span className={styles.resTimeLabel}>Inicio</span>
                        <span className={styles.resTimeVal}>{format(inicio, "d MMM · HH:mm", { locale: es })}</span>
                      </div>
                      <div className={styles.resArrow} aria-hidden="true">→</div>
                      <div className={styles.resTimeBlock}>
                        <span className={styles.resTimeLabel}>Fin</span>
                        <span className={styles.resTimeVal}>{format(fin, "d MMM · HH:mm", { locale: es })}</span>
                      </div>
                    </div>
                    <div className={styles.resDur}>{durStr} · Plaza #{r.idPlaza}</div>
                  </div>

                  <div className={styles.resRight}>
                    {isEnCurso && (
                      <div className={styles.countdown}>
                        Finaliza {formatDistanceToNow(fin, { addSuffix: true, locale: es })}
                      </div>
                    )}
                    <div className={styles.resId}>#{r.idReserva}</div>
                    <button
                      className={styles.pdfBtn}
                      onClick={() => downloadReciboReserva(r, user)}
                      aria-label={`Descargar factura de reserva #${r.idReserva}`}
                      title="Descargar factura PDF"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13" aria-hidden="true">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      Factura
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
