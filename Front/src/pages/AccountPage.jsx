// src/pages/AccountPage.jsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { meApi } from '../api/client'
import styles from './AccountPage.module.css'

export default function AccountPage() {
  const { user, refreshUser, logout } = useAuth()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    Nombre: user?.Nombre ?? '',
    Apellido1: user?.Apellido1 ?? '',
    Apellido2: user?.Apellido2 ?? '',
    Email: user?.Email ?? '',
    Password: '',
  })

  const startEdit = () => {
    setForm({
      Nombre: user?.Nombre ?? '',
      Apellido1: user?.Apellido1 ?? '',
      Apellido2: user?.Apellido2 ?? '',
      Email: user?.Email ?? '',
      Password: '',
    })
    setEditing(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.Nombre || !form.Apellido1 || !form.Email) {
      toast.error('Nombre, apellido y email son obligatorios')
      return
    }
    setSaving(true)
    try {
      await meApi.updateMe(form)
      await refreshUser()
      toast.success('Perfil actualizado')
      setEditing(false)
    } catch (err) {
      toast.error(err.message || 'Error al actualizar')
    } finally { setSaving(false) }
  }

  const initials = `${user?.Nombre?.charAt(0) ?? ''}${user?.Apellido1?.charAt(0) ?? ''}`

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <motion.h1
          className={styles.pageTitle}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          Mi perfil
        </motion.h1>

        <div className={styles.layout}>
          {/* Profile card */}
          <motion.div
            className={styles.profileCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            <div className={styles.avatar}>{initials}</div>
            <div className={styles.fullName}>
              {user?.Nombre} {user?.Apellido1} {user?.Apellido2 ?? ''}
            </div>
            <div className={styles.email}>{user?.Email}</div>
            <div className={styles.roleBadge}>{user?.Rol}</div>

            <div className={styles.profileActions}>
              {!editing && (
                <button className={styles.editBtn} onClick={startEdit}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Editar perfil
                </button>
              )}
              <button className={styles.logoutBtn} onClick={logout}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Cerrar sesión
              </button>
            </div>
          </motion.div>

          {/* Info / Edit form */}
          <motion.div
            className={styles.infoCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {!editing ? (
              <>
                <h2 className={styles.cardTitle}>Información personal</h2>
                <div className={styles.infoGrid}>
                  {[
                    { label: 'Nombre', value: user?.Nombre },
                    { label: 'Primer apellido', value: user?.Apellido1 },
                    { label: 'Segundo apellido', value: user?.Apellido2 || '—' },
                    { label: 'Email', value: user?.Email },
                    { label: 'Rol', value: user?.Rol },
                    { label: 'ID de usuario', value: `#${user?.idUsuario}` },
                  ].map(({ label, value }) => (
                    <div key={label} className={styles.infoItem}>
                      <span className={styles.infoLabel}>{label}</span>
                      <span className={styles.infoValue}>{value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <h2 className={styles.cardTitle}>Editar perfil</h2>
                <form onSubmit={handleSave} className={styles.form}>
                  <div className={styles.formRow}>
                    <div className={styles.field}>
                      <label className={styles.label}>Nombre *</label>
                      <input className={styles.input} value={form.Nombre}
                        onChange={e => setForm(p => ({ ...p, Nombre: e.target.value }))} />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>Apellido 1 *</label>
                      <input className={styles.input} value={form.Apellido1}
                        onChange={e => setForm(p => ({ ...p, Apellido1: e.target.value }))} />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.field}>
                      <label className={styles.label}>Apellido 2</label>
                      <input className={styles.input} value={form.Apellido2}
                        onChange={e => setForm(p => ({ ...p, Apellido2: e.target.value }))} />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>Email *</label>
                      <input className={styles.input} type="email" value={form.Email}
                        onChange={e => setForm(p => ({ ...p, Email: e.target.value }))} />
                    </div>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Nueva contraseña (dejar vacío para no cambiar)</label>
                    <input className={styles.input} type="password" placeholder="••••••••" value={form.Password}
                      onChange={e => setForm(p => ({ ...p, Password: e.target.value }))} />
                  </div>
                  <div className={styles.formActions}>
                    <button type="button" className={styles.cancelBtn} onClick={() => setEditing(false)}>
                      Cancelar
                    </button>
                    <button type="submit" className={styles.saveBtn} disabled={saving}>
                      {saving ? <span className={styles.spinner} /> : null}
                      {saving ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
