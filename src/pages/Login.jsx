import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { Link } from 'react-router-dom'

export default function Login() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const onSubmit = (e) => {
    e.preventDefault()
    // Dummy auth: accept any input
    login(email)
  }

  return (
    <div className="container-limiter max-w-md py-12">
      <h1 className="text-2xl font-semibold mb-6">Masuk</h1>
      <form onSubmit={onSubmit} className="space-y-4 card p-6">
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="you@example.com" />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="••••••••" />
        </div>
        <button className="btn btn-primary w-full" type="submit">Masuk</button>
        <p className="text-sm text-neutral-400">Belum punya akun? <Link className="underline" to="/signup">Daftar</Link></p>
      </form>
    </div>
  )
}
