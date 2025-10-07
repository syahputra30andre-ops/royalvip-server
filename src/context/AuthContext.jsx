import React, { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('cf_user')
    return raw ? JSON.parse(raw) : null
  })
  const navigate = useNavigate()

  useEffect(() => {
    if (user) localStorage.setItem('cf_user', JSON.stringify(user))
    else localStorage.removeItem('cf_user')
  }, [user])

  const login = (email) => {
    setUser({ email })
    navigate('/')
  }
  const logout = () => {
    setUser(null)
    navigate('/login')
  }
  const signup = (email) => {
    // Dummy: optionally store into localStorage list
    const list = JSON.parse(localStorage.getItem('cf_users') || '[]')
    if (!list.includes(email)) {
      list.push(email)
      localStorage.setItem('cf_users', JSON.stringify(list))
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
