import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function Banner({ movie }) {
  if (!movie) return null
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative rounded-2xl overflow-hidden mb-8 md:mb-12 shadow-soft"
    >
      <img
        src={movie.backdrop}
        alt={movie.title}
        className="w-full h-[46vh] md:h-[60vh] object-cover object-center opacity-70"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/30 to-transparent" />
      <div className="absolute bottom-0 p-6 md:p-10 max-w-2xl">
        <h2 className="text-2xl md:text-4xl font-semibold mb-3">{movie.title}</h2>
        <p className="text-neutral-300 text-sm md:text-base line-clamp-3 mb-4">{movie.description}</p>
        <div className="flex items-center gap-3">
          <Link to={`/movie/${movie.id}`} className="btn btn-primary">Tonton Sekarang</Link>
          <Link to={`/category/${movie.genre}`} className="btn btn-ghost">Lihat {movie.genre}</Link>
        </div>
      </div>
    </motion.section>
  )
}
