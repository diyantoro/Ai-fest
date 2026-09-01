---
name: grade-answer
description: Menilai jawaban kuis hasil generate-quiz dengan skor dan umpan balik per soal, disimpan di data/grades/. Dipakai saat user mengumpulkan jawaban kuis.
---

# Skill: Grade Answer

Repository: StudyBuddy — AI Personal Learning Agent
Bagian: AI/OpenClaw (diyan)

## Tujuan

Membaca file kuis (hasil `generate-quiz`) dan kumpulan jawaban pengguna,
lalu menilai tiap jawaban. Menghasilkan skor serta umpan balik dan
menyimpannya ke `data/grades/`.

## Alur

1. Terima input: `--quiz <id|path>` (file kuis) dan `--answers` (jawaban).
2. Jawaban diterima sebagai file JSON atau string JSON:
   - Format: `{"1": 0, "2": 2, ...}` — nomor soal ke indeks opsi, atau
   - `{"1": "Sistem", ...}` — nomor soal ke teks jawaban.
3. Untuk tiap soal, cocokkan jawaban dengan `answer_index` pada file kuis.
4. Hitung skor (benar / total soal).
5. Simpan hasil sebagai JSON di `data/grades/<slug>.json` berisi:
   - `source`          : id/path kuis
   - `results`         : per soal {question, user_answer, correct, correct_answer}
   - `score`           : {correct_count, total, percentage}
   - `created_at`      : ISO timestamp
6. Kembalikan skor dan rincian ke caller.

## Input

- `--quiz <id|path>`    : id atau path file kuis (default baca dari
  `data/quizzes/<id>.json`).
- `--answers <path|json>`: file JSON (`{nomor: indeks}` atau `{nomor: teks}`)
  atau string JSON langsung.
- Keduanya wajib.

## Output

- JSON di `data/grades/<slug>.json` sesuai "Alur".

## Catatan

- Hanya Python standard library.
- Penilaian deterministik berdasarkan `answer_index` pada file kuis (bukan
  teks bebas). Untuk menjawab pertanyaan esai/bebas, bisa diproses oleh model
  AI di layer agent; struktur output di sini siap dipakai untuk itu.
- Satu pemanggilan = satu penilaian (satu session kuis).
