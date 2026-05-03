'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Nav() {
  const [scrolled, setScrolled]   = useState(false)
  const [menuOpen, setMenuOpen]   = useState(false)
  const [clickCount, setClickCount] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Reset click count after 2 seconds of inactivity
  useEffect(() => {
    if (clickCount === 0) return
    const timer = setTimeout(() => setClickCount(0), 2000)
    return () => clearTimeout(timer)
  }, [clickCount])

  const handleSpacerClick = () => {
    const nextCount = clickCount + 1
    if (nextCount === 4) {
      router.push('/admin')
      setClickCount(0)
    } else {
      setClickCount(nextCount)
    }
  }

  const openMenu = () => {
    setMenuOpen(true)
    document.body.style.overflow = 'hidden'
  }

  const closeMenu = () => {
    setMenuOpen(false)
    document.body.style.overflow = ''
  }

  const toggle = () => (menuOpen ? closeMenu() : openMenu())

  return (
    <>
      <header className={`nav-wrapper${scrolled ? ' scrolled' : ''}`}>
        <nav className="nav container">
          <a href="#home" className="logo">
            <svg className="logo__cross" width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true">
              <rect x="11" y="2" width="8" height="26" rx="3" fill="currentColor" />
              <rect x="2" y="11" width="26" height="8" rx="3" fill="currentColor" />
            </svg>
            <span>Kardinal <strong>Pharmacy</strong></span>
          </a>

          <div className="nav__spacer" onClick={handleSpacerClick} />

          <ul className="nav__links" role="list">
            <li><a href="#services">Services</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#products">Products</a></li>
            <li><a href="#location">Location</a></li>
          </ul>

          <a href="#location" className="btn btn--primary nav__cta">Consult Now</a>

          <button
            className={`hamburger${menuOpen ? ' open' : ''}`}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={toggle}
          >
            <span /><span /><span />
          </button>
        </nav>
      </header>

      <div className={`mobile-menu${menuOpen ? ' open' : ''}`} aria-hidden={!menuOpen}>
        <ul role="list">
          <li><a href="#services" onClick={closeMenu}>Services</a></li>
          <li><a href="#about"    onClick={closeMenu}>About</a></li>
          <li><a href="#products" onClick={closeMenu}>Products</a></li>
          <li><a href="#location" onClick={closeMenu}>Location</a></li>
        </ul>
        <a href="#location" className="btn btn--primary" onClick={closeMenu}>Consult Now</a>
      </div>
    </>
  )
}
