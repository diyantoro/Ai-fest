import React, { useState } from 'react';
import { Sparkles, Mail, Lock, User, ArrowRight, UserCheck, X, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert('Silakan isi email dan password.');
      return;
    }
    setLoading(true);
    setStatusMsg('Menghubungkan ke Supabase Auth...');

    try {
      const loggedUser = await api.loginWithEmail(email, password, name);
      setStatusMsg('✓ Akun berhasil disinkronkan ke tabel users!');
      await new Promise(r => setTimeout(r, 400));
      onLoginSuccess(loggedUser);
      onClose();
    } catch (err) {
      alert(`Error login: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    setLoading(true);
    setStatusMsg('Membuat sesi tamu di Supabase...');
    const guestUser = await api.createGuestSession();
    setStatusMsg('✓ Sesi Tamu aktif!');
    await new Promise(r => setTimeout(r, 300));
    setLoading(false);
    onLoginSuccess(guestUser);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem'
    }} className="animate-fade-in">
      <div className="card" style={{
        maxWidth: '460px',
        width: '100%',
        padding: '2.25rem',
        borderRadius: '24px',
        position: 'relative',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)'
      }}>
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1.25rem',
              right: '1.25rem',
              background: 'var(--pill-bg)',
              color: 'var(--text-muted)',
              border: '1px solid var(--border-color)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        )}

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '16px',
            background: 'var(--primary-gradient)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto',
            boxShadow: '0 0 25px rgba(99, 102, 241, 0.5)'
          }}>
            <Sparkles size={28} />
          </div>
          <h2 style={{ fontSize: '1.6rem', color: 'var(--text-main)', marginBottom: '0.35rem' }}>
            Selamat Datang di StudyBuddy
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Pilih metode masuk untuk mulai belajar bersama AI Agent
          </p>
        </div>

        {/* Option 2: Instant Guest Access Button */}
        <button
          type="button"
          onClick={handleGuest}
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.9rem 1.25rem',
            borderRadius: '14px',
            background: 'rgba(16, 185, 129, 0.15)',
            color: 'var(--success)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            fontWeight: 700,
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.6rem',
            cursor: 'pointer',
            marginBottom: '1.5rem',
            transition: 'all 0.2s ease'
          }}
        >
          <UserCheck size={20} />
          <span>Lanjutkan Tanpa Login (Mode Tamu 🚀)</span>
        </button>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--divider-color)' }}></div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>ATAU MASUK DENGAN EMAIL</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--divider-color)' }}></div>
        </div>

        {/* Tab Switcher: Login / Register */}
        <div style={{ display: 'flex', background: 'var(--pill-bg)', padding: '0.25rem', borderRadius: '12px', marginBottom: '1.25rem' }}>
          <button
            type="button"
            onClick={() => setTab('login')}
            style={{
              flex: 1,
              padding: '0.5rem',
              borderRadius: '10px',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: tab === 'login' ? 'var(--primary)' : 'var(--text-muted)',
              background: tab === 'login' ? 'var(--bg-card)' : 'transparent',
              boxShadow: tab === 'login' ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            Masuk Email
          </button>

          <button
            type="button"
            onClick={() => setTab('register')}
            style={{
              flex: 1,
              padding: '0.5rem',
              borderRadius: '10px',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: tab === 'register' ? 'var(--primary)' : 'var(--text-muted)',
              background: tab === 'register' ? 'var(--bg-card)' : 'transparent',
              boxShadow: tab === 'register' ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            Daftar Akun
          </button>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {tab === 'register' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                Nama Lengkap
              </label>
              <div style={{ position: 'relative' }}>
                <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Nama kamu..."
                  value={name}
                  onChange={e => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.75rem',
                    borderRadius: '12px',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
              Alamat Email *
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                required
                placeholder="nama@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.75rem',
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
              Kata Sandi *
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.75rem',
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {statusMsg && (
            <div style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 600, textAlign: 'center' }}>
              {statusMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', padding: '0.85rem' }}
          >
            <span>{loading ? 'Memproses...' : tab === 'login' ? 'Masuk dengan Email' : 'Daftar Sekarang'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Security Note */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '1.25rem', fontSize: '0.75rem', color: 'var(--text-light)' }}>
          <ShieldCheck size={14} color="var(--success)" />
          <span>Tersambung langsung ke Supabase Cloud Users Table.</span>
        </div>
      </div>
    </div>
  );
}
