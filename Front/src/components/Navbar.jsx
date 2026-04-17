// src/components/Navbar.jsx
import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import AuthModal from './AuthModal'
import styles from './Navbar.module.css'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [authOpen, setAuthOpen] = useState(false)
  const [authTab, setAuthTab] = useState('login')
  const [dropOpen, setDropOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Hide navbar on full-screen navigation page (hooks must be before early return)
  if (location.pathname === '/navegar') return null

  const openLogin = () => { setAuthTab('login'); setAuthOpen(true); setMobileOpen(false) }
  const openRegister = () => { setAuthTab('register'); setAuthOpen(true); setMobileOpen(false) }
  const handleLogout = () => { logout(); navigate('/'); setDropOpen(false); setMobileOpen(false) }
  const isActive = (path) => location.pathname === path
  const isAdmin = user?.Rol === 'ADMIN'

  const navLinks = user ? [
    { to: '/mapa', label: 'Mapa' },
    { to: '/reservas', label: 'Reservas' },
    { to: '/vehiculos', label: 'Vehículos' },
    { to: '/monedero', label: 'Monedero' },
    ...(isAdmin ? [{ to: '/admin', label: 'Admin' }] : []),
  ] : []

  return (
    <>
      <nav className={styles.nav} role="navigation" aria-label="Navegación principal">
        <Link to={user ? '/mapa' : '/'} className={styles.logo} aria-label="Myparking inicio">
          <svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <path d="M6 10C6 7.79 7.79 6 10 6h12c2.21 0 4 1.79 4 4v8l-4 8H10l-4-8V10z" fill="#D6DEC7"/>
            <text x="16" y="22" textAnchor="middle" fontFamily="DM Serif Display, serif" fontSize="13" fill="#2F5D5B" fontWeight="bold">M</text>
          </svg>
          <span>Myparking</span>
        </Link>

        {user && (
          <div className={styles.links} role="list">
            {navLinks.map(l => (
              <Link key={l.to} to={l.to} className={`${styles.link} ${isActive(l.to) ? styles.active : ''}`} role="listitem">
                {l.label}
              </Link>
            ))}
          </div>
        )}

        <div className={styles.actions}>
          {user ? (
            <div className={styles.userMenu}>
              <button className={styles.userBtn} onClick={() => setDropOpen(!dropOpen)} aria-expanded={dropOpen} aria-haspopup="true" aria-label="Menú de usuario">
                <div className={styles.avatar} aria-hidden="true">{user.Nombre?.charAt(0)}{user.Apellido1?.charAt(0)}</div>
                <span className={styles.userName}>{user.Nombre}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
              </button>
              <AnimatePresence>
                {dropOpen && (
                  <motion.div className={styles.dropdown} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }} role="menu">
                    <Link to="/cuenta" className={styles.dropItem} onClick={() => setDropOpen(false)} role="menuitem">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                      Mi perfil
                    </Link>
                    <Link to="/pago" className={styles.dropItem} onClick={() => setDropOpen(false)} role="menuitem">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
                      Recargar saldo
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" className={`${styles.dropItem} ${styles.adminItem}`} onClick={() => setDropOpen(false)} role="menuitem">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                        Panel Admin
                      </Link>
                    )}
                    <div className={styles.dropDivider} />
                    <button className={`${styles.dropItem} ${styles.dropLogout}`} onClick={handleLogout} role="menuitem">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                      Cerrar sesión
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className={styles.authBtns}>
              <button className={styles.btnGhost} onClick={openLogin}>Entrar</button>
              <button className={styles.btnSolid} onClick={openRegister}>Crear cuenta</button>
            </div>
          )}
          <button className={styles.hamburger} onClick={() => setMobileOpen(!mobileOpen)} aria-expanded={mobileOpen} aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}>
            <span className={`${styles.bar} ${mobileOpen ? styles.barOpen1 : ''}`} />
            <span className={`${styles.bar} ${mobileOpen ? styles.barOpen2 : ''}`} />
            <span className={`${styles.bar} ${mobileOpen ? styles.barOpen3 : ''}`} />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div className={styles.mobileBackdrop} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} aria-hidden="true" />
            <motion.div className={styles.mobileDrawer} initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.25 }} role="dialog" aria-label="Menú móvil">
              {user ? (
                <>
                  <div className={styles.drawerUser}>
                    <div className={styles.drawerAvatar}>{user.Nombre?.charAt(0)}{user.Apellido1?.charAt(0)}</div>
                    <div>
                      <div className={styles.drawerName}>{user.Nombre} {user.Apellido1}</div>
                      <div className={styles.drawerEmail}>{user.Email}</div>
                    </div>
                  </div>
                  <nav className={styles.drawerNav}>
                    {navLinks.map(l => (
                      <Link key={l.to} to={l.to} className={`${styles.drawerLink} ${isActive(l.to) ? styles.drawerLinkActive : ''}`} onClick={() => setMobileOpen(false)}>{l.label}</Link>
                    ))}
                    <Link to="/cuenta" className={styles.drawerLink} onClick={() => setMobileOpen(false)}>Mi perfil</Link>
                    <Link to="/pago" className={styles.drawerLink} onClick={() => setMobileOpen(false)}>Recargar saldo</Link>
                  </nav>
                  <button className={styles.drawerLogout} onClick={handleLogout}>Cerrar sesión</button>
                </>
              ) : (
                <div className={styles.drawerAuth}>
                  <p className={styles.drawerAuthTitle}>Myparking</p>
                  <button className={styles.drawerAuthBtn} onClick={openLogin}>Iniciar sesión</button>
                  <button className={styles.drawerAuthBtnOutline} onClick={openRegister}>Crear cuenta</button>
                </div>
              )}
              <div className={styles.drawerFooter}>
                <Link to="/privacidad" className={styles.drawerFooterLink} onClick={() => setMobileOpen(false)}>Privacidad</Link>
                <Link to="/terminos" className={styles.drawerFooterLink} onClick={() => setMobileOpen(false)}>Términos</Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {dropOpen && <div className={styles.menuBackdrop} onClick={() => setDropOpen(false)} aria-hidden="true" />}
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} initialTab={authTab} />
    </>
  )
}
