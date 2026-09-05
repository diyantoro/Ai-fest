import React from 'react';
import { Plus, BookOpen, Clock, CheckCircle2, Award, ArrowRight, Play } from 'lucide-react';

export function Dashboard({ topics, stats, onNavigate, onSelectTopic }) {
  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', color: 'var(--text-main)', marginBottom: '0.2rem' }}>Halo! 👋</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
            Siap melanjutkan perjalanan belajarmu hari ini?
          </p>
        </div>

        <button 
          onClick={() => onNavigate('upload')} 
          className="btn-primary"
        >
          <Plus size={20} />
          <span>Tambah Materi</span>
        </button>
      </div>

      {/* Stats Cards Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.25rem'
      }}>
        <div className="card card-hover" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)', border: '1px solid rgba(99, 102, 241, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={26} />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>{stats.totalTopics}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Materi</div>
          </div>
        </div>

        <div className="card card-hover" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(147, 51, 234, 0.15)', color: '#A855F7', border: '1px solid rgba(147, 51, 234, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={26} />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>{stats.quizzesCompleted}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Quiz Selesai</div>
          </div>
        </div>

        <div className="card card-hover" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)', border: '1px solid rgba(245, 158, 11, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={26} />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>{stats.reviewsCompleted}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Review Selesai</div>
          </div>
        </div>

        <div className="card card-hover" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Award size={26} />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>{stats.averageScore}%</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Average Score</div>
          </div>
        </div>
      </div>

      {/* Today's Review Highlight Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.35)',
        borderRadius: '24px',
        padding: '1.75rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.25rem',
        boxShadow: 'var(--shadow-card)',
        backdropFilter: 'blur(16px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '16px',
            background: 'var(--primary-gradient)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)'
          }}>
            <Clock size={26} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: 700 }}>Today's Review</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--primary)' }}>1 materi siap direview hari ini untuk memperkuat ingatanmu.</p>
          </div>
        </div>

        <button 
          onClick={() => onNavigate('review')} 
          className="btn-primary" 
          style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}
        >
          <Play size={18} />
          <span>Mulai Review Hari Ini</span>
        </button>
      </div>

      {/* Material Cards List */}
      <div>
        <h3 style={{ fontSize: '1.3rem', marginBottom: '1.25rem', color: 'var(--text-main)' }}>Daftar Materi Belajar</h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {topics.map(topic => {
            const isDueToday = topic.scheduled_at === 'Today';
            return (
              <div 
                key={topic.id} 
                className="card card-hover" 
                style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '190px' }}
                onClick={() => onSelectTopic(topic)}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                    <h4 style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>{topic.title}</h4>
                    <span className={`badge ${isDueToday ? 'badge-warning' : 'badge-primary'}`}>
                      {isDueToday ? 'Review Hari Ini' : `Review ${topic.scheduled_at}`}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineClamp: 2, WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '1.25rem', lineHeight: 1.6 }}>
                    {topic.summary.replace(/[*📌•]/g, '').trim()}
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--divider-color)', fontSize: '0.82rem', color: 'var(--text-light)' }}>
                  <span>Stage {topic.review_stage} ({topic.review_stage === 1 ? '1 Hari' : topic.review_stage === 2 ? '3 Hari' : '7 Hari'})</span>
                  <span style={{ color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    Detail <ArrowRight size={15} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
