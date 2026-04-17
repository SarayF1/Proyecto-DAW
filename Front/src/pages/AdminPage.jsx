// src/pages/AdminPage.jsx
// Only these 4 backend routes exist on the deployed server:
//   GET /admin/estadisticas
//   GET /admin/reservas-activas   shape: { idReserva, Estado, usuario_nombre, zona_nombre, idPlaza… }
//   GET /admin/reservas-por-zona
//   PUT /admin/reservas/:id/finalizar
//
// Plazas: falls back to public GET /plazas (read-only)
// Usuarios: shows "not deployed" banner with retry — no silent crash
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { adminApi } from '../api/client'
import styles from './AdminPage.module.css'

const TABS = ['Dashboard', 'Usuarios', 'Plazas', 'Reservas']

const normalise = (r) => ({
  idReserva:   r.idReserva,
  Estado:      r.Estado,
  Fecha_inicio:r.Fecha_inicio,
  Fecha_fin:   r.Fecha_fin,
  idPlaza:     r.idPlaza,
  Nombre:      r.usuario_nombre  ?? r.Nombre    ?? '–',
  Apellido1:   r.usuario_apellido1 ?? r.Apellido1 ?? '',
  Zona:        r.zona_nombre     ?? r.Zona      ?? '–',
})

export default function AdminPage() {
  const [tab,            setTab]            = useState('Dashboard')
  const [stats,          setStats]          = useState(null)
  const [reservasActivas,setReservasActivas]= useState([])
  const [reservasPorZona,setReservasPorZona]= useState([])
  const [usuarios,       setUsuarios]       = useState([])
  const [usuariosErr,    setUsuariosErr]    = useState(null)
  const [plazas,         setPlazas]         = useState([])
  const [plazasErr,      setPlazasErr]      = useState(null)
  const [todasReservas,  setTodasReservas]  = useState([])
  const [dashLoading,    setDashLoading]    = useState(true)
  const [tabLoading,     setTabLoading]     = useState(false)
  const [editUsuario,    setEditUsuario]    = useState(null)
  const [editPlaza,      setEditPlaza]      = useState(null)
  const [finalising,     setFinalising]     = useState(null)

  const loadDashboard = useCallback(async () => {
    setDashLoading(true)
    const [s, ra, rpz] = await Promise.allSettled([
      adminApi.getEstadisticas(),
      adminApi.getReservasActivas(),
      adminApi.getReservasPorZona(),
    ])
    if (s.status   === 'fulfilled') setStats(s.value)
    if (ra.status  === 'fulfilled') setReservasActivas((Array.isArray(ra.value) ? ra.value : []).map(normalise))
    if (rpz.status === 'fulfilled') setReservasPorZona(Array.isArray(rpz.value) ? rpz.value : [])
    setDashLoading(false)
  }, [])

  useEffect(() => { loadDashboard() }, [loadDashboard])

  const loadUsuarios = useCallback(async () => {
    setTabLoading(true); setUsuariosErr(null)
    try {
      const d = await adminApi.getUsuarios()
      setUsuarios(Array.isArray(d) ? d : [])
    } catch (err) {
      setUsuariosErr(err.message || 'La ruta /api/admin/usuarios no está implementada en el servidor.')
    } finally { setTabLoading(false) }
  }, [])

  const loadPlazas = useCallback(async () => {
    setTabLoading(true); setPlazasErr(null)
    try {
      const d = await adminApi.getPlazasAdmin()   // → GET /plazas (public, always works)
      setPlazas(Array.isArray(d) ? d : [])
    } catch (err) { setPlazasErr(err.message) }
    finally { setTabLoading(false) }
  }, [])

  const loadReservas = useCallback(async () => {
    setTabLoading(true)
    try {
      const d = await adminApi.getAllReservas()    // → GET /admin/reservas-activas
      setTodasReservas((Array.isArray(d) ? d : []).map(normalise))
    } catch { toast.error('Error cargando reservas') }
    finally { setTabLoading(false) }
  }, [])

  const handleTabChange = (t) => {
    setTab(t)
    if (t === 'Usuarios' && !usuarios.length && !usuariosErr) loadUsuarios()
    if (t === 'Plazas'   && !plazas.length   && !plazasErr)   loadPlazas()
    if (t === 'Reservas' && !todasReservas.length)             loadReservas()
  }

  const handleFinalizar = async (id) => {
    setFinalising(id)
    try { await adminApi.finalizarReserva(id); toast.success('Reserva finalizada'); loadDashboard(); if (tab==='Reservas') loadReservas() }
    catch (err) { toast.error(err.message || 'Error') }
    finally { setFinalising(null) }
  }

  const handleDeleteUsuario = async (id) => {
    if (!confirm('¿Eliminar este usuario?')) return
    try { await adminApi.deleteUsuario(id); toast.success('Usuario eliminado'); setUsuarios(u => u.filter(x=>x.idUsuario!==id)) }
    catch (err) { toast.error(err.message || 'Endpoint no disponible en el servidor actual') }
  }

  const handleSaveUsuario = async (e) => {
    e.preventDefault()
    try { await adminApi.updateUsuario(editUsuario.idUsuario, editUsuario); toast.success('Guardado'); setEditUsuario(null); loadUsuarios() }
    catch (err) { toast.error(err.message || 'Endpoint no disponible') }
  }

  const handleSavePlaza = async (e) => {
    e.preventDefault()
    try { await adminApi.updatePlaza(editPlaza.idPlaza, {Estado_Plaza: editPlaza.Estado_Plaza}); toast.success('Guardado'); setEditPlaza(null); loadPlazas() }
    catch (err) { toast.error(err.message || 'Endpoint no disponible') }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:.4}}>
          <h1 className={styles.pageTitle}>Panel de administración</h1>
          <p className={styles.pageSub}>Gestión del sistema Myparking</p>
        </motion.div>

        <div className={styles.tabs} role="tablist">
          {TABS.map(t=>(
            <button key={t} className={`${styles.tab} ${tab===t?styles.tabActive:''}`}
              onClick={()=>handleTabChange(t)} role="tab" aria-selected={tab===t}>{t}</button>
          ))}
        </div>

        {/* ── DASHBOARD ── */}
        {tab==='Dashboard' && (
          <div role="tabpanel">
            {dashLoading
              ? <div className={styles.loading}><span className={styles.spinner}/>Cargando…</div>
              : <>
                  {stats && (
                    <div className={styles.statsGrid}>
                      {[
                        {label:'Reservas activas',  v:stats.reservas_activas,  cls:styles.statGreen},
                        {label:'Plazas libres',      v:stats.plazas_libres,     cls:styles.statBlue},
                        {label:'Plazas ocupadas',    v:stats.plazas_ocupadas,   cls:styles.statOrange},
                        {label:'Clientes',           v:stats.total_clientes,    cls:''},
                        {label:'Ingresos hoy',       v:`${Number(stats.ingresos_hoy??0).toFixed(2)} €`, cls:styles.statGreen},
                        {label:'Reservas caducadas', v:stats.reservas_caducadas,cls:styles.statRed},
                      ].map(s=>(
                        <motion.div key={s.label} className={`${styles.statCard} ${s.cls}`}
                          initial={{opacity:0,y:12}} animate={{opacity:1,y:0}}>
                          <div className={styles.statVal}>{s.v??'–'}</div>
                          <div className={styles.statLbl}>{s.label}</div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  <div className={styles.sectionHead}>
                    <h2 className={styles.sectionTitle}>Reservas en curso</h2>
                    <button className={styles.refreshBtn} onClick={loadDashboard}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><path d="M1 4v6h6"/><path d="M23 20v-6h-6"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>
                      Actualizar
                    </button>
                  </div>

                  <div className={styles.tableWrap}>
                    <table className={styles.table}>
                      <thead><tr><th>ID</th><th>Usuario</th><th>Zona</th><th>Plaza</th><th>Inicio</th><th>Fin</th><th>Estado</th><th>Acción</th></tr></thead>
                      <tbody>
                        {reservasActivas.length===0
                          ? <tr><td colSpan={8} className={styles.emptyCell}>No hay reservas activas</td></tr>
                          : reservasActivas.map(r=>(
                            <tr key={r.idReserva}>
                              <td>#{r.idReserva}</td>
                              <td>{r.Nombre} {r.Apellido1}</td>
                              <td>{r.Zona}</td>
                              <td>#{r.idPlaza}</td>
                              <td className={styles.dateCell}>{r.Fecha_inicio?format(new Date(r.Fecha_inicio),'dd/MM HH:mm',{locale:es}):'–'}</td>
                              <td className={styles.dateCell}>{r.Fecha_fin?format(new Date(r.Fecha_fin),'dd/MM HH:mm',{locale:es}):'–'}</td>
                              <td><span className={`${styles.badge} ${styles.badgeGreen}`}>{r.Estado}</span></td>
                              <td><button className={styles.actionBtn} onClick={()=>handleFinalizar(r.idReserva)} disabled={finalising===r.idReserva}>{finalising===r.idReserva?<span className={styles.spinnerSm}/>:'Finalizar'}</button></td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>

                  {reservasPorZona.length>0 && (
                    <>
                      <h2 className={styles.sectionTitle} style={{marginTop:'2rem'}}>Ocupación por zona</h2>
                      <div className={styles.zonasGrid}>
                        {reservasPorZona.map(z=>(
                          <div key={z.idZona} className={styles.zonaCard}>
                            <div className={styles.zonaCardName}>{z.zona_nombre}</div>
                            <div className={styles.zonaCardLoc}>{z.Localidad}</div>
                            <div className={styles.zonaCardStats}>
                              <span>{z.total_reservas??0} reservas</span>
                              <span>{z.reservas_activas??0} activas</span>
                              <span>{z.usuarios_unicos??0} usuarios</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
            }
          </div>
        )}

        {/* ── USUARIOS ── */}
        {tab==='Usuarios' && (
          <div role="tabpanel">
            {tabLoading
              ? <div className={styles.loading}><span className={styles.spinner}/>Cargando usuarios…</div>
              : usuariosErr
                ? <NotDeployed route="/api/admin/usuarios" error={usuariosErr} onRetry={loadUsuarios}/>
                : <div className={styles.tableWrap}>
                    <table className={styles.table}>
                      <thead><tr><th>ID</th><th>Nombre</th><th>Email</th><th>Rol</th><th>Acciones</th></tr></thead>
                      <tbody>
                        {usuarios.length===0
                          ? <tr><td colSpan={5} className={styles.emptyCell}>Sin usuarios</td></tr>
                          : usuarios.map(u=>(
                            <tr key={u.idUsuario}>
                              <td>#{u.idUsuario}</td>
                              <td>{u.Nombre} {u.Apellido1}</td>
                              <td className={styles.emailCell}>{u.Email}</td>
                              <td><span className={`${styles.badge} ${u.Rol==='ADMIN'?styles.badgeOrange:styles.badgeBlue}`}>{u.Rol}</span></td>
                              <td className={styles.actionCell}>
                                <button className={styles.editBtn} onClick={()=>setEditUsuario({...u})}>Editar</button>
                                <button className={styles.deleteBtn} onClick={()=>handleDeleteUsuario(u.idUsuario)} disabled={u.Rol==='ADMIN'}>Eliminar</button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
            }
          </div>
        )}

        {/* ── PLAZAS ── */}
        {tab==='Plazas' && (
          <div role="tabpanel">
            {tabLoading
              ? <div className={styles.loading}><span className={styles.spinner}/>Cargando plazas…</div>
              : plazasErr
                ? <NotDeployed route="/api/plazas" error={plazasErr} onRetry={loadPlazas}/>
                : <>
                    <p className={styles.sectionHint}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      Datos vía <code>GET /api/plazas</code>. Cambios de estado requieren <code>PUT /admin/plazas/:id</code> en el backend.
                    </p>
                    <div className={styles.tableWrap}>
                      <table className={styles.table}>
                        <thead><tr><th>ID</th><th>Zona</th><th>Localidad</th><th>Tarifa</th><th>Estado</th><th>Acción</th></tr></thead>
                        <tbody>
                          {plazas.length===0
                            ? <tr><td colSpan={6} className={styles.emptyCell}>Sin plazas</td></tr>
                            : plazas.map(p=>(
                              <tr key={p.idPlaza}>
                                <td>#{p.idPlaza}</td>
                                <td>{p.zona??'–'}</td>
                                <td>{p.Localidad??'–'}</td>
                                <td>{p.Tarifa?`${Number(p.Tarifa).toFixed(2)} €/h`:'–'}</td>
                                <td><span className={`${styles.badge} ${p.Estado_Plaza==='LIBRE'?styles.badgeGreen:styles.badgeRed}`}>{p.Estado_Plaza}</span></td>
                                <td><button className={styles.editBtn} onClick={()=>setEditPlaza({...p})}>Cambiar</button></td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </>
            }
          </div>
        )}

        {/* ── RESERVAS ── */}
        {tab==='Reservas' && (
          <div role="tabpanel">
            {tabLoading
              ? <div className={styles.loading}><span className={styles.spinner}/>Cargando…</div>
              : <>
                  <p className={styles.sectionHint}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    Reservas <strong>EN CURSO</strong> vía <code>GET /admin/reservas-activas</code>.
                  </p>
                  <div className={styles.tableWrap}>
                    <table className={styles.table}>
                      <thead><tr><th>ID</th><th>Usuario</th><th>Zona</th><th>Plaza</th><th>Inicio</th><th>Fin</th><th>Estado</th><th>Acción</th></tr></thead>
                      <tbody>
                        {todasReservas.length===0
                          ? <tr><td colSpan={8} className={styles.emptyCell}>No hay reservas activas</td></tr>
                          : todasReservas.map(r=>(
                            <tr key={r.idReserva}>
                              <td>#{r.idReserva}</td>
                              <td>{r.Nombre} {r.Apellido1}</td>
                              <td>{r.Zona}</td>
                              <td>#{r.idPlaza}</td>
                              <td className={styles.dateCell}>{r.Fecha_inicio?format(new Date(r.Fecha_inicio),'dd/MM HH:mm',{locale:es}):'–'}</td>
                              <td className={styles.dateCell}>{r.Fecha_fin?format(new Date(r.Fecha_fin),'dd/MM HH:mm',{locale:es}):'–'}</td>
                              <td><span className={`${styles.badge} ${r.Estado==='EN CURSO'?styles.badgeGreen:styles.badgeBlue}`}>{r.Estado}</span></td>
                              <td>{r.Estado==='EN CURSO'&&<button className={styles.actionBtn} onClick={()=>handleFinalizar(r.idReserva)} disabled={finalising===r.idReserva}>{finalising===r.idReserva?<span className={styles.spinnerSm}/>:'Finalizar'}</button>}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </>
            }
          </div>
        )}
      </div>

      {/* Edit Usuario */}
      <AnimatePresence>
        {editUsuario&&(
          <motion.div className={styles.modalOverlay} onClick={e=>e.target===e.currentTarget&&setEditUsuario(null)} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
            <motion.div className={styles.modal} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
              <button className={styles.modalClose} onClick={()=>setEditUsuario(null)}>✕</button>
              <h3 className={styles.modalTitle}>Editar usuario #{editUsuario.idUsuario}</h3>
              <form onSubmit={handleSaveUsuario} className={styles.editForm}>
                <div className={styles.editRow}>
                  <div className={styles.editField}><label className={styles.editLabel}>Nombre</label><input className={styles.editInput} value={editUsuario.Nombre||''} onChange={e=>setEditUsuario(p=>({...p,Nombre:e.target.value}))}/></div>
                  <div className={styles.editField}><label className={styles.editLabel}>Apellido</label><input className={styles.editInput} value={editUsuario.Apellido1||''} onChange={e=>setEditUsuario(p=>({...p,Apellido1:e.target.value}))}/></div>
                </div>
                <div className={styles.editField}><label className={styles.editLabel}>Email</label><input className={styles.editInput} type="email" value={editUsuario.Email||''} onChange={e=>setEditUsuario(p=>({...p,Email:e.target.value}))}/></div>
                <div className={styles.editField}><label className={styles.editLabel}>Rol</label>
                  <select className={styles.editInput} value={editUsuario.Rol||'CLIENTE'} onChange={e=>setEditUsuario(p=>({...p,Rol:e.target.value}))}>
                    <option value="CLIENTE">CLIENTE</option><option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <div className={styles.editActions}>
                  <button type="button" className={styles.cancelBtn} onClick={()=>setEditUsuario(null)}>Cancelar</button>
                  <button type="submit" className={styles.saveBtn}>Guardar</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Plaza */}
      <AnimatePresence>
        {editPlaza&&(
          <motion.div className={styles.modalOverlay} onClick={e=>e.target===e.currentTarget&&setEditPlaza(null)} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
            <motion.div className={styles.modal} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
              <button className={styles.modalClose} onClick={()=>setEditPlaza(null)}>✕</button>
              <h3 className={styles.modalTitle}>Plaza #{editPlaza.idPlaza}</h3>
              <form onSubmit={handleSavePlaza} className={styles.editForm}>
                <div className={styles.editField}><label className={styles.editLabel}>Estado</label>
                  <select className={styles.editInput} value={editPlaza.Estado_Plaza} onChange={e=>setEditPlaza(p=>({...p,Estado_Plaza:e.target.value}))}>
                    <option value="LIBRE">LIBRE</option><option value="EN USO">EN USO</option>
                  </select>
                </div>
                <p style={{fontSize:'0.72rem',color:'var(--teal-dark)',opacity:.6,margin:0}}>Requiere <code>PUT /admin/plazas/:id</code> en el backend.</p>
                <div className={styles.editActions}>
                  <button type="button" className={styles.cancelBtn} onClick={()=>setEditPlaza(null)}>Cancelar</button>
                  <button type="submit" className={styles.saveBtn}>Guardar</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── "Not deployed" banner component ───────────────────────────────────────────
function NotDeployed({ route, error, onRetry }) {
  return (
    <div className={styles.notDeployedBanner}>
      <div className={styles.ndbIcon}>⚠️</div>
      <div className={styles.ndbBody}>
        <div className={styles.ndbTitle}>Ruta no disponible en el servidor desplegado</div>
        <div className={styles.ndbDesc}>
          El endpoint <code>{route}</code> no existe en el backend actual.<br/>
          Consulta <strong>BACKEND_ADDITIONS.md</strong> para implementarlo.
        </div>
        {error && <div className={styles.ndbError}>{error}</div>}
      </div>
      <button className={styles.ndbRetryBtn} onClick={onRetry}>Reintentar</button>
    </div>
  )
}
