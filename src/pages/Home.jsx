import React, { useMemo } from 'react'
import Banner from '../components/Banner.jsx'
import CarouselRow from '../components/CarouselRow.jsx'
import movies from '../data/movies.json'

export default function Home() {
  const featured = useMemo(() => movies[0], [])
  const byGenre = useMemo(() => {
    const groups = {}
    for (const m of movies) {
      groups[m.genre] = groups[m.genre] || []
      groups[m.genre].push(m)
    }
    return groups
  }, [])

  const order = ['Action','Drama','Komedi','Horor','Sci-Fi']

  return (
    <div className="container-limiter">
      <Banner movie={featured} />
      {order.map(genre => (
        <CarouselRow key={genre} title={genre} movies={(byGenre[genre]||[]).slice(0,12)} />
      ))}
    </div>
  )
}
