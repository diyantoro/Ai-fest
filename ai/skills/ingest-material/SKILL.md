---
name: ingest-material
description: Terima material belajar (file teks, teks langsung, atau stdin) dan simpan sebagai dokumen JSON terstruktur di data/ingested/.
---

# Skill: Ingest Material

Repository: StudyBuddy — AI Personal Learning Agent
Bagian: AI/OpenClaw (diyan)

## Kapan Dipakai

Gunakan skill ini ketika user **membawa bahan belajar baru** yang harus
diproses lebih lanjut — misal file materi, catatan kuliah, artikel teks, atau
slide dalam bentuk teks. Hasilnya menjadi **input terstruktur** untuk skill
lain (generate-summary, generate-quiz, schedule-review, memory).

Jangan dipakai untuk pertanyaan umum, diskusi, atau materi yang hanya lewat
(pilih `--text` jika materi pendek sekaligus).

## Cara Panggil (dari agent)

```bash
# File (judul otomatis dari heading `#` atau baris pertama)
python3 {baseDir}/ingest.py --file <path>

# Teks langsung
python3 {baseDir}/ingest.py --text "bahan belajar..."

# Judul kustom untuk mengendalikan slug/id
python3 {baseDir}/ingest.py --file <path> --title "Judul"

# stdin
cat bahan.txt | python3 {baseDir}/ingest.py
```

Ekstensi teks yang didukung: `.txt`, `.md`, `.markdown`, `.rst`. File lain
ditolak dengan pesan error yang jelas.

## Alur

1. Baca input: file teks, teks langsung, atau stdin.
2. Normalisasi teks:
   - Bersihkan whitespace berlebih di awal/akhir setiap baris.
   - Hapus baris yang hanya berisi spasi/tab.
   - Gabungkan baris kosong berurutan menjadi satu baris kosong.
3. Tentukan judul: `--title` > heading markdown pertama / baris pertama
   (untuk file) > nama file / awal teks.
4. Himpun metadata dasar (judul, jumlah kata, karakter, baris, timestamp).
5. Simpan hasil sebagai satu "document" JSON di `data/ingested/<id>.json`.
6. Kembalikan path `id`, `title`, dan `stats` ke caller.

## Output (kontrak disimpan ke `data/ingested/`)

```json
{
  "id": "<slug>",
  "source": "file|text|stdin",
  "title": "<judul>",
  "content": "<teks ternormalisasi>",
  "created_at": "<ISO timestamp>",
  "stats": { "words": 0, "chars": 0, "lines": 0 }
}
```

- `id` diturunkan dari judul (slug). Judul sama → file sama akan tertimpa.
- `content` ternormalisasi siap dibaca skill lain.

## Catatan

- Hanya memakai Python standard library — tanpa dependency baru.
- Satu pemanggilan = satu dokumen ter-ingest (bab/slide/catatan/artikel).
- File dibaca dengan `utf-8-sig` (tahan BOM), fallback `latin-1`.
- Hasil ditulis ke `data/` (bukan hanya stdout) agar skill lain bisa membaca
  hasilnya secara terstruktur dan persisten.