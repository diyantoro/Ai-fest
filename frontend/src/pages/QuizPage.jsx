import React, { useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export function QuizPage({ topic, onFinishQuiz }) {
  const quizzes = topic?.quizzes && topic.quizzes.length > 0 ? topic.quizzes : [
    {
      id: 'q1',
      question: 'Apa fungsi utama dari Database Management System (DBMS)?',
      options: [
        'A. Mengelola, menyimpan, dan mengambil data secara terstruktur.',
        'B. Mempercepat koneksi internet pengguna.',
        'C. Mengedit file video dan audio secara otomatis.',
        'D. Membuat tampilan antarmuka aplikasi web.'
      ],
      correct_answer: 'A'
    },
    {
      id: 'q2',
      question: 'Manakah dari berikut ini yang BUKAN merupakan prinsip ACID?',
      options: [
        'A. Atomicity',
        'B. Consistency',
        'C. Availability',
        'D. Durability'
      ],
      correct_answer: 'C'
    },
    {
      id: 'q3',
      question: 'DDL (Data Definition Language) digunakan untuk...',
      options: [
        'A. Mengubah isi data di dalam tabel.',
        'B. Membuat dan mengubah struktur skema database.',
        'C. Memberikan hak akses pengguna.',
        'D. Mengambil data dari tabel.'
      ],
      correct_answer: 'B'
    },
    {
      id: 'q4',
      question: 'Kunci unik yang menghubungkan satu tabel ke tabel lain disebut...',
      options: [
        'A. Primary Key',
        'B. Foreign Key',
        'C. Candidate Key',
        'D. Composite Key'
      ],
      correct_answer: 'B'
    },
    {
      id: 'q5',
      question: 'Sifat Durability dalam transaksi database menjamin bahwa...',
      options: [
        'A. Transaksi dapat dibatalkan sewaktu-waktu.',
        'B. Perubahan data tetap tersimpan secara permanen.',
        'C. Transaksi tidak memakan memori RAM.',
        'D. Data dapat diakses tanpa batas.'
      ],
      correct_answer: 'B'
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});

  const currentQuiz = quizzes[currentIndex];
  const selectedOption = selectedAnswers[currentQuiz.id];

  const handleSelectOption = (optionLetter) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuiz.id]: optionLetter
    }));
  };

  const handleNext = () => {
    if (currentIndex < quizzes.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Calculate score & finish
      onFinishQuiz(selectedAnswers);
    }
  };

  const progressPercent = Math.round(((currentIndex + 1) / quizzes.length) * 100);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '750px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Quiz Title & Header */}
      <div>
        <h2 style={{ fontSize: '1.6rem', color: '#0F172A', marginBottom: '0.25rem' }}>
          {topic?.title || 'Database Management'} Quiz
        </h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748B', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
          <span>Question {currentIndex + 1} of {quizzes.length}</span>
          <span>{progressPercent}% Complete</span>
        </div>

        {/* Progress Bar */}
        <div style={{ width: '100%', height: '8px', background: '#E2E8F0', borderRadius: '999px', overflow: 'hidden' }}>
          <div style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, #6366F1 0%, #4F46E5 100%)', transition: 'width 0.3s ease' }}></div>
        </div>
      </div>

      {/* Question Card */}
      <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', color: '#0F172A', lineHeight: 1.4 }}>
          {currentQuiz.question}
        </h3>

        {/* Options List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {currentQuiz.options.map((opt, idx) => {
            const letter = opt.substring(0, 1).toUpperCase();
            const isSelected = selectedOption === letter;

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(letter)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem 1.25rem',
                  borderRadius: '12px',
                  border: isSelected ? '2px solid #4F46E5' : '1px solid #CBD5E1',
                  background: isSelected ? '#EEF2FF' : '#FFFFFF',
                  color: isSelected ? '#4F46E5' : '#1E293B',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '0.95rem',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  cursor: 'pointer'
                }}
              >
                <span>{opt}</span>
                {isSelected && <CheckCircle2 color="#4F46E5" size={20} />}
              </button>
            );
          })}
        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button
            onClick={handleNext}
            disabled={!selectedOption}
            className="btn-primary"
            style={{
              opacity: selectedOption ? 1 : 0.5,
              cursor: selectedOption ? 'pointer' : 'not-allowed',
              padding: '0.8rem 1.75rem',
              fontSize: '0.95rem'
            }}
          >
            <span>{currentIndex < quizzes.length - 1 ? 'Pertanyaan Berikutnya' : 'Selesaikan Quiz'}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
