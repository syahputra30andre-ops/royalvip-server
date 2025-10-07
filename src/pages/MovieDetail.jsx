import React from 'react'
import { useParams, Link } from 'react-router-dom'
import movies from '../data/movies.json'

export default function MovieDetail() {
  const { id } = useParams()
  const movie = movies.find(m => String(m.id) === String(id))

  if (!movie) return (
    <div className="container-limiter py-12">
      <p>Film tidak ditemukan.</p>
      <Link to="/" className="btn btn-ghost mt-4">Kembali</Link>
    </div>
  )

  return (
    <div className="container-limiter py-6 md:py-10">
      <div className="grid md:grid-cols-3 gap-6">
        <img src={movie.poster} alt={movie.title} className="rounded-2xl w-full object-cover" />
        <div className="md:col-span-2">
          <h1 className="text-3xl font-semibold mb-2">{movie.title}</h1>
          <p className="text-neutral-400 mb-4">{movie.genre} • ⭐ {movie.rating}</p>
          <p className="text-neutral-200 mb-6">{movie.description}</p>
          <button className="btn btn-primary">Tonton Sekarang</button>
          <Link to={`/category/${movie.genre}`} className="btn btn-ghost ml-2">Lihat genre {movie.genre}</Link>
        </div>
      </div>
    </div>
  )
}
