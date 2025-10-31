import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import HallOfChampions from './pages/HallOfChampions'
import Admin from './pages/Admin'
import DarkVeil from './shared/DarkVeil'

function App() {
  return (
    <Router>
      <div className="app">
        <div className="bg-liquid" aria-hidden>
          <DarkVeil
            hueShift={45}
            noiseIntensity={0}
            scanlineIntensity={0}
            speed={0.3}
            scanlineFrequency={0}
            warpAmount={0.8}
            resolutionScale={1}
          />
        </div>
        <nav className="navbar">
          <div className="nav-container">
            <Link to="/" className="nav-logo">
              TokenChamp
            </Link>
            <div className="nav-menu">
              <Link to="/" className="nav-link">Home</Link>
              <Link to="/register" className="nav-link">Register</Link>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              <Link to="/hall-of-champions" className="nav-link">Hall of Champions</Link>
              <Link to="/admin" className="nav-link">Admin</Link>
              <a href="mailto:contact@tokenchamp.app" className="cta-link">Get in Touch</a>
            </div>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/hall-of-champions" element={<HallOfChampions />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App

