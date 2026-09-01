# Skill: Ingest Material

Repository: StudyBuddy — AI Personal Learning Agent
Bagian: AI/OpenClaw (diyan)

## Tujuan

Menerima bahan belajar mentah (teks, file .txt/.md) dan mengubahnya menjadi
representasi terstruktur (normalized) yang siap diproses oleh skill lain
(generate-summary, generate-quiz, dst.).

## Alur

1. Baca input berupa teks langsung atau path file teks.
2. Normalisasi teks:
   - Bersihkan whitespace berlebih di awal/akhir setiap baris.
   - Hapus baris yang hanya mengandung spasi/tab.
   - Gabungkan baris kosong berurutan menjadi satu baris kosong.
3. Himpun metadata dasar (judul dari nama file bila ada, jumlah kata,
   jumlah karakter, timestamp proses).
4. Simpan hasil sebagai satu "document" JSON di `data/ingested/`.
5. Kembalikan path dan ringkasan singkat hasil ke caller.

## Input

- `--text "..."` : teks bahan belajar langsung.
- `--file path`  : path file .txt / .md untuk diingest.
- Salah satu wajib (atau input dari stdin).

## Output

- JSON baru di `data/ingested/<slug>.json` berisi:
  - `id`, `source`, `title`
  - `content`   (teks ternormalisasi)
  - `created_at` (ISO timestamp)
  - `stats`     ({words, chars, lines}, untuk analisis ringan)

## Catatan

- Hanya memakai Python standard library (tidak ada dependency baru).
- Satu pemanggilan = satu dokumen ter-ingest. Dokumen bisa berupa bab,
  slide, catatan kuliah, artikel, dst.
- Hasil ditulis ke folder `data/` (bukan hanya stdout) agar skill lain
  (summary/quiz/memory) bisa membaca hasilnya secara terstruktur.
