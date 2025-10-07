import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function MovieCard({ movie }) {
  return (
    <motion.div whileHover={{ scale: 1.03 }} className="card group">
      <div className="relative">
        <img src={movie.poster} alt={movie.title} className="w-full aspect-[2/3] object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="p-3">
        <h3 className="font-medium text-sm line-clamp-1">{movie.title}</h3>
        <div className="flex items-center justify-between text-xs text-neutral-400 mt-1">
          <span>{movie.genre}</span>
          <span>⭐ {movie.rating}</span>
        </div>
        <Link to={`/movie/${movie.id}`} className="btn btn-primary w-full mt-3">Tonton Sekarang</Link>
      </div>
    </motion.div>
  )
}
