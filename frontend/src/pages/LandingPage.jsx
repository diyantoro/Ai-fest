import React from 'react';
import { Sparkles, ArrowRight, BookOpen, BrainCircuit, BellRing, MessageSquare } from 'lucide-react';

export function LandingPage({ onStart }) {
  return (
    <div className="animate-fade-in" style={{ padding: '2rem 0' }}>
      {/* Hero Section */}
      <div style={{
        textAlign: 'center',
        maxWidth: '880px',
        margin: '0 auto',
        padding: '3rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.75rem'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.6rem',
          padding: '0.5rem 1.25rem',
          borderRadius: '999px',
          background: 'rgba(99, 102, 241, 0.15)',
          border: '1px solid rgba(99, 102, 241, 0.35)',
          color: 'var(--primary)',
          fontSize: '0.85rem',
          fontWeight: 700,
          boxShadow: '0 0 20px rgba(99, 102, 241, 0.2)'
        }}>
          <Sparkles size={16} />
          <span>Personal Learning AI Agent berbasis OpenClaw</span>
        </div>

        <h1 style={{
          fontSize: '3.6rem',
          lineHeight: 1.15,
          color: 'var(--text-main)',
          fontWeight: 800
        }}>
          Belajar lebih konsisten.<br />
          <span style={{
            background: 'var(--primary-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 35px rgba(99, 102, 241, 0.3))'
          }}>
            StudyBuddy yang mengingatkan.
          </span>
        </h1>

        <p style={{
          fontSize: '1.2rem',
          color: 'var(--text-muted)',
          maxWidth: '680px',
          lineHeight: 1.6
        }}>
          Kirim materi sekali, biarkan AI merangkum, membuat quiz, dan mengingatkanmu kapan harus review secara proaktif via WhatsApp & Telegram.
        </p>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
          <button 
            onClick={onStart} 
            className="btn-primary" 
            style={{ padding: '1rem 2.25rem', fontSize: '1.1rem', borderRadius: '16px' }}
          >
            <span>Mulai Belajar</span>
            <ArrowRight size={22} />
          </button>
        </div>
      </div>

      {/* Visual AI Assistant Diagram */}
      <div style={{
        marginTop: '3rem',
        background: 'var(--card-gradient)',
        border: '1px solid var(--border-color)',
        borderRadius: '28px',
        padding: '3rem 2rem',
        boxShadow: 'var(--shadow-card)',
        backdropFilter: 'blur(20px)'
      }}>
        <h3 style={{ textAlign: 'center', marginBottom: '2.5rem', color: 'var(--text-main)', fontSize: '1.4rem', fontWeight: 800 }}>
          🔄 Bagaimana StudyBuddy Bekerja
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.5rem'
        }}>
          <div className="card card-hover" style={{ textAlign: 'center', padding: '1.75rem 1.25rem' }}>
            <div style={{ width: '54px', height: '54px', borderRadius: '16px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)', border: '1px solid rgba(99, 102, 241, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
              <BookOpen size={26} />
            </div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>1. Kirim Materi</h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Upload PDF text-heavy atau tempel materi teks ke sistem.</p>
          </div>

          <div className="card card-hover" style={{ textAlign: 'center', padding: '1.75rem 1.25rem' }}>
            <div style={{ width: '54px', height: '54px', borderRadius: '16px', background: 'rgba(147, 51, 234, 0.15)', color: '#A855F7', border: '1px solid rgba(147, 51, 234, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
              <BrainCircuit size={26} />
            </div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>2. AI Summary & Quiz</h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>AI membuat ringkasan terstruktur & 5 soal quiz otomatis.</p>
          </div>

          <div className="card card-hover" style={{ textAlign: 'center', padding: '1.75rem 1.25rem' }}>
            <div style={{ width: '54px', height: '54px', borderRadius: '16px', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)', border: '1px solid rgba(245, 158, 11, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
              <BellRing size={26} />
            </div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>3. Proactive Reminder</h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Heartbeat mengirim reminder & quiz di interval 1, 3, 7 hari.</p>
          </div>

          <div className="card card-hover" style={{ textAlign: 'center', padding: '1.75rem 1.25rem' }}>
            <div style={{ width: '54px', height: '54px', borderRadius: '16px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
              <MessageSquare size={26} />
            </div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>4. Adaptive Schedule</h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Grading menyesuaikan jadwal review berikutnya secara presisi.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
