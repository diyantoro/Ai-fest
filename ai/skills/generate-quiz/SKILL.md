# Skill: Generate Quiz

Repository: StudyBuddy — AI Personal Learning Agent
Bagian: AI/OpenClaw (diyan)

## Tujuan

Membaca sebuah dokumen (hasil ingest) atau konten teks dan menghasilkan
kuis pilihan ganda (multiple choice) untuk latihan. Hasil disimpan sebagai
JSON di `data/quizzes/` agar bisa dipakai oleh skill `grade-answer`.

## Alur

1. Terima input: `--doc <id|path>` (dokumen ter-ingest) atau
   `--text "..."` (konten langsung). Opsional `--summary <id|path>` untuk
   membangun kuis dari file ringkasan.
2. Muat konten dan pilih kalimat-kalimat yang cukup substantif
   (panjang minimal tertentu).
3. Untuk tiap kalimat buat satu pertanyaan:
   - Pertanyaan berdasar kalimat, dengan satu frasa kunci dihilangkan
     (klausa "Isi titik-titik di kalimat berikut").
   - Jawaban benar = frasa kunci asli.
   - Distraktor = frasa kunci dari kalimat lain / generik.
4. Simpan sebagai JSON di `data/quizzes/<slug>.json`.
5. Kembalikan path dan daftar pertanyaan ke caller.

## Input

- `--doc <id|path>`   : dokumen ter-ingest (contoh: `bab1-komputer`).
- `--text "..."`      : konten langsung (kecepatan/ringkas).
- `--summary <id|path>`: membangun kuis dari ringkasan (opsional).
- Minimal salah satu `--doc`/`--text`.

## Output

- JSON di `data/quizzes/<slug>.json` berisi:
  - `source`       : id/path sumber
  - `questions`    : [ {id, question, options:[...], answer_index} ]
  - `created_at`   : ISO timestamp
  - `stats`        : jumlah pertanyaan

## Catatan

- Hanya Python standard library.
- Kuis berbasis heuristik. Struktur JSON sudah siap dipakai `grade-answer`
  dan bisa ditingkatkan kualitasnya oleh model AI di layer agent.
- Satu pemanggilan = satu file kuis.
