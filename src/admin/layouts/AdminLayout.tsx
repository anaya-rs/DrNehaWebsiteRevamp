import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Calendar,
  Image,
  FileText,
  Layout,
  Settings,
  LogOut,
  Menu,
  X,
  Stethoscope,
  HelpCircle,
} from 'lucide-react'
import { authApi } from '../../lib/api'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'
import { useState, useEffect, useCallback } from 'react'

const NAV_ITEMS = [
  { label: 'Dashboard',    icon: LayoutDashboard, to: '/admin/dashboard' },
  { label: 'Appointments', icon: Calendar,         to: '/admin/appointments' },
  { label: 'Gallery',      icon: Image,            to: '/admin/gallery' },
  { label: 'Articles',     icon: FileText,         to: '/admin/blog' },
  { label: 'Specialities', icon: Stethoscope,      to: '/admin/specialities' },
  { label: 'FAQs',         icon: HelpCircle,       to: '/admin/faqs' },
  { label: 'Pages',        icon: Layout,           to: '/admin/pages' },
  { label: 'Settings',     icon: Settings,         to: '/admin/settings' },
]

const HEADER_H = 56   // px
const SIDEBAR_W = 240 // px

// ── Single nav link ─────────────────────────────────────────────
function SidebarLink({
  label, icon: Icon, to, onClick,
}: { label: string; icon: any; to: string; onClick?: () => void }) {
  const [hov, setHov] = useState(false)
  return (
    <NavLink
      to={to}
      onClick={onClick}
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '0.7rem',
        padding: '0.6rem 0.875rem',
        borderRadius: '8px',
        fontSize: '0.875rem',
        fontWeight: 500,
        textDecoration: 'none',
        fontFamily: 'Inter, sans-serif',
        whiteSpace: 'nowrap',
        transition: 'background 0.15s, color 0.15s',
        color: isActive ? '#fff' : hov ? '#fff' : 'rgba(255,255,255,0.72)',
        backgroundColor: isActive ? '#0b6b4e' : hov ? 'rgba(255,255,255,0.09)' : 'transparent',
      })}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <Icon size={17} strokeWidth={1.8} style={{ flexShrink: 0, color: 'inherit' }} />
      {label}
    </NavLink>
  )
}

