import React from 'react'
import { useParams, Link } from 'react-router-dom'
import movies from '../data/movies.json'
import MovieCard from '../components/MovieCard.jsx'

export default function Category() {
  const { genre } = useParams()
  const list = movies.filter(m => m.genre.toLowerCase() === genre.toLowerCase())

  return (
    <div className="container-limiter py-6 md:py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Kategori: {genre}</h1>
        <Link to="/" className="btn btn-ghost">Kembali ke Home</Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {list.map(m => <MovieCard key={m.id} movie={m} />)}
      </div>
      {list.length === 0 && <p className="text-neutral-400 mt-6">Tidak ada film untuk genre ini.</p>}
    </div>
  )
}
