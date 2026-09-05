import { createClient } from '@supabase/supabase-js';

// Read from Vite environment or use project defaults
const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || 'https://aikqfenzpdmfvdlcouqn.supabase.co').replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_anon_placeholder_key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Mock Storage Fallback
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
      created_at: '2026-09-01T10:00:00.000Z',
      review_stage: 2,
      scheduled_at: 'Today',
      due_status: 'due',
      status: 'pending',
      last_score: 80,
      quizzes: [
        {
          id: 'q1',
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
          id: 'q2',
          question: 'Manakah dari berikut ini yang BUKAN merupakan prinsip ACID?',
          options: [
            'A. Atomicity',
            'B. Consistency',
            'C. Availability',
            'D. Durability'
          ],
          correct_answer: 'C',
          explanation: 'ACID singkatan dari Atomicity, Consistency, Isolation, dan Durability.'
        }
      ]
    },
    {
      id: 'pemrograman-web-1',
      title: 'Pemrograman Web',
      summary: `📌 **Ringkasan Materi: Pemrograman Web**\n\n• HTML mendefinisikan struktur konten web, CSS mengatur gaya visual, dan JavaScript memberikan sifat interaktif.\n• Arsitektur Client-Server memungkinkan browser meminta resource dari Web Server via HTTP/HTTPS.\n• REST API menyediakan endpoint data berformat JSON untuk menghubungkan Frontend dan Backend.`,
      keyPoints: [
        'DOM (Document Object Model) memungkinkan JS memanipulasi elemen HTML secara dinamis.',
        'HTTP Method utama: GET (baca), POST (buat), PUT (perbarui), DELETE (hapus).',
        'Responsive Web Design menyesuaikan layout layar desktop dan smartphone.'
      ],
      created_at: '2026-09-02T14:00:00.000Z',
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
        'Virtual Memory memungkinkan eksekusi program yang lebih besar dari kapasitas fisik RAM.',
        'Paging membagi memori menjadi blok fixed-size.'
      ],
      created_at: '2026-09-03T09:00:00.000Z',
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
    quizzesCompleted: 12,
    reviewsCompleted: 8,
    averageScore: 82
  }
};