// ── Sidebar panel (shared by desktop + mobile) ──────────────────
function SidebarPanel({
  admin, onLogout, onLinkClick,
}: { admin: any; onLogout: () => void; onLinkClick?: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#0a2419' }}>
      {/* Brand */}
      <div style={{ padding: '1.5rem 1.25rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
        <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.9375rem', lineHeight: 1.3, fontFamily: 'Inter, sans-serif' }}>
          Dr. Neha Sood
        </div>
        <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.72rem', marginTop: '0.2rem', fontFamily: 'Inter, sans-serif' }}>
          CMS Admin
        </div>
      </div>

      {/* Nav links */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.625rem' }}>
        {NAV_ITEMS.map((item) => (
          <SidebarLink key={item.to} {...item} onClick={onLinkClick} />
        ))}
      </div>

      {/* Footer: email + logout */}
      <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
        {admin?.email && (
          <div style={{
            color: 'rgba(255,255,255,0.38)',
            fontSize: '0.72rem',
            marginBottom: '0.625rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontFamily: 'Inter, sans-serif',
          }}>
            {admin.email}
          </div>
        )}
        <button
          onClick={onLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            color: '#f87171', background: 'none', border: 'none',
            cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500,
            padding: 0, fontFamily: 'Inter, sans-serif',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#fca5a5')}
          onMouseLeave={e => (e.currentTarget.style.color = '#f87171')}
        >
          <LogOut size={15} />
          Logout
        </button>
      </div>
    </div>
  )
}

// ── Main layout ─────────────────────────────────────────────────
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const navigate  = useNavigate()
  const { admin, logout } = useAuthStore()

  const [sidebarOpen, setSidebarOpen] = useState(true)   // desktop default: open
  const [isMobile, setIsMobile]       = useState(false)
  const [drawerOpen, setDrawerOpen]   = useState(false)  // mobile only

  // Detect mobile breakpoint
  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) setSidebarOpen(false) // desktop sidebar state irrelevant on mobile
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Close mobile drawer on ESC
  useEffect(() => {
    if (!drawerOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setDrawerOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [drawerOpen])

  const handleLogout = useCallback(async () => {
    try { await authApi.logout() } catch { /* ignore */ }
    logout()
    toast.success('Logged out')
    navigate('/admin/login')
  }, [logout, navigate])

  const toggleBurger = () => {
    if (isMobile) setDrawerOpen(o => !o)
    else setSidebarOpen(o => !o)
  }

  const isOpen = isMobile ? drawerOpen : sidebarOpen

  return (
    // Wrapper — plain div, no semantic elements that GlobalStyles targets
    <div style={{ fontFamily: 'Inter, sans-serif', minHeight: '100vh', backgroundColor: '#f5faf7' }}>

      {/* ── Top header bar ────────────────────────────────────── */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 200,
        height: HEADER_H,
        backgroundColor: '#0a2419',
        display: 'flex',
        alignItems: 'center',
        padding: '0 1.25rem',
        gap: '0.875rem',
        boxShadow: '0 1px 0 rgba(255,255,255,0.07)',
        flexShrink: 0,
      }}>
        {/* Burger */}
        <button
          onClick={toggleBurger}
          aria-label="Toggle navigation"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 36, height: 36, borderRadius: '8px',
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
            cursor: 'pointer', color: '#fff', flexShrink: 0,
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
        >
          {isOpen && isMobile ? <X size={18} /> : <Menu size={18} />}
        </button>

        {/* Title */}
        <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem', fontFamily: 'Inter, sans-serif', letterSpacing: '0.01em' }}>
          Dr. Neha Sood — Admin
        </span>

        <div style={{ flex: 1 }} />

        {/* Logout (header shortcut) */}
        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            color: 'rgba(255,255,255,0.55)', background: 'none', border: 'none',
            cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500,
            fontFamily: 'Inter, sans-serif', padding: '0.375rem 0.625rem',
            borderRadius: '6px', transition: 'color 0.15s, background 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(248,113,113,0.1)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; e.currentTarget.style.background = 'none' }}
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>

      {/* ── Body (header has already pushed this down) ─────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>

        {/* ── DESKTOP: inline collapsible sidebar ──────────────── */}
        {!isMobile && (
          <div style={{
            width: sidebarOpen ? SIDEBAR_W : 0,
            flexShrink: 0,
            overflow: 'hidden',
            transition: 'width 0.25s ease',
            // Stick to just below header, span full remaining height
            position: 'sticky',
            top: HEADER_H,
            height: `calc(100vh - ${HEADER_H}px)`,
            alignSelf: 'flex-start',
          }}>
            {/* Inner panel — fixed width so content doesn't squash during transition */}
            <div style={{ width: SIDEBAR_W, height: '100%' }}>
              <SidebarPanel admin={admin} onLogout={handleLogout} />
            </div>
          </div>
        )}

        {/* ── MOBILE: slide-over drawer ────────────────────────── */}
        {isMobile && (
          <>
            {/* Backdrop */}
            {drawerOpen && (
              <div
                onClick={() => setDrawerOpen(false)}
                style={{
                  position: 'fixed', inset: 0, zIndex: 190,
                  backgroundColor: 'rgba(0,0,0,0.45)',
                }}
              />
            )}
            {/* Drawer */}
            <div style={{
              position: 'fixed',
              top: HEADER_H,
              left: 0,
              bottom: 0,
              width: SIDEBAR_W,
              zIndex: 195,
              transform: drawerOpen ? 'translateX(0)' : `translateX(-${SIDEBAR_W}px)`,
              transition: 'transform 0.25s ease',
            }}>
              <SidebarPanel
                admin={admin}
                onLogout={handleLogout}
                onLinkClick={() => setDrawerOpen(false)}
              />
            </div>
          </>
        )}

        {/* ── Main content ────────────────────────────────────── */}
        <div style={{
          flex: 1,
          minWidth: 0,
          padding: '2rem',
          minHeight: `calc(100vh - ${HEADER_H}px)`,
        }}>
          {children}
        </div>
      </div>
    </div>
  )
}
