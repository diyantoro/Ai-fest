import React from 'react';
import { BookOpen, CheckCircle2, Clock, Play, ArrowLeft } from 'lucide-react';

export function MaterialDetail({ topic, onBack, onStartQuiz }) {
  if (!topic) return null;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Header */}
      <div>
        <button 
          onClick={onBack} 
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#64748B', background: 'none', fontSize: '0.9rem', marginBottom: '1rem', cursor: 'pointer' }}
        >
          <ArrowLeft size={16} /> Kembali ke Dashboard
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
              <h1 style={{ fontSize: '2rem', color: '#0F172A' }}>{topic.title}</h1>
              <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                <CheckCircle2 size={12} /> AI Processed ✓
              </span>
            </div>
            <p style={{ color: '#64748B', fontSize: '0.9rem' }}>ID Topik: <code>{topic.id}</code></p>
          </div>

          <button 
            onClick={() => onStartQuiz(topic)} 
            className="btn-primary" 
            style={{ padding: '0.8rem 1.5rem', fontSize: '1rem' }}
          >
            <Play size={18} />
            <span>Mulai Quiz</span>
          </button>
        </div>
      </div>

      {/* Grid Content */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Ringkasan & Key Points */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', color: '#0F172A', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={20} color="#4F46E5" />
              Ringkasan Materi
            </h3>
            <div style={{ whiteSpace: 'pre-line', color: '#334155', fontSize: '0.95rem', lineHeight: 1.7 }}>
              {topic.summary}
            </div>
          </div>

          {topic.keyPoints && topic.keyPoints.length > 0 && (
            <div className="card">
              <h3 style={{ fontSize: '1.15rem', color: '#0F172A', marginBottom: '1rem' }}>
                💡 Key Points
              </h3>
              <ul style={{ paddingLeft: '1.25rem', color: '#334155', fontSize: '0.95rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {topic.keyPoints.map((pt, idx) => (
                  <li key={idx}>{pt}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Spaced Repetition Review Schedule Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', color: '#0F172A', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={20} color="#4F46E5" />
              Review Schedule Timeline
            </h3>

            {/* Vertical Timeline */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', paddingLeft: '1.5rem' }}>
              {/* Vertical line */}
              <div style={{ position: 'absolute', left: '7px', top: '10px', bottom: '10px', width: '2px', background: '#E2E8F0' }}></div>

              {/* Stage Learned */}
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '-1.5rem', top: '3px', width: '16px', height: '16px', borderRadius: '50%', background: '#10B981', border: '3px solid #FFFFFF', boxShadow: '0 0 0 2px #10B981' }}></div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A' }}>Learned</div>
                <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Materi pertama di-upload</div>
              </div>

              {/* Stage 1 Day */}
              <div style={{ position: 'relative' }}>
                <div style={{ 
                  position: 'absolute', 
                  left: '-1.5rem', 
                  top: '3px', 
                  width: '16px', 
                  height: '16px', 
                  borderRadius: '50%', 
                  background: topic.review_stage >= 1 ? '#4F46E5' : '#CBD5E1', 
                  border: '3px solid #FFFFFF', 
                  boxShadow: topic.review_stage >= 1 ? '0 0 0 2px #4F46E5' : 'none' 
                }}></div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: topic.review_stage >= 1 ? '#0F172A' : '#94A3B8' }}>
                  1 Day (Stage 1)
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Review pertama (H+1 hari)</div>
              </div>

              {/* Stage 3 Days */}
              <div style={{ position: 'relative' }}>
                <div style={{ 
                  position: 'absolute', 
                  left: '-1.5rem', 
                  top: '3px', 
                  width: '16px', 
                  height: '16px', 
                  borderRadius: '50%', 
                  background: topic.review_stage >= 2 ? '#4F46E5' : '#CBD5E1', 
                  border: '3px solid #FFFFFF', 
                  boxShadow: topic.review_stage >= 2 ? '0 0 0 2px #4F46E5' : 'none' 
                }}></div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: topic.review_stage >= 2 ? '#0F172A' : '#94A3B8' }}>
                  3 Days (Stage 2)
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Review kedua jika skor $\ge$ 60%</div>
              </div>

              {/* Stage 7 Days */}
              <div style={{ position: 'relative' }}>
                <div style={{ 
                  position: 'absolute', 
                  left: '-1.5rem', 
                  top: '3px', 
                  width: '16px', 
                  height: '16px', 
                  borderRadius: '50%', 
                  background: topic.review_stage >= 3 ? '#10B981' : '#CBD5E1', 
                  border: '3px solid #FFFFFF', 
                  boxShadow: topic.review_stage >= 3 ? '0 0 0 2px #10B981' : 'none' 
                }}></div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: topic.review_stage >= 3 ? '#0F172A' : '#94A3B8' }}>
                  7 Days (Stage 3 - Mastered)
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Review tahap penguasaan materi</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
