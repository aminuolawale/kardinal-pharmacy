'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Nav() {
  const [hasScrolled, setHasScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [adminShortcutClicks, setAdminShortcutClicks] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const onScroll = () => setHasScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Keep the hidden admin shortcut intentional by requiring four quick clicks.
  useEffect(() => {
    if (adminShortcutClicks === 0) return
    const timer = setTimeout(() => setAdminShortcutClicks(0), 2000)
    return () => clearTimeout(timer)
  }, [adminShortcutClicks])

  useEffect(() => {
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const handleSpacerClick = () => {
    const nextClickCount = adminShortcutClicks + 1
    if (nextClickCount === 4) {
      router.push('/admin/login')
      setAdminShortcutClicks(0)
    } else {
      setAdminShortcutClicks(nextClickCount)
    }
  }

  const openMenu = () => {
    setIsMenuOpen(true)
    document.body.style.overflow = 'hidden'
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
    document.body.style.overflow = ''
  }

  const toggleMenu = () => (isMenuOpen ? closeMenu() : openMenu())

  return (
    <>
      <header className={`nav-wrapper${hasScrolled ? ' scrolled' : ''}`}>
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
            className={`hamburger${isMenuOpen ? ' open' : ''}`}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            onClick={toggleMenu}
          >
            <span /><span /><span />
          </button>
        </nav>
      </header>

      <div className={`mobile-menu${isMenuOpen ? ' open' : ''}`} aria-hidden={!isMenuOpen}>
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
