// StudyBuddy Frontend API Service
// Terhubung ke REST API backend lokal (Express, port 3001) melalui Vite proxy.
// Bila backend sedang mati, otomatis jatuh ke data mock agar UI tetap berfungsi.

const API_BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  if (!res.ok) {
    let message = `Server error (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch (e) {}
    throw new Error(message);
  }
  return res.json();
}

// ---------------------------------------------------------------------------
// Mock Storage Fallback (dipakai saat backend tidak tersedia)
// ---------------------------------------------------------------------------
const mockStorage = {
  topics: [
    {
      id: 'database-management-1',
      title: 'Database Management',
      summary: `📌 **Ringkasan Materi: Database Management**\n\n• DBMS adalah sistem perangkat lunak untuk mengelola, menyimpan, dan memanipulasi basis data secara terstruktur.\n• Fungsi utama mencakup Data Definition (DDL), Data Manipulation (DML), dan Data Control (DCL).\n• ACID (Atomicity, Consistency, Isolation, Durability) menjamin integritas transaksi data.\n• SQL digunakan sebagai bahasa standar interaksi database relasional.`,
      keyPoints: [
        'Prinsip Atomicity memastikan transaksi "semua atau tidak sama sekali".',
        'Relasi antartabel dihubungkan melalui Primary Key dan Foreign Key.',
        'Normalisasi dilakukan untuk mengefisiensikan penyimpanan dan mencegah anomali data.'
      ],
      created_at: new Date().toISOString(),
      review_stage: 2,
      scheduled_at: 'Today',
      due_status: 'due',
      status: 'pending',
      last_score: 80,
      quizzes: [
        {
          id: 'quiz_dbm_1',
          question: 'Apa fungsi utama dari Database Management System (DBMS)?',
          options: [
            'A. Mengelola, menyimpan, dan mengambil data secara terstruktur.',
            'B. Mempercepat koneksi internet pengguna.',
            'C. Mengedit file video dan audio secara otomatis.',
            'D. Membuat tampilan antarmuka aplikasi web.'
          ],
          correct_answer: 'A',
          explanation: 'DBMS berfungsi sebagai pengelola basis data agar efisien dan aman.'
        },
        {
          id: 'quiz_dbm_2',
          question: 'Manakah dari berikut ini yang BUKAN merupakan prinsip ACID?',
          options: ['A. Atomicity', 'B. Consistency', 'C. Availability', 'D. Durability'],
          correct_answer: 'C',
          explanation: 'ACID singkatan dari Atomicity, Consistency, Isolation, dan Durability.'
        },
        {
          id: 'quiz_dbm_3',
          question: 'DDL (Data Definition Language) digunakan untuk...',
          options: [
            'A. Mengubah isi data di dalam tabel.',
            'B. Membuat dan mengubah struktur skema database.',
            'C. Memberikan hak akses pengguna.',
            'D. Mengambil data dari tabel.'
          ],
          correct_answer: 'B',
          explanation: 'DDL digunakan untuk mendefinisikan struktur database seperti CREATE, ALTER, dan DROP.'
        },
        {
          id: 'quiz_dbm_4',
          question: 'Kunci yang menghubungkan satu tabel ke tabel lain disebut...',
          options: ['A. Primary Key', 'B. Foreign Key', 'C. Candidate Key', 'D. Composite Key'],
          correct_answer: 'B',
          explanation: 'Foreign Key mereferensikan Primary Key dari tabel lain untuk membentuk relasi.'
        },
        {
          id: 'quiz_dbm_5',
          question: 'Sifat Durability dalam transaksi database menjamin bahwa...',
          options: [
            'A. Transaksi dapat dibatalkan sewaktu-waktu.',
            'B. Perubahan data tetap tersimpan secara permanen.',
            'C. Transaksi tidak memakan memori RAM.',
            'D. Data dapat diakses tanpa batas.'
          ],
          correct_answer: 'B',
          explanation: 'Durability memastikan perubahan yang sudah di-commit tetap tersimpan permanen.'
        }
      ]
    },
    {
      id: 'pemrograman-web-1',
      title: 'Pemrograman Web',
      summary: `📌 **Ringkasan Materi: Pemrograman Web**\n\n• HTML mendefinisikan struktur konten web, CSS mengatur gaya visual, dan JavaScript memberikan sifat interaktif.\n• Arsitektur Client-Server memungkinkan browser meminta resource dari Web Server via HTTP/HTTPS.\n• REST API menyediakan endpoint data berformat JSON untuk menghubungkan Frontend dan Backend.`,
      keyPoints: [
        'DOM memungkinkan JavaScript memanipulasi elemen HTML secara dinamis.',
        'HTTP Method utama: GET, POST, PUT, dan DELETE.',
        'Responsive Web Design menyesuaikan layout untuk layar desktop dan smartphone.'
      ],
      created_at: new Date().toISOString(),
      review_stage: 1,
      scheduled_at: 'Tomorrow',
      due_status: 'upcoming',
      status: 'pending',
      last_score: 75,
      quizzes: []
    },
    {
      id: 'sistem-operasi-1',
      title: 'Sistem Operasi',
      summary: `📌 **Ringkasan Materi: Sistem Operasi**\n\n• Sistem Operasi bertindak sebagai perantara antara hardware komputer dan aplikasi pengguna.\n• Tugas inti meliputi Manajemen Proses, Manajemen Memori (RAM & Virtual Memory), dan File System.\n• Deadlock terjadi ketika dua proses saling menunggu resource yang dipegang proses lain.`,
      keyPoints: [
        'Process State: New, Ready, Running, Waiting, Terminated.',
        'Virtual Memory memungkinkan eksekusi program lebih besar dari RAM fisik.',
        'Paging membagi memori menjadi blok fixed-size.'
      ],
      created_at: new Date().toISOString(),
      review_stage: 2,
      scheduled_at: '3 Days',
      due_status: 'upcoming',
      status: 'pending',
      last_score: 90,
      quizzes: []
    }
  ],

  stats: {
    totalTopics: 3,
    quizzesCompleted: 3,
    reviewsCompleted: 3,
    averageScore: 81
  }
};

function formatNextSchedule(stage) {
  return stage === 1 ? 'Tomorrow' : stage === 2 ? '3 hari lagi' : stage === 3 ? '7 hari lagi' : '3 hari lagi';
}

export const api = {
  // Meniru login/auth sederhana berbasis backend lokal (tanpa Supabase).
  async loginWithEmail(email, password, name) {
    const cleanName = name || email.split('@')[0] || 'Student';
    return {
      id: `user_email_${Date.now()}`,
      name: cleanName,
      email: email,
      isGuest: false
    };
  },

  async createGuestSession() {
    const guestId = `guest_${Math.floor(1000 + Math.random() * 9000)}`;
    return {
      id: guestId,
      name: `Tamu_${guestId.substring(6)}`,
      email: '',
      isGuest: true
    };
  },

  async getTopics() {
    try {
      const topics = await request('/topics');
      if (topics && topics.length > 0) return topics;
    } catch (e) {
      console.warn('Backend tidak tersedia, memakai data mock:', e.message);
    }
    return mockStorage.topics;
  },

  async getTopicById(topicId) {
    try {
      const topic = await request(`/topics/${encodeURIComponent(topicId)}`);
      if (topic && topic.id) return topic;
    } catch (e) {
      console.warn('Backend tidak tersedia untuk detail topic:', e.message);
    }
    return mockStorage.topics.find(t => t.id === topicId) || mockStorage.topics[0];
  },

  async ingestMaterial(title, content, type = 'text') {
    try {
      const res = await request('/ingest', {
        method: 'POST',
        body: JSON.stringify({ title, content, type })
      });
      if (res.success && res.topicId) {
        const detail = await this.getTopicById(res.topicId);
        return detail || {
          id: res.topicId,
          title,
          summary: res.summary,
          keyPoints: [],
          quizzes: [],
          review_stage: 1,
          scheduled_at: 'Tomorrow'
        };
      }
    } catch (e) {
      console.warn('Backend tidak tersedia saat ingest, memakai mock:', e.message);
    }

    const contentSnippet = type === 'pdf'
      ? 'Materi dari file PDF yang diunggah.'
      : content.substring(0, 150);
    const slugId = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + (mockStorage.topics.length + 1);
    const newTopic = {
      id: slugId,
      title,
      summary: `📌 **Ringkasan Materi: ${title}**\n\n• ${contentSnippet}...\n• AI StudyBuddy telah mengekstrak poin penting secara otomatis.`,
      keyPoints: ['Poin utama terdeteksi.', 'Konsep utama tersusun.', 'Siap diuji via quiz.'],
      created_at: new Date().toISOString(),
      review_stage: 1,
      scheduled_at: 'Tomorrow',
      due_status: 'upcoming',
      status: 'pending',
      last_score: 0,
      quizzes: []
    };
    mockStorage.topics.unshift(newTopic);
    return newTopic;
  },

  async submitQuiz(topicId, answers) {
    try {
      const res = await request('/quiz/submit', {
        method: 'POST',
        body: JSON.stringify({ topicId, answers })
      });
      return {
        score: res.score,
        total: res.total,
        correctCount: res.correctCount,
        review_stage: res.review_stage,
        scheduled_at: formatNextSchedule(res.review_stage)
      };
    } catch (e) {
      console.warn('Backend tidak tersedia saat submit quiz, memakai mock:', e.message);
    }

    let correct = 0;
    const topic = mockStorage.topics.find(t => t.id === topicId) || mockStorage.topics[0];
    const quizzes = topic?.quizzes || [];
    quizzes.forEach(q => {
      if (answers[q.id] === q.correct_answer) correct++;
    });
    const score = quizzes.length > 0 ? Math.round((correct / quizzes.length) * 100) : 80;
    const nextStage = score >= 60 ? Math.min(3, (topic.review_stage || 1) + 1) : 1;
    return {
      score,
      total: quizzes.length || 5,
      correctCount: correct || 4,
      review_stage: nextStage,
      scheduled_at: formatNextSchedule(nextStage)
    };
  },

  async sendChatMessage(message, topicId) {
    try {
      const res = await request('/chat', {
        method: 'POST',
        body: JSON.stringify({ message, topicId })
      });
      if (res.reply) {
        return { reply: res.reply, fromBackend: true };
      }
    } catch (e) {
      console.warn('Backend tidak tersedia untuk chat, memakai mock:', e.message);
    }

    const closest = mockStorage.topics.find(t => t.id === topicId)
      || (topicId ? mockStorage.topics.find(t => t.title === topicId) : null)
      || mockStorage.topics[0];

    const q = message.toLowerCase();
    let reply = `Aku siap membantumu belajar **${closest?.title || 'materi'}**. Ketik "ringkasan" untuk melihat rangkuman atau "mulai quiz" untuk mengerjakan soal.`;
    if (q.includes('ringkasan') || q.includes('summary') || q.includes('rangkum')) {
      reply = `📖 **Ringkasan Materi ${closest?.title || ''}**:\n\n${closest?.summary || 'Konsep-konsep kunci dari materi ini perlu dipahami secara bertahap.'}`;
    } else if (q.includes('quiz') || q.includes('mulai')) {
      reply = `Siap! Buka halaman Quiz untuk mengerjakan soal topik **${closest?.title || ''}**. Jawab dengan A, B, C, atau D.`;
    }
    return { reply, fromBackend: false };
  },

  async getStats() {
    try {
      const stats = await request('/stats');
      if (stats && typeof stats.totalTopics === 'number') return stats;
    } catch (e) {
      console.warn('Backend tidak tersedia untuk stats:', e.message);
    }
    return mockStorage.stats;
  }
};

export default api;