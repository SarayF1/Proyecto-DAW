// src/pages/VehiculosPage.jsx
// Vehicles CRUD with eco label + PMR (disabled) classification
// eco/pmr fields are stored in localStorage (key: mp_veh_meta_{idVehiculo})
// since the backend Vehiculos table doesn't have those columns yet.
// The BACKEND_ADDITIONS.md explains how to add them server-side.

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { vehiculosApi } from '../api/client'
import styles from './VehiculosPage.module.css'

// ─── Eco label config ──────────────────────────────────────────────────────────
export const ECO_LABELS = {
  ZERO:     { id: 'ZERO',     label: 'Cero emisiones',        short: '0 emisiones', color: '#0F6E56', bg: 'rgba(15,110,86,0.1)',  discount: 0.20, icon: '⚡' },
  ECO:      { id: 'ECO',      label: 'ECO',                   short: 'ECO',         color: '#2563EB', bg: 'rgba(37,99,235,0.1)',   discount: 0.10, icon: '🌿' },
  C:        { id: 'C',        label: 'Etiqueta C',            short: 'C',           color: '#EA8700', bg: 'rgba(234,135,0,0.1)',   discount: 0.05, icon: '🟠' },
  B:        { id: 'B',        label: 'Etiqueta B',            short: 'B',           color: '#993C1D', bg: 'rgba(153,60,29,0.1)',   discount: 0,    icon: '🔴' },
  NONE:     { id: 'NONE',     label: 'Sin etiqueta',          short: 'Sin etiq.',   color: '#888',    bg: 'rgba(100,100,100,0.1)', discount: 0.05, icon: '⬛', surcharge: true },
}

export const PMR_DISCOUNT = 0.30  // 30% discount for disabled badge holders

// ─── localStorage helpers ──────────────────────────────────────────────────────
const getMeta = (idVehiculo) => {
  try {
    const raw = localStorage.getItem(`mp_veh_meta_${idVehiculo}`)
    return raw ? JSON.parse(raw) : { ecoLabel: 'C', pmr: false }
  } catch { return { ecoLabel: 'C', pmr: false } }
}
const setMeta = (idVehiculo, meta) => {
  try { localStorage.setItem(`mp_veh_meta_${idVehiculo}`, JSON.stringify(meta)) } catch {}
}

// ─── Discount calculator (exported for use in MapPage) ────────────────────────
export function calcDiscount(idVehiculo) {
  const meta  = getMeta(idVehiculo)
  const label = ECO_LABELS[meta.ecoLabel] ?? ECO_LABELS.C

  if (meta.pmr)         return { rate: PMR_DISCOUNT, reason: 'Tarjeta de movilidad reducida', type: 'discount' }
  if (label.surcharge)  return { rate: label.discount ?? 0.05, reason: `Sin etiqueta ambiental (+5%)`, type: 'surcharge' }
  if (label.discount > 0) return { rate: label.discount, reason: `Etiqueta ${label.label}`, type: 'discount' }
  return { rate: 0, reason: `Etiqueta ${label.label}`, type: 'none' }
}

// ─── Shared badge component ────────────────────────────────────────────────────
export function EcoBadge({ idVehiculo, className }) {
  const meta  = getMeta(idVehiculo)
  const label = ECO_LABELS[meta.ecoLabel] ?? ECO_LABELS.C
  if (meta.pmr) return (
    <span className={`${styles.ecoBadge} ${className ?? ''}`} style={{ background: 'rgba(37,99,235,0.12)', color: '#2563EB', border: '1px solid rgba(37,99,235,0.25)' }}>
      ♿ PMR
    </span>
  )
  return (
    <span className={`${styles.ecoBadge} ${className ?? ''}`} style={{ background: label.bg, color: label.color, border: `1px solid ${label.color}30` }}>
      {label.icon} {label.short}
    </span>
  )
}

// ─── getVehicleWithMeta (exported for MapPage) ─────────────────────────────────
export function enrichVehicle(v) {
  return { ...v, meta: getMeta(v.idVehiculo) }
}

