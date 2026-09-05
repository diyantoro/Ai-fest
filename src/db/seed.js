import { dbQuery } from './client.js';
import { logger } from '../utils/logger.js';

const DEMO_USER_ID = 'user_demo_01';

const demoTopics = [
  {
    id: 'database-management-1',
    title: 'Database Management',
    raw_text: `Database Management System (DBMS) adalah perangkat lunak untuk mengelola, menyimpan, dan memanipulasi basis data secara terstruktur. Fungsi utama DBMS mencakup Data Definition (DDL), Data Manipulation (DML), dan Data Control (DCL). Sifat ACID (Atomicity, Consistency, Isolation, Durability) menjamin integritas transaksi data. SQL digunakan sebagai bahasa standar untuk berinteraksi dengan database relasional. Relasi antar tabel dihubungkan melalui Primary Key dan Foreign Key, sedangkan normalisasi dilakukan agar penyimpanan efisien dan terhindar dari anomali data.`,
    summary: `📌 **Ringkasan Materi: Database Management**\n\n• DBMS adalah sistem perangkat lunak untuk mengelola, menyimpan, dan memanipulasi basis data secara terstruktur.\n• Fungsi utama mencakup Data Definition (DDL), Data Manipulation (DML), dan Data Control (DCL).\n• ACID (Atomicity, Consistency, Isolation, Durability) menjamin integritas transaksi data.\n• SQL digunakan sebagai bahasa standar interaksi database relasional.`,
    keyPoints: [
      'Prinsip Atomicity memastikan transaksi "semua atau tidak sama sekali".',
      'Relasi antartabel dihubungkan melalui Primary Key dan Foreign Key.',
      'Normalisasi dilakukan untuk mengefisiensikan penyimpanan dan mencegah anomali data.'
    ],
    quizPrefix: 'quiz_dbm',
    quizzes: [
      {
        n: 1,
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
        n: 2,
        question: 'Manakah dari berikut ini yang BUKAN merupakan prinsip ACID?',
        options: ['A. Atomicity', 'B. Consistency', 'C. Availability', 'D. Durability'],
        correct_answer: 'C',
        explanation: 'ACID singkatan dari Atomicity, Consistency, Isolation, dan Durability.'
      },
      {
        n: 3,
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
        n: 4,
        question: 'Kunci yang menghubungkan satu tabel ke tabel lain disebut...',
        options: ['A. Primary Key', 'B. Foreign Key', 'C. Candidate Key', 'D. Composite Key'],
        correct_answer: 'B',
        explanation: 'Foreign Key mereferensikan Primary Key dari tabel lain untuk membentuk relasi.'
      },
      {
        n: 5,
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
    ],
    review_stage: 2,
    dueOffsetMs: 0,
    score: 80,
    status: 'pending'
  },
  {
    id: 'pemrograman-web-1',
    title: 'Pemrograman Web',
    raw_text: `Pemrograman web menggabungkan HTML untuk mendefinisikan struktur, CSS untuk mengatur gaya visual, dan JavaScript untuk sifat interaktif. Arsitektur client-server memungkinkan browser meminta sumber daya dari web server melalui protokol HTTP/HTTPS. REST API menyediakan endpoint data berformat JSON untuk menghubungkan frontend dan backend. DOM (Document Object Model) memungkinkan JavaScript memanipulasi elemen HTML secara dinamis.`,
    summary: `📌 **Ringkasan Materi: Pemrograman Web**\n\n• HTML mendefinisikan struktur konten web, CSS mengatur gaya visual, dan JavaScript memberikan sifat interaktif.\n• Arsitektur Client-Server memungkinkan browser meminta resource dari Web Server via HTTP/HTTPS.\n• REST API menyediakan endpoint data berformat JSON untuk menghubungkan Frontend dan Backend.`,
    keyPoints: [
      'DOM memungkinkan JavaScript memanipulasi elemen HTML secara dinamis.',
      'HTTP Method utama: GET, POST, PUT, dan DELETE.',
      'Responsive Web Design menyesuaikan layout untuk layar desktop dan smartphone.'
    ],
    quizPrefix: 'quiz_web',
    quizzes: [
      {
        n: 1,
        question: 'Bahasa yang digunakan untuk mendefinisikan struktur halaman web adalah...',
        options: ['A. HTML', 'B. Java', 'C. Python', 'D. C++'],
        correct_answer: 'A',
        explanation: 'HTML bertugas mendefinisikan struktur konten halaman web.'
      },
      {
        n: 2,
        question: 'HTTP method yang tepat untuk MENGAMBIL data dari server adalah...',
        options: ['A. POST', 'B. DELETE', 'C. GET', 'D. PUT'],
        correct_answer: 'C',
        explanation: 'GET digunakan untuk membaca atau mengambil data dari server.'
      },
      {
        n: 3,
        question: 'DOM (Document Object Model) memungkinkan JavaScript untuk...',
        options: [
          'A. Menyimpan data di server.',
          'B. Memanipulasi elemen HTML secara dinamis.',
          'C. Mengkompilasi kode C++.',
          'D. Mengatur bandwidth jaringan.'
        ],
        correct_answer: 'B',
        explanation: 'Melalui DOM, JavaScript dapat mengubah struktur, gaya, dan konten halaman.'
      },
      {
        n: 4,
        question: 'Protokol standar yang digunakan browser untuk meminta resource adalah...',
        options: ['A. FTP', 'B. SMTP', 'C. HTTP/HTTPS', 'D. TCP'],
        correct_answer: 'C',
        explanation: 'Browser berkomunikasi dengan web server menggunakan HTTP atau HTTPS.'
      },
      {
        n: 5,
        question: 'REST API umumnya mengembalikan data dalam format...',
        options: ['A. JSON', 'B. DOCX', 'C. MP4', 'D. EXE'],
        correct_answer: 'A',
        explanation: 'JSON adalah format pertukaran data ringan yang populer pada REST API.'
      }
    ],
    review_stage: 1,
    dueOffsetMs: 86400000,
    score: 75,
    status: 'pending'
  },
  {
    id: 'sistem-operasi-1',
    title: 'Sistem Operasi',
    raw_text: `Sistem Operasi bertindak sebagai perantara antara hardware komputer dan aplikasi pengguna. Tugas intinya meliputi manajemen proses, manajemen memori (RAM dan virtual memory), dan file system. Deadlock terjadi ketika dua proses saling menunggu resource yang dipegang proses lain. Virtual memory memungkinkan eksekusi program yang lebih besar dari kapasitas fisik RAM, dan paging membagi memori menjadi blok berukuran tetap.`,
    summary: `📌 **Ringkasan Materi: Sistem Operasi**\n\n• Sistem Operasi bertindak sebagai perantara antara hardware komputer dan aplikasi pengguna.\n• Tugas inti meliputi Manajemen Proses, Manajemen Memori (RAM & Virtual Memory), dan File System.\n• Deadlock terjadi ketika dua proses saling menunggu resource yang dipegang proses lain.`,
    keyPoints: [
      'Process State: New, Ready, Running, Waiting, Terminated.',
      'Virtual Memory memungkinkan eksekusi program lebih besar dari RAM fisik.',
      'Paging membagi memori menjadi blok fixed-size.'
    ],
    quizPrefix: 'quiz_os',
    quizzes: [
      {
        n: 1,
        question: 'Sistem Operasi berfungsi sebagai perantara antara...',
        options: [
          'A. Dua aplikasi sekaligus.',
          'B. Hardware komputer dan aplikasi pengguna.',
          'C. Jaringan dan internet.',
          'D. Database dan file.'
        ],
        correct_answer: 'B',
        explanation: 'Sistem Operasi menghubungkan hardware dengan aplikasi yang dijalankan pengguna.'
      },
      {
        n: 2,
        question: 'Situasi ketika dua proses saling menunggu resource yang dipegang proses lain disebut...',
        options: ['A. Starvation', 'B. Paging', 'C. Deadlock', 'D. Thrashing'],
        correct_answer: 'C',
        explanation: 'Deadlock adalah kondisi proses saling menunggu resource, sehingga tidak ada yang berjalan.'
      },
      {
        n: 3,
        question: 'Virtual Memory memungkinkan komputer untuk...',
        options: [
          'A. Menambah RAM secara fisik.',
          'B. Menjalankan program yang lebih besar dari kapasitas RAM fisik.',
          'C. Mengganti prosesor.',
          'D. Menghapus file sistem.'
        ],
        correct_answer: 'B',
        explanation: 'Virtual memory memindahkan sebagian data ke disk sehingga program besar tetap bisa berjalan.'
      },
      {
        n: 4,
        question: 'Urutan Process State yang benar adalah...',
        options: [
          'A. New, Running, Ready, Waiting, Terminated.',
          'B. New, Ready, Running, Waiting, Terminated.',
          'C. Ready, New, Waiting, Running, Terminated.',
          'D. Running, New, Ready, Terminated, Waiting.'
        ],
        correct_answer: 'B',
        explanation: 'Proses baru (New) masuk Ready, lalu Running, bisa Waiting, dan berakhir Terminated.'
      },
      {
        n: 5,
        question: 'Teknik membagi memori menjadi blok berukuran tetap disebut...',
        options: ['A. Segmentation', 'B. Fragmentation', 'C. Paging', 'D. Compaction'],
        correct_answer: 'C',
        explanation: 'Paging membagi memori menjadi frame/page dengan ukuran tetap.'
      }
    ],
    review_stage: 2,
    dueOffsetMs: 3 * 86400000,
    score: 90,
    status: 'pending'
  }
];

function parseKeyPoints(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch (e) {
      return [];
    }
  }
  return [];
}

