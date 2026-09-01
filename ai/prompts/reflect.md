# Prompt — Heartbeat / Reminder

Template untuk mengubah output heartbeat (`schedule.py`) menjadi pesan
pengingat yang ramah di awal sesi.

## Input (ganti placeholder)

```json
{
  "reference_date": "2026-09-01",
  "heartbeat": [
    {"id": "jaringan::1", "due": "2026-09-01", "accuracy": 0.33}
  ],
  "weak_topics": ["bab1-komputer-jaringan"]
}
```

## Prompt

```
Kamu StudyBuddy. Buat pesan pembuka singkat (maks 3 kalimat) untuk hari
INI: {reference_date}.

Daftar materi yang perlu diulang hari ini:
{heartbeat}

Topik yang masih lemah (akurasi < 0.7):
{weak_topics}

Buat pesan yang:
1. Menyebutkan berapa item yang menunggu review hari ini dan topik/pertanyaannya
2. Menyoroti 1 topik lemah untuk dikuatkan
3. Mengajak user memilih: langsung review, atau lanjut materi baru
Gunakan Bahasa Indonesia, nada ramah dan ringkas, tanpa emoji berlebihan.
```

## Contoh Output

```
Halo! Ada 1 item yang sudah waktunya direview hari ini soal "jaringan" —
kuasanya masih belum stabil (33%). Mau sekalian menguatkan yang itu, atau
lanjut ke materi baru dulu?
```

## Catatan

- Jalankan pembacaan heartbeat tanpa `--grade` agar tanggal acuannya tidak
  berubah oleh update jadwal.
- Placeholder `{...}` diisi dari output script `schedule.py --state <path>`
  dan `memory.py --show`.