const EMPTY_FORM = { plate: '', brand: '', model: '', year: '', ecoLabel: 'C', pmr: false }

// ─── Main component ────────────────────────────────────────────────────────────
export default function VehiculosPage() {
  const [vehiculos, setVehiculos] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [showForm,  setShowForm]  = useState(false)
  const [editing,   setEditing]   = useState(null)
  const [form,      setForm]      = useState(EMPTY_FORM)
  const [saving,    setSaving]    = useState(false)
  const [deleting,  setDeleting]  = useState(null)

  const load = async () => {
    try {
      const v = await vehiculosApi.getVehiculos()
      setVehiculos(Array.isArray(v) ? v : [])
    } catch { toast.error('Error cargando vehículos') }
    finally  { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setShowForm(true) }
  const openEdit = (v) => {
    const meta = getMeta(v.idVehiculo)
    setEditing(v)
    setForm({ plate: v.plate, brand: v.brand, model: v.model, year: v.year ?? '', ecoLabel: meta.ecoLabel ?? 'C', pmr: meta.pmr ?? false })
    setShowForm(true)
  }
  const closeForm = () => { setShowForm(false); setEditing(null); setForm(EMPTY_FORM) }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.plate || !form.brand || !form.model) { toast.error('Rellena matrícula, marca y modelo'); return }
    setSaving(true)
    try {
      const apiPayload = { plate: form.plate, brand: form.brand, model: form.model, year: form.year }
      let savedId
      if (editing) {
        await vehiculosApi.actualizar(editing.idVehiculo, apiPayload)
        savedId = editing.idVehiculo
        toast.success('Vehículo actualizado')
      } else {
        const created = await vehiculosApi.crear(apiPayload)
        savedId = created?.idVehiculo
        toast.success('Vehículo añadido')
      }
      // Save eco meta locally
      if (savedId) setMeta(savedId, { ecoLabel: form.ecoLabel, pmr: form.pmr })
      closeForm()
      await load()
    } catch (err) { toast.error(err.message || 'Error al guardar') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este vehículo?')) return
    setDeleting(id)
    try {
      await vehiculosApi.eliminar(id)
      localStorage.removeItem(`mp_veh_meta_${id}`)
      toast.success('Vehículo eliminado')
      await load()
    } catch (err) { toast.error(err.message || 'Error al eliminar') }
    finally { setDeleting(null) }
  }

  if (loading) return (
    <div className={styles.loading}><span className={styles.spinner} /> Cargando vehículos...</div>
  )

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        {/* Header */}
        <motion.div className={styles.header} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div>
            <h1 className={styles.pageTitle}>Mis vehículos</h1>
            <p className={styles.pageSub}>{vehiculos.length} vehículo{vehiculos.length !== 1 ? 's' : ''} registrado{vehiculos.length !== 1 ? 's' : ''}</p>
          </div>
          <button className={styles.addBtn} onClick={openAdd}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="15" height="15" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
            Añadir vehículo
          </button>
        </motion.div>

        {/* Info banner */}
        <motion.div className={styles.infoBanner} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>El <strong>certificado medioambiental</strong> y la <strong>tarjeta PMR</strong> del vehículo aplican descuentos automáticos al calcular el precio de tus reservas.</span>
        </motion.div>

        {vehiculos.length === 0 ? (
          <div className={styles.empty}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" width="56" height="56">
              <path d="M19 17H5a2 2 0 0 1-2-2V9l3-6h12l3 6v6a2 2 0 0 1-2 2z"/>
              <circle cx="7.5" cy="17" r="2.5"/><circle cx="16.5" cy="17" r="2.5"/>
              <path d="M5 9h14"/>
            </svg>
            <p>No tienes vehículos registrados</p>
            <button className={styles.addBtn} onClick={openAdd}>Añadir tu primer vehículo</button>
          </div>
        ) : (
          <div className={styles.grid}>
            {vehiculos.map((v, i) => {
              const meta    = getMeta(v.idVehiculo)
              const label   = ECO_LABELS[meta.ecoLabel] ?? ECO_LABELS.C
              const disc    = calcDiscount(v.idVehiculo)
              return (
                <motion.div key={v.idVehiculo} className={styles.carCard} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  {/* Card header */}
                  <div className={styles.carTop}>
                    <div className={styles.carIconWrap}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="26" height="26">
                        <path d="M19 17H5a2 2 0 0 1-2-2V9l3-6h12l3 6v6a2 2 0 0 1-2 2z"/>
                        <circle cx="7.5" cy="17" r="2.5"/><circle cx="16.5" cy="17" r="2.5"/>
                        <path d="M5 9h14"/>
                      </svg>
                    </div>
                    <div className={styles.carInfo}>
                      <div className={styles.carName}>{v.brand} {v.model}</div>
                      <div className={styles.carPlate}>{v.plate}</div>
                      {v.year && <div className={styles.carYear}>{v.year}</div>}
                    </div>
                  </div>

                  {/* Badges row */}
                  <div className={styles.badgeRow}>
                    {meta.pmr ? (
                      <span className={styles.badge} style={{ background: 'rgba(37,99,235,0.1)', color: '#2563EB', borderColor: 'rgba(37,99,235,0.25)' }}>
                        ♿ Movilidad reducida (PMR)
                      </span>
                    ) : (
                      <span className={styles.badge} style={{ background: label.bg, color: label.color, borderColor: `${label.color}30` }}>
                        {label.icon} {label.label}
                      </span>
                    )}
                    <span className={`${styles.discountBadge} ${disc.type === 'surcharge' ? styles.surchargeBadge : disc.type === 'none' ? styles.neutralBadge : ''}`}>
                      {disc.type === 'discount'  && `−${Math.round(disc.rate * 100)}% en reservas`}
                      {disc.type === 'surcharge' && `+${Math.round(disc.rate * 100)}% recargo`}
                      {disc.type === 'none'      && 'Sin descuento / recargo'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className={styles.carActions}>
                    <button className={styles.editBtn} onClick={() => openEdit(v)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      Editar
                    </button>
                    <button className={styles.deleteBtn} onClick={() => handleDelete(v.idVehiculo)} disabled={deleting === v.idVehiculo}>
                      {deleting === v.idVehiculo
                        ? <span className={styles.spinnerSmall} />
                        : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                      }
                      Eliminar
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Form Modal ── */}
      <AnimatePresence>
        {showForm && (
          <motion.div className={styles.overlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={(e) => e.target === e.currentTarget && closeForm()} role="dialog" aria-label={editing ? 'Editar vehículo' : 'Añadir vehículo'}>
            <motion.div className={styles.modal} initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16 }} transition={{ duration: 0.22 }}>
              <button className={styles.modalClose} onClick={closeForm} aria-label="Cerrar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
              <h3 className={styles.modalTitle}>{editing ? 'Editar vehículo' : 'Añadir vehículo'}</h3>

              <form onSubmit={handleSave} className={styles.form} noValidate>
                {/* Basic fields */}
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="vf-plate">Matrícula *</label>
                  <input id="vf-plate" className={styles.input} placeholder="1234ABC" value={form.plate} onChange={e => setForm(p => ({ ...p, plate: e.target.value.toUpperCase() }))} />
                </div>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="vf-brand">Marca *</label>
                    <input id="vf-brand" className={styles.input} placeholder="Tesla" value={form.brand} onChange={e => setForm(p => ({ ...p, brand: e.target.value }))} />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="vf-model">Modelo *</label>
                    <input id="vf-model" className={styles.input} placeholder="Model 3" value={form.model} onChange={e => setForm(p => ({ ...p, model: e.target.value }))} />
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="vf-year">Año (opcional)</label>
                  <input id="vf-year" className={styles.input} type="number" placeholder="2023" value={form.year} onChange={e => setForm(p => ({ ...p, year: e.target.value }))} />
                </div>

                {/* ── Eco label section ── */}
                <div className={styles.sectionDivider}>
                  <span>Certificado medioambiental</span>
                </div>
                <p className={styles.sectionHint}>
                  La etiqueta de la DGT determina descuentos o recargos automáticos en el precio de tus reservas.
                </p>

                <div className={styles.ecoGrid} role="radiogroup" aria-label="Etiqueta medioambiental">
                  {Object.values(ECO_LABELS).map(l => (
                    <label
                      key={l.id}
                      className={`${styles.ecoOption} ${form.ecoLabel === l.id && !form.pmr ? styles.ecoOptionActive : ''}`}
                      style={form.ecoLabel === l.id && !form.pmr ? { borderColor: l.color, background: l.bg } : {}}
                    >
                      <input type="radio" name="ecoLabel" value={l.id} checked={form.ecoLabel === l.id && !form.pmr} onChange={() => setForm(p => ({ ...p, ecoLabel: l.id, pmr: false }))} className={styles.srOnly} />
                      <span className={styles.ecoOptionIcon} aria-hidden="true">{l.icon}</span>
                      <span className={styles.ecoOptionLabel}>{l.label}</span>
                      <span className={styles.ecoOptionDisc} style={{ color: l.color }}>
                        {l.surcharge ? `+${Math.round((l.discount??0.05)*100)}%` : l.discount > 0 ? `−${Math.round(l.discount*100)}%` : '±0%'}
                      </span>
                    </label>
                  ))}
                </div>

                {/* PMR toggle */}
                <div className={styles.sectionDivider}>
                  <span>Movilidad reducida</span>
                </div>

                <label className={`${styles.pmrToggle} ${form.pmr ? styles.pmrToggleActive : ''}`}>
                  <input type="checkbox" checked={form.pmr} onChange={e => setForm(p => ({ ...p, pmr: e.target.checked }))} className={styles.srOnly} />
                  <div className={styles.pmrToggleLeft}>
                    <span className={styles.pmrIcon} aria-hidden="true">♿</span>
                    <div>
                      <div className={styles.pmrLabel}>Tarjeta de movilidad reducida (PMR)</div>
                      <div className={styles.pmrSub}>Descuento del 30% en todas las reservas · Requiere acreditación</div>
                    </div>
                  </div>
                  <div className={`${styles.pmrSwitch} ${form.pmr ? styles.pmrSwitchOn : ''}`} aria-hidden="true">
                    <div className={styles.pmrSwitchThumb} />
                  </div>
                </label>

                {/* Live preview of applied discount */}
                {(form.ecoLabel || form.pmr) && (
                  <div className={styles.previewBox}>
                    {(() => {
                      const tmpMeta  = { ecoLabel: form.ecoLabel, pmr: form.pmr }
                      const label    = ECO_LABELS[tmpMeta.ecoLabel] ?? ECO_LABELS.C
                      const rate     = tmpMeta.pmr ? PMR_DISCOUNT : (label.discount ?? 0)
                      const surcharge = !tmpMeta.pmr && label.surcharge
                      const exampleBase = 3.00
                      const adj  = surcharge ? exampleBase * (1 + rate) : exampleBase * (1 - rate)
                      return (
                        <>
                          <div className={styles.previewTitle}>
                            {tmpMeta.pmr
                              ? '♿ Tarjeta PMR — descuento aplicado'
                              : surcharge
                              ? `${label.icon} Sin etiqueta — recargo aplicado`
                              : `${label.icon} Etiqueta ${label.label} — descuento aplicado`}
                          </div>
                          <div className={styles.previewCalc}>
                            <span className={styles.previewBase}>3,00 €</span>
                            <span className={styles.previewArrow} aria-hidden="true">→</span>
                            <span className={styles.previewFinal} style={{ color: surcharge ? '#993C1D' : '#0F6E56' }}>
                              {adj.toFixed(2)} €
                            </span>
                            <span className={styles.previewNote}>
                              {surcharge ? `+${Math.round(rate*100)}% recargo` : `−${Math.round(rate*100)}% descuento`}
                            </span>
                          </div>
                          <p className={styles.previewFootnote}>Ejemplo para una reserva de 3,00 €</p>
                        </>
                      )
                    })()}
                  </div>
                )}

                <button className={styles.saveBtn} type="submit" disabled={saving}>
                  {saving ? <span className={styles.spinner} /> : null}
                  {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Añadir vehículo'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