export async function seedDemoData(ownerId = DEMO_USER_ID) {
  let inserted = 0;
  for (const t of demoTopics) {
    const [{ count }] = await dbQuery.all('SELECT COUNT(*) AS count FROM topics WHERE id = ?', [t.id]);
    if (count === 0) {
      await dbQuery.run(
        'INSERT INTO topics (id, user_id, title, raw_text, summary, key_points) VALUES (?, ?, ?, ?, ?, ?)',
        [t.id, ownerId, t.title, t.raw_text, t.summary, JSON.stringify(t.keyPoints)]
      );
      inserted++;
    } else {
      // Re-adopt demo topics that may belong to another (older) user row.
      await dbQuery.run(
        'UPDATE topics SET user_id = ?, title = ?, summary = ? WHERE id = ?',
        [ownerId, t.title, t.summary, t.id]
      );
    }

    for (const q of t.quizzes) {
      const quizId = `${t.quizPrefix}_${q.n}`;
      await dbQuery.run(
        `INSERT INTO quiz_bank (id, topic_id, question, options, correct_answer, explanation)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT (id) DO NOTHING`,
        [quizId, t.id, q.question, JSON.stringify(q.options), q.correct_answer, q.explanation]
      );
    }

    await dbQuery.run(
      `INSERT INTO review_schedule (id, user_id, topic_id, review_stage, scheduled_at, status, score)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT (id) DO NOTHING`,
      [`sched_demo_${t.id}`, ownerId, t.id, t.review_stage, new Date(Date.now() + t.dueOffsetMs).toISOString(), t.status, t.score]
    );
  }

  logger.info('seed: demo data ensured.', { ownerId, insertedTopics: inserted });
  return inserted > 0;
}

/**
 * Reassigns topics / schedules / attempts owned by duplicate web channel users
 * (created by earlier versions that passed the DB row id as channel_user_id)
 * back to the primary owner, then removes the duplicate user rows.
 */
export async function reclaimWebTopics(ownerId) {
  const dupUsers = await dbQuery.all(
    `SELECT id FROM users WHERE channel = 'web' AND id != ?`,
    [ownerId]
  );
  for (const u of dupUsers) {
    await dbQuery.run('UPDATE topics SET user_id = ? WHERE user_id = ?', [ownerId, u.id]);
    await dbQuery.run('UPDATE review_schedule SET user_id = ? WHERE user_id = ?', [ownerId, u.id]);
    await dbQuery.run('UPDATE quiz_attempts SET user_id = ? WHERE user_id = ?', [ownerId, u.id]);
    await dbQuery.run('DELETE FROM users WHERE id = ?', [u.id]);
  }
  if (dupUsers.length > 0) {
    logger.info('seed: reclaimed data from duplicate web users.', { ownerId, mergedUsers: dupUsers.length });
  }
  return dupUsers.length;
}

export { parseKeyPoints };