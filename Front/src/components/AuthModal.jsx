// src/components/AuthModal.jsx
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useGoogleLogin } from '@react-oauth/google'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import styles from './AuthModal.module.css'

export default function AuthModal({ isOpen, onClose, initialTab = 'login' }) {
  const [tab, setTab] = useState(initialTab)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const { login, register, loginWithGoogle } = useAuth()
  const navigate = useNavigate()

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPass, setLoginPass] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)

  const [regData, setRegData] = useState({
    Nombre: '', Apellido1: '', Apellido2: '', Email: '', Password: ''
  })

  useEffect(() => { setTab(initialTab) }, [initialTab])
  useEffect(() => {
    if (!isOpen) {
      setLoginEmail(''); setLoginPass('')
      setRegData({ Nombre:'',Apellido1:'',Apellido2:'',Email:'',Password:'' })
      setAcceptTerms(false)
    }
  }, [isOpen])

  const afterLogin = (me) => {
    toast.success(`¡Bienvenido, ${me.Nombre}!`)
    onClose()
    navigate('/mapa')
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!loginEmail || !loginPass) { toast.error('Rellena todos los campos'); return }
    setLoading(true)
    try {
      const me = await login(loginEmail, loginPass)
      afterLogin(me)
    } catch (err) {
      toast.error(err.message || 'Credenciales incorrectas')
    } finally { setLoading(false) }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    const { Nombre, Apellido1, Email, Password } = regData
    if (!Nombre || !Apellido1 || !Email || !Password) { toast.error('Rellena los campos obligatorios'); return }
    if (Password.length < 6) { toast.error('La contraseña debe tener al menos 6 caracteres'); return }
    if (!acceptTerms) { toast.error('Debes aceptar los términos y la política de privacidad'); return }
    setLoading(true)
    try {
      await register(regData)
      toast.success('¡Cuenta creada!')
      onClose()
      navigate('/bienvenida')
    } catch (err) {
      toast.error(err.message || 'Error al crear la cuenta')
    } finally { setLoading(false) }
  }

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true)
      try {
        // Get user info from Google
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        }).then(r => r.json())

        // Try backend Google login
        try {
          const { me, isNew } = await loginWithGoogle(tokenResponse.access_token)
          toast.success(`¡Bienvenido, ${me.Nombre}!`)
          onClose()
          navigate(isNew ? '/bienvenida' : '/mapa')
        } catch {
          // Backend doesn't support Google yet — show info
          toast.error('El servidor no tiene Google Auth configurado. Regístrate con email.')
        }
      } catch {
        toast.error('Error al conectar con Google')
      } finally { setGoogleLoading(false) }
    },
    onError: () => toast.error('Error al conectar con Google'),
  })

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
          role="dialog"
          aria-modal="true"
          aria-label={tab === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
        >
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.22 }}
          >
            <button className={styles.close} onClick={onClose} aria-label="Cerrar modal">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>

            <div className={styles.header}>
              <div className={styles.logoMark}>
                <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                  <path d="M6 10C6 7.79 7.79 6 10 6h12c2.21 0 4 1.79 4 4v8l-4 8H10l-4-8V10z" fill="#2F5D5B"/>
                  <text x="16" y="22" textAnchor="middle" fontFamily="DM Serif Display, serif" fontSize="13" fill="#D6DEC7" fontWeight="bold">M</text>
                </svg>
              </div>
              <h2 className={styles.title}>
                {tab === 'login' ? 'Bienvenido' : 'Crea tu cuenta'}
              </h2>
              <p className={styles.sub}>
                {tab === 'login' ? 'Accede a tu cuenta de Myparking' : 'Únete a Myparking, es gratis'}
              </p>
            </div>

            {/* Google button */}
            <button
              className={styles.googleBtn}
              onClick={() => googleLogin()}
              disabled={googleLoading || loading}
              type="button"
            >
              {googleLoading ? <span className={styles.spinner} /> : (
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              {tab === 'login' ? 'Continuar con Google' : 'Registrarse con Google'}
            </button>

            <div className={styles.divider}>
              <div className={styles.dividerLine} />
              <span className={styles.dividerText}>o</span>
              <div className={styles.dividerLine} />
            </div>

            <div className={styles.tabs}>
              <button className={`${styles.tab} ${tab === 'login' ? styles.tabActive : ''}`} onClick={() => setTab('login')}>
                Iniciar sesión
              </button>
              <button className={`${styles.tab} ${tab === 'register' ? styles.tabActive : ''}`} onClick={() => setTab('register')}>
                Crear cuenta
              </button>
            </div>

            {tab === 'login' ? (
              <form onSubmit={handleLogin} className={styles.form} noValidate>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="login-email">Email</label>
                  <input
                    id="login-email"
                    className={styles.input}
                    type="email"
                    placeholder="tu@email.com"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="login-pass">Contraseña</label>
                  <input
                    id="login-pass"
                    className={styles.input}
                    type="password"
                    placeholder="••••••••"
                    value={loginPass}
                    onChange={e => setLoginPass(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </div>
                <button className={styles.submit} type="submit" disabled={loading}>
                  {loading ? <span className={styles.spinner} /> : null}
                  {loading ? 'Entrando...' : 'Entrar'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className={styles.form} noValidate>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="reg-nombre">Nombre *</label>
                    <input id="reg-nombre" className={styles.input} placeholder="Ana" value={regData.Nombre} onChange={e => setRegData(p => ({...p, Nombre: e.target.value}))} required />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="reg-ap1">Apellido 1 *</label>
                    <input id="reg-ap1" className={styles.input} placeholder="García" value={regData.Apellido1} onChange={e => setRegData(p => ({...p, Apellido1: e.target.value}))} required />
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="reg-ap2">Apellido 2</label>
                  <input id="reg-ap2" className={styles.input} placeholder="López (opcional)" value={regData.Apellido2} onChange={e => setRegData(p => ({...p, Apellido2: e.target.value}))} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="reg-email">Email *</label>
                  <input id="reg-email" className={styles.input} type="email" placeholder="tu@email.com" value={regData.Email} onChange={e => setRegData(p => ({...p, Email: e.target.value}))} autoComplete="email" required />
                </div>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="reg-pass">Contraseña * (mín. 6 caracteres)</label>
                  <input id="reg-pass" className={styles.input} type="password" placeholder="••••••••" value={regData.Password} onChange={e => setRegData(p => ({...p, Password: e.target.value}))} autoComplete="new-password" required />
                </div>
                <label className={styles.checkLabel}>
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={e => setAcceptTerms(e.target.checked)}
                    className={styles.checkbox}
                  />
                  <span>
                    Acepto los{' '}
                    <a href="/terminos" target="_blank" className={styles.link}>Términos de servicio</a>
                    {' '}y la{' '}
                    <a href="/privacidad" target="_blank" className={styles.link}>Política de privacidad</a>
                  </span>
                </label>
                <button className={styles.submit} type="submit" disabled={loading}>
                  {loading ? <span className={styles.spinner} /> : null}
                  {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
