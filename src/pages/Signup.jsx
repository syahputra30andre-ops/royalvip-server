import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useNavigate, Link } from 'react-router-dom'

export default function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [err, setErr] = useState('')

  const onSubmit = (e) => {
    e.preventDefault()
    if (password !== confirm) return setErr('Konfirmasi password tidak cocok.')
    signup(email)
    navigate('/login')
  }

  return (
    <div className="container-limiter max-w-md py-12">
      <h1 className="text-2xl font-semibold mb-6">Daftar</h1>
      <form onSubmit={onSubmit} className="space-y-4 card p-6">
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="you@example.com" />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="••••••••" />
        </div>
        <div>
          <label className="label">Konfirmasi Password</label>
          <input className="input" type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} required placeholder="••••••••" />
        </div>
        {err && <p className="text-sm text-red-400">{err}</p>}
        <button className="btn btn-primary w-full" type="submit">Daftar</button>
        <p className="text-sm text-neutral-400">Sudah punya akun? <Link className="underline" to="/login">Masuk</Link></p>
      </form>
    </div>
  )
}
