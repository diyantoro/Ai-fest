---
name: generate-summary
description: Membaca hasil ingest atau teks dan menghasilkan ringkasan terstruktur (poin penting, konsep kunci) ke data/summaries/. Dipakai saat user minta ringkasan materi.
---

# Skill: Generate Summary

Repository: StudyBuddy — AI Personal Learning Agent
Bagian: AI/OpenClaw (diyan)

## Tujuan

Membaca dokumen hasil ingest (atau teks langsung) dan menghasilkan ringkasan
terstruktur yang terdiri dari poin-poin penting dan konsep kunci. Hasilnya
disimpan sebagai JSON di `data/summaries/` agar bisa dibaca skill lain
(generate-quiz, schedule-review, memory).

## Alur

1. Terima input: `--doc <id|path>` untuk memakai dokumen yang sudah di-ingest,
   atau `--text "..."` untuk teks langsung (tanpa harus melewati ingest).
2. Muat konten dokumen.
3. Bagi konten menjadi kalimat dan paragraf.
4. Hasilkan:
   - `bullets`     : daftar poin singkat dari tiap bagian utama.
   - `key_concepts`: konsep/pengertian penting dalam dokumen.
5. Simpan hasil sebagai JSON baru di `data/summaries/<slug>.json`.
6. Kembalikan path dan ringkasan singkat ke caller.

## Input

- `--doc <id|path>` : id dokumen ter-ingest (dari `data/ingested/<id>.json`)
  atau path langsung ke file JSON hasil ingest.
- `--text "..."`    : teks langsung (opsional, untuk bahan "ringkas cepat").
- Salah satu wajib.

## Output

- JSON baru di `data/summaries/<slug>.json` berisi:
  - `doc_id`      : id dokumen sumber (bila dari ingest)
  - `summary`     : `{bullets: [...], key_concepts: [...]}`
  - `created_at`  : ISO timestamp
  - `stats`       : jumlah poin & konsep

## Catatan

- Hanya memakai Python standard library (tanpa dependency baru).
- Implementasi ringkasan berbasis heuristik (kalimat pertama, kata kunci
  frekuensi-tinggi). Untuk kualitas bahasa yang lebih baik, ringkasan ini bisa
  diganti/diisi oleh model AI di layer agent — struktur JSON-nya tetap sama.
- Satu pemanggilan = satu file ringkasan.
