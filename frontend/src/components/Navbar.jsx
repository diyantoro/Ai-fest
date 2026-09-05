import React from 'react';
import { Sparkles, LayoutDashboard, Upload, BookOpen, MessageSquare, User, CheckCircle2, Sun, Moon, LogIn, UserCheck } from 'lucide-react';

export function Navbar({ activePage, setActivePage, theme, setTheme, user, onOpenAuth }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'upload', label: 'Tambah Materi', icon: Upload },
    { id: 'review', label: 'Review', icon: BookOpen },
    { id: 'chat', label: 'AI Chat', icon: MessageSquare },
    { id: 'profile', label: 'Profil', icon: User }
  ];

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('studybuddy_theme', nextTheme);
  };

  return (
    <header style={{
      background: 'var(--nav-bg)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      transition: 'background 0.3s ease, border-color 0.3s ease'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0.85rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Brand Logo */}
        <div 
          onClick={() => setActivePage('landing')} 
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
        >
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'var(--primary-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <Sparkles size={22} />
          </div>
          <div>
            <span style={{ fontSize: '1.35rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: 'var(--text-main)' }}>
              StudyBuddy
            </span>
            <span style={{
              marginLeft: '0.5rem',
              fontSize: '0.65rem',
              fontWeight: 800,
              padding: '0.2rem 0.55rem',
              borderRadius: '999px',
              background: 'rgba(99, 102, 241, 0.15)',
              color: 'var(--primary)',
              border: '1px solid rgba(99, 102, 241, 0.35)'
            }}>
              OpenClaw AI
            </span>
          </div>
        </div>

        {/* Desktop Nav Items */}
        <nav style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.6rem 1.1rem',
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                  background: isActive ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                  border: isActive ? '1px solid rgba(99, 102, 241, 0.35)' : '1px solid transparent',
                  boxShadow: isActive ? '0 0 15px rgba(99, 102, 241, 0.15)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon size={18} color={isActive ? 'var(--primary)' : 'var(--text-muted)'} />
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Theme Toggle Sun / Moon Button */}
          <button 
            onClick={toggleTheme}
            className="theme-toggle-btn"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            style={{ marginLeft: '0.5rem' }}
          >
            {theme === 'dark' ? <Sun size={18} color="#FBBF24" /> : <Moon size={18} color="#4F46E5" />}
          </button>
        </nav>

        {/* User Account / Auth Status Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {user?.isGuest ? (
            <button
              onClick={onOpenAuth}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.8rem',
                background: 'rgba(245, 158, 11, 0.15)',
                color: 'var(--warning)',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                padding: '0.4rem 0.85rem',
                borderRadius: '999px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <UserCheck size={14} />
              <span>Mode Tamu</span>
              <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>(Login Email)</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.8rem',
                background: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--success)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                padding: '0.4rem 0.85rem',
                borderRadius: '999px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <User size={14} />
              <span>{user?.name || 'User'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