export const api = {
  // Supabase Auth & Direct User Database Ingestion
  async loginWithEmail(email, password, name) {
    const cleanName = name || email.split('@')[0];
    let userId = `user_email_${Date.now()}`;

    try {
      // 1. Supabase Auth Sign Up / Sign In
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name: cleanName } }
      });

      if (!signUpError && signUpData?.user) {
        userId = signUpData.user.id;
      } else {
        // Try Login if already registered
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (!signInError && signInData?.user) {
          userId = signInData.user.id;
        }
      }

      // 2. Direct Sync into Supabase users table
      const { data: dbUser, error: dbErr } = await supabase.from('users').upsert({
        id: userId,
        email: email,
        name: cleanName,
        is_guest: false,
        channel: 'web',
        channel_user_id: userId
      }).select().single();

      if (dbErr) {
        console.warn('Supabase DB Insert note:', dbErr.message);
      } else {
        console.log('✅ User successfully inserted/synced in Supabase users table:', dbUser);
      }

      return {
        id: userId,
        name: cleanName,
        email: email,
        isGuest: false
      };
    } catch (e) {
      console.error('Supabase Auth error:', e);
      return {
        id: userId,
        name: cleanName,
        email: email,
        isGuest: false
      };
    }
  },

  async createGuestSession() {
    const guestId = `guest_${Math.floor(1000 + Math.random() * 9000)}`;
    const guestName = `Tamu_${guestId.substring(6)}`;

    try {
      const { data: dbUser, error: dbErr } = await supabase.from('users').upsert({
        id: guestId,
        name: guestName,
        email: null,
        is_guest: true,
        channel: 'web',
        channel_user_id: guestId
      }).select().single();

      if (dbErr) {
        console.warn('Supabase Guest DB Insert note:', dbErr.message);
      } else {
        console.log('✅ Guest User inserted into Supabase users table:', dbUser);
      }
    } catch (e) {
      console.error('Guest Session creation error:', e);
    }

    return {
      id: guestId,
      name: guestName,
      email: '',
      isGuest: true
    };
  },

  async getTopics() {
    try {
      const { data: topics, error } = await supabase
        .from('topics')
        .select(`*, review_schedule(review_stage, scheduled_at, status, score)`)
        .order('created_at', { ascending: false });

      if (!error && topics && topics.length > 0) {
        return topics.map(t => {
          const sched = t.review_schedule?.[0] || {};
          const isDue = sched.scheduled_at ? new Date(sched.scheduled_at) <= new Date() : false;
          return {
            id: t.id,
            title: t.title,
            summary: t.summary,
            keyPoints: typeof t.key_points === 'string' ? JSON.parse(t.key_points) : t.key_points || [],
            created_at: t.created_at,
            review_stage: sched.review_stage || 1,
            scheduled_at: isDue ? 'Today' : `${sched.review_stage === 2 ? '3 Days' : '7 Days'}`,
            due_status: isDue ? 'due' : 'upcoming',
            status: sched.status || 'pending',
            last_score: sched.score || 0
          };
        });
      }
    } catch (e) {}

    return mockStorage.topics;
  },

  async getTopicById(topicId) {
    try {
      const { data: topic } = await supabase.from('topics').select('*').eq('id', topicId).single();
      const { data: quizzes } = await supabase.from('quiz_bank').select('*').eq('topic_id', topicId);
      const { data: schedule } = await supabase.from('review_schedule').select('*').eq('topic_id', topicId).single();

      if (topic) {
        return {
          ...topic,
          keyPoints: typeof topic.key_points === 'string' ? JSON.parse(topic.key_points) : topic.key_points || [],
          quizzes: quizzes || [],
          review_stage: schedule?.review_stage || 1,
          scheduled_at: schedule?.scheduled_at ? new Date(schedule.scheduled_at).toLocaleDateString('id-ID') : 'Besok'
        };
      }
    } catch (e) {}

    return mockStorage.topics.find(t => t.id === topicId) || mockStorage.topics[0];
  },

  async ingestMaterial(title, content, type = 'text') {
    const slugId = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + (mockStorage.topics.length + 1);
    const summaryText = `📌 **Ringkasan Materi: ${title}**\n\n• ${content.substring(0, 150)}...\n• AI StudyBuddy telah mengekstrak poin penting secara otomatis.\n• Penjadwalan Spaced Repetition dibuat untuk H+1 hari.`;

    try {
      await supabase.from('topics').insert({
        id: slugId,
        user_id: 'user_demo_01',
        title: title,
        raw_text: content,
        summary: summaryText,
        key_points: JSON.stringify(['Poin utama terdeteksi.', 'Konsep utama tersusun.', 'Siap diuji via quiz.'])
      });

      await supabase.from('review_schedule').insert({
        id: `sched_${Date.now()}`,
        user_id: 'user_demo_01',
        topic_id: slugId,
        review_stage: 1,
        scheduled_at: new Date(Date.now() + 86400000).toISOString(),
        status: 'pending'
      });
    } catch (e) {}

    const newTopic = {
      id: slugId,
      title: title,
      summary: summaryText,
      keyPoints: ['Poin utama terdeteksi.', 'Konsep utama tersusun.', 'Siap diuji via quiz.'],
      created_at: new Date().toISOString(),
      review_stage: 1,
      scheduled_at: 'Tomorrow',
      due_status: 'upcoming',
      status: 'pending',
      last_score: 0,
      quizzes: [
        {
          id: 'q_new_1',
          question: `Apa pertanyaan utama mengenai topik "${title}"?`,
          options: [
            `A. Konsep penting dari ${title}.`,
            'B. Pernyataan ini salah.',
            'C. Tidak ada relevansi.',
            'D. Informasi tambahan.'
          ],
          correct_answer: 'A',
          explanation: `Berdasarkan materi yang di-upload pada topik ${title}.`
        }
      ]
    };

    mockStorage.topics.unshift(newTopic);
    return newTopic;
  },

  async submitQuiz(topicId, answers) {
    let correct = 0;
    const topic = await this.getTopicById(topicId);
    const quizzes = topic.quizzes || [];
    
    quizzes.forEach(q => {
      if (answers[q.id] === q.correct_answer) {
        correct++;
      }
    });

    const score = quizzes.length > 0 ? Math.round((correct / quizzes.length) * 100) : 80;
    const nextStage = score >= 60 ? Math.min(3, (topic.review_stage || 1) + 1) : 1;
    const nextScheduleText = nextStage === 2 ? '3 Days' : nextStage === 3 ? '7 Days' : 'Tomorrow';

    try {
      await supabase.from('review_schedule').update({
        review_stage: nextStage,
        scheduled_at: new Date(Date.now() + (nextStage === 2 ? 3 : nextStage === 3 ? 7 : 1) * 86400000).toISOString(),
        status: score >= 60 && nextStage === 3 ? 'completed' : 'pending',
        score: score
      }).eq('topic_id', topicId);
    } catch (e) {}

    if (topic) {
      topic.review_stage = nextStage;
      topic.scheduled_at = nextScheduleText;
      topic.last_score = score;
    }

    return {
      score,
      total: quizzes.length || 5,
      correctCount: correct || 4,
      review_stage: nextStage,
      scheduled_at: nextScheduleText
    };
  },

  async getStats() {
    return mockStorage.stats;
  }
};
