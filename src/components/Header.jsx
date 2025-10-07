import React from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { Film, LogIn, LogOut, UserPlus } from 'lucide-react'

export default function Header() {
  const { user, logout } = useAuth()

  const navClass = ({ isActive }) =>
    `px-3 py-2 rounded-xl transition ${isActive ? 'bg-neutral-800 text-white' : 'text-neutral-300 hover:text-white hover:bg-neutral-800/60'}`

  return (
    <header className="sticky top-0 z-50 bg-neutral-950/70 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/50 border-b border-neutral-800">
      <div className="container-limiter flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 font-semibold text-white">
          <Film className="w-6 h-6 text-brand-red" />
          <span className="tracking-tight">CineFlux</span>
        </Link>

        <nav className="hidden md:flex items-center gap-2">
          <NavLink to="/" className={navClass}>Home</NavLink>
          <NavLink to="/category/Action" className={navClass}>Kategori</NavLink>
        </nav>

        <div className="flex items-center gap-2">
          {!user ? (
            <>
              <Link to="/login" className="btn btn-ghost text-sm"><LogIn className="w-4 h-4 mr-2" /> Login</Link>
              <Link to="/signup" className="btn btn-primary text-sm"><UserPlus className="w-4 h-4 mr-2" /> Daftar</Link>
            </>
          ) : (
            <button onClick={logout} className="btn btn-ghost text-sm"><LogOut className="w-4 h-4 mr-2" /> Keluar</button>
          )}
        </div>
      </div>
    </header>
  )
}
