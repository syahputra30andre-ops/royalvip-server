import React from 'react'
import { Routes, Route, useLocation, Link } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import Category from './pages/Category.jsx'
import MovieDetail from './pages/MovieDetail.jsx'
import { AnimatePresence, motion } from 'framer-motion'

function PageWrapper({ children }) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="min-h-[70vh]"
    >
      {children}
    </motion.main>
  )
}

export default function App() {
  const location = useLocation()
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <AnimatePresence mode="wait">
        <PageWrapper key={location.pathname}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/category/:genre" element={<Category />} />
            <Route path="/movie/:id" element={<MovieDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </PageWrapper>
      </AnimatePresence>
      <Footer />
    </div>
  )
}

function NotFound() {
  return (
    <div className="container-limiter py-12">
      <h1 className="text-2xl font-semibold mb-2">Halaman tidak ditemukan</h1>
      <Link className="btn btn-primary mt-4" to="/">Kembali ke Home</Link>
    </div>
  )
}
