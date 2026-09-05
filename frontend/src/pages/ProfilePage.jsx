import React from 'react';
import { User, CheckCircle2, MessageSquare, Bell, UserCheck, LogOut, Lock, ShieldCheck } from 'lucide-react';

export function ProfilePage({ stats, user, onOpenAuth }) {
  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* User Header Card */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'var(--primary-gradient)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 25px rgba(99, 102, 241, 0.4)'
          }}>
            <User size={36} />
          </div>

          <div>
            <h2 style={{ fontSize: '1.6rem', color: 'var(--text-main)' }}>
              {user?.name || 'Pelajar StudyBuddy'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.1rem' }}>
              {user?.isGuest ? 'Akses Tanpa Email (Mode Tamu)' : user?.email || 'student@studybuddy.ai'}
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: user?.isGuest ? 'var(--warning-light)' : 'var(--success-light)', color: user?.isGuest ? 'var(--warning)' : 'var(--success)', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.65rem', borderRadius: '999px', marginTop: '0.4rem', border: `1px solid ${user?.isGuest ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'}` }}>
              {user?.isGuest ? <UserCheck size={12} /> : <CheckCircle2 size={12} />}
              {user?.isGuest ? 'Instant Guest Access Active' : 'Verified Email Account'}
            </div>
          </div>
        </div>

        <button
          onClick={onOpenAuth}
          className="btn-secondary"
          style={{ fontSize: '0.9rem', padding: '0.75rem 1.25rem' }}
        >
          <Lock size={16} />
          <span>{user?.isGuest ? 'Daftar / Login Email' : 'Ganti Akun Email'}</span>
        </button>
      </div>

      {/* Connected Channels Card */}
      <div className="card">
        <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MessageSquare color="var(--primary)" size={20} />
          Connected Messaging Channels
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* WhatsApp */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--pill-bg)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#25D366', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                WA
              </div>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>WhatsApp Adapter</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Proactive Review Reminder via Baileys/Twilio</div>
              </div>
            </div>
            <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <CheckCircle2 size={12} /> Connected ✓
            </span>
          </div>

          {/* Telegram */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--pill-bg)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#0088CC', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                TG
              </div>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>Telegram Bot</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>@StudyBuddyAgentBot</div>
              </div>
            </div>
            <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <CheckCircle2 size={12} /> Connected ✓
            </span>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="card">
        <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bell color="var(--primary)" size={20} />
          Spaced Repetition & Notification Settings
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>Default Review Intervals</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Review 1 (1 Hari), Review 2 (3 Hari), Review 3 (7 Hari)</div>
            </div>
            <span className="badge badge-primary">1, 3, 7 Days</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--divider-color)' }}>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>Proactive Heartbeat Reminders</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Kirim pesan otomatis ketika materi jatuh tempo</div>
            </div>
            <span className="badge badge-success">Enabled</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--divider-color)' }}>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>Adaptive Pass Threshold</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Skor minimal untuk lanjut ke stage review berikutnya</div>
            </div>
            <span className="badge badge-primary">60% Score</span>
          </div>
        </div>
      </div>
    </div>
  );
}
