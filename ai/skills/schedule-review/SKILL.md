---
name: schedule-review
description: Mengelola jadwal spaced repetition dan menampilkan item yang harus direview hari ini (heartbeat); state di data/reviews/.
---

# Skill: Schedule Review (Spaced Repetition + Heartbeat)

Repository: StudyBuddy — AI Personal Learning Agent
Bagian: AI/OpenClaw (diyan)

## Tujuan

Mengelola jadwal review ulang (spaced repetition) untuk konten belajar, dan
menghasilkan "heartbeat" — daftar item yang perlu direview hari ini sebagai
pengingat (reminder). State jadwal tersimpan secara persisten sehingga
tingkat penguasaan seseorang bertahap menguat.

## Alur

1. Terima satu atau lebih hasil penilaian (grade) — mis. dari `grade-answer`.
   Bila sudah ada file state review sebelumnya, muat state tersebut.
2. Untuk tiap soal yang dinilai, perbarui metrik spaced repetition:
   - `interval`  : jarak antar review (hari), naik saat lupa.
   - `due`       : tanggal review berikutnya.
   - `reps`      : jumlah review sukses beruntun.
   - `ease`      : faktor kemudahan (naik turun mengikuti performa).
   - `success`   : jumlah benar / total (untuk angka akurasi).
3. Simpan state terbaru ke `data/reviews/<slug>.json`.
4. Output "heartbeat": daftar item yang `due <= hari ini` (perlu direview).

## Input

- `--grade <id|path>` : file hasil grading (bisa diulang). Bila kosong, hanya
  menghitung heartbeat dari state yang sudah ada.
- `--state <path>`    : path file state (default `data/reviews/<slug>.json`).
- `--days`            : offset hari acuan untuk heartbeat (default 0 = hari ini).

## Output

- State disimpan di `data/reviews/<slug>.json`.
- Ke stdout: perbaruan tiap item + daftar heartbeat (item yang jatuh tempo).

## Catatan

- Hanya Python standard library.
- Algoritma ini adalah spaced repetition sederhana (inspirasi SM-2):
  jawaban benar memperpanjang interval (`ease`), jawaban salah me-reset interval
  ke 1 hari dan menurunkan `ease`. Ini penjadwalan, bukan evaluasi esai.
- Struktur state ini menjadi dasar "persistent memory" (skill berikutnya).
- Satu pemanggilan = perbarui state sekaligus print heartbeat.
