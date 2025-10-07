import React from 'react'

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-neutral-800">
      <div className="container-limiter py-8 text-sm text-neutral-400">
        © {new Date().getFullYear()} CineFlux. Semua hak cipta dilindungi.
      </div>
    </footer>
  )
}
