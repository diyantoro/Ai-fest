import React from 'react';
import { Trophy, CheckCircle2, ArrowRight, RotateCcw, Calendar } from 'lucide-react';

export function QuizResultPage({ result, topic, onBackToDetail, onBackToDashboard }) {
  const score = result?.score ?? 80;
  const correctCount = result?.correctCount ?? 4;
  const total = result?.total ?? 5;
  const isPassed = score >= 60;
  const nextScheduledAt = result?.scheduled_at || (isPassed ? '3 hari lagi' : '1 hari lagi');

  return (
    <div className="animate-fade-in" style={{ maxWidth: '650px', margin: '0 auto', textAlign: 'center' }}>
      <div className="card" style={{ padding: '3rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
        {/* Trophy Icon Badge */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: isPassed ? '#D1FAE5' : '#FEE2E2',
          color: isPassed ? '#059669' : '#DC2626',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Trophy size={42} />
        </div>

        <div>
          <h2 style={{ fontSize: '2rem', color: '#0F172A', marginBottom: '0.25rem' }}>
            Quiz selesai! 🎉
          </h2>
          <p style={{ color: '#64748B', fontSize: '0.95rem' }}>
            Materi: <strong>{topic?.title || 'Database Management'}</strong>
          </p>
        </div>

        {/* Score Display Box */}
        <div style={{
          background: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: '20px',
          padding: '1.5rem 3rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.25rem'
        }}>
          <div style={{ fontSize: '3.5rem', fontWeight: 800, color: isPassed ? '#4F46E5' : '#DC2626', fontFamily: 'Outfit, sans-serif' }}>
            {score}%
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#475569' }}>
            {correctCount} dari {total} jawaban benar
          </div>
        </div>

        {/* Adaptive Schedule Feedback Box */}
        <div style={{
          background: isPassed ? '#EEF2FF' : '#FEF3C7',
          border: `1px solid ${isPassed ? '#C7D2FE' : '#FDE68A'}`,
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          width: '100%',
          textAlign: 'left'
        }}>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: isPassed ? '#1E1B4B' : '#78350F', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={18} color={isPassed ? '#4F46E5' : '#D97706'} />
            Jadwal Review Berikutnya: {nextScheduledAt}
          </div>

          <p style={{ fontSize: '0.9rem', color: isPassed ? '#3730A3' : '#92400E', lineHeight: 1.5 }}>
            {isPassed 
              ? 'Bagus! Pemahamanmu sangat baik. Review berikutnya akan dijadwalkan pada tahap selanjutnya.' 
              : 'Beberapa konsep masih perlu diperkuat. Review berikutnya akan dilakukan dalam 1 hari.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
          <button onClick={onBackToDetail} className="btn-secondary">
            <RotateCcw size={16} />
            <span>Lihat Detail Materi</span>
          </button>

          <button onClick={onBackToDashboard} className="btn-primary">
            <span>Kembali ke Dashboard</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
