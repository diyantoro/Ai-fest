import React from 'react';
import { Clock, Play, BookOpen, CheckCircle2 } from 'lucide-react';

export function ReviewPage({ topics, onStartReview }) {
  const dueTopics = topics.filter(t => t.scheduled_at === 'Today' || t.due_status === 'due');
  const upcomingTopics = topics.filter(t => t.scheduled_at !== 'Today' && t.due_status !== 'due');

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '2rem', color: '#0F172A', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Clock color="#4F46E5" size={28} /> Today's Review
        </h1>
        <p style={{ color: '#64748B', fontSize: '0.95rem' }}>
          Materi yang telah jatuh tempo untuk dikaji ulang hari ini demi menjaga daya ingat (Spaced Repetition).
        </p>
      </div>

      {/* Due Reviews Section */}
      <div>
        <h3 style={{ fontSize: '1.15rem', color: '#0F172A', marginBottom: '1rem' }}>
          Materi Jatuh Tempo Review ({dueTopics.length})
        </h3>

        {dueTopics.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {dueTopics.map(topic => (
              <div 
                key={topic.id} 
                className="card card-hover" 
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  borderLeft: '5px solid #F59E0B'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', color: '#0F172A' }}>{topic.title}</h4>
                    <div style={{ fontSize: '0.85rem', color: '#64748B', display: 'flex', gap: '1rem', marginTop: '0.2rem' }}>
                      <span>5 Questions</span>
                      <span>•</span>
                      <span style={{ color: '#D97706', fontWeight: 600 }}>Ready to review</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => onStartReview(topic)} 
                  className="btn-primary" 
                  style={{ padding: '0.75rem 1.5rem' }}
                >
                  <Play size={16} />
                  <span>Start Review</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748B' }}>
            <CheckCircle2 size={36} color="#10B981" style={{ margin: '0 auto 0.75rem auto' }} />
            <h4 style={{ color: '#0F172A', marginBottom: '0.25rem' }}>Tidak Ada Review Jatuh Tempo</h4>
            <p style={{ fontSize: '0.9rem' }}>Semua materi untuk hari ini sudah selesai kamu review!</p>
          </div>
        )}
      </div>

      {/* Upcoming Reviews Section */}
      <div>
        <h3 style={{ fontSize: '1.15rem', color: '#0F172A', marginBottom: '1rem' }}>
          Jadwal Review Mendatang
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {upcomingTopics.map(topic => (
            <div key={topic.id} className="card" style={{ opacity: 0.9 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <h4 style={{ fontSize: '1rem', color: '#0F172A' }}>{topic.title}</h4>
                <span className="badge badge-primary">Stage {topic.review_stage}</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
                Jadwal: <strong>{topic.scheduled_at}</strong>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
