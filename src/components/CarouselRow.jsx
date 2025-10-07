import React, { useRef } from 'react'
import MovieCard from './MovieCard.jsx'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function CarouselRow({ title, movies }) {
  const trackRef = useRef(null)
  const scrollBy = (amount) => {
    trackRef.current?.scrollBy({ left: amount, behavior: 'smooth' })
  }
  return (
    <section className="mb-8 md:mb-12">
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <h3 className="text-lg md:text-xl font-semibold">{title}</h3>
        <div className="hidden md:flex gap-2">
          <button aria-label="Scroll left" onClick={() => scrollBy(-600)} className="btn btn-ghost"><ChevronLeft className="w-4 h-4" /></button>
          <button aria-label="Scroll right" onClick={() => scrollBy(600)} className="btn btn-ghost"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>
      <div ref={trackRef} className="grid grid-flow-col auto-cols-[55%] sm:auto-cols-[42%] md:auto-cols-[22%] gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
        {movies.map(m => (
          <div key={m.id} className="snap-start">
            <MovieCard movie={m} />
          </div>
        ))}
      </div>
    </section>
  )
}
