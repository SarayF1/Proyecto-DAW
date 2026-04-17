// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi, meApi } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('mp_token'))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(!!localStorage.getItem('mp_token'))
  const [isNewUser, setIsNewUser] = useState(false)

  const fetchMe = useCallback(async () => {
    try {
      const data = await meApi.getMe()
      setUser(data)
    } catch {
      logout()
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (token) fetchMe()
    else setLoading(false)
  }, [token, fetchMe])

  const _setSession = (tok) => {
    localStorage.setItem('mp_token', tok)
    setToken(tok)
  }

  const login = async (email, password) => {
    const data = await authApi.login(email, password)
    _setSession(data.token)
    const me = await meApi.getMe()
    setUser(me)
    setIsNewUser(false)
    return me
  }

  const register = async (payload) => {
    await authApi.register(payload)
    const data = await authApi.login(payload.Email, payload.Password)
    _setSession(data.token)
    const me = await meApi.getMe()
    setUser(me)
    setIsNewUser(true)
    return me
  }

  const loginWithGoogle = async (credential) => {
    try {
      const data = await authApi.googleLogin(credential)
      _setSession(data.token)
      const me = await meApi.getMe()
      setUser(me)
      setIsNewUser(data.isNew ?? false)
      return { me, isNew: data.isNew ?? false }
    } catch {
      throw new Error('Google login no está configurado en el servidor aún. Usa email y contraseña.')
    }
  }

  const logout = () => {
    localStorage.removeItem('mp_token')
    setToken(null)
    setUser(null)
    setIsNewUser(false)
  }

  const refreshUser = () => fetchMe()
  const clearNewUser = () => setIsNewUser(false)

  return (
    <AuthContext.Provider value={{
      token, user, loading, isNewUser,
      login, register, loginWithGoogle, logout, refreshUser, clearNewUser
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
