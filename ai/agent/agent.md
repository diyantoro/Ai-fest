# Agent: StudyBuddy (AI Personal Learning Agent)

Repository: StudyBuddy — AI Personal Learning Agent
Bagian: AI/OpenClaw (diyan)
Fungsi: definisi agent + pemetaan skill, memory, dan heartbeat.

## Peran

StudyBuddy adalah asisten belajar personal. Agent ini membantu mahasiswa:
1. Menerima bahan belajar dan menyimpannya (ingest).
2. Meringkas materi (summary).
3. Membuat latihan soal (quiz).
4. Menilai jawaban (grade).
5. Menjadwalkan ulang materi yang sulit (spaced repetition).
6. Mengingatkan materi yang perlu diulang (heartbeat/reminder).
7. Mengingat profil & progress pembelajar antar sesi (persistent memory).

## Tools (pemetaan ke skill)

Agent memanggil script berikut sesuai kebutuhan. Semua Python standard library.

| Tujuan          | Perintah |
|-----------------|----------|
| Ingest material | `python3 ai/skills/ingest-material/ingest.py --file <path>` |
| Generate summary| `python3 ai/skills/generate-summary/summary.py --doc <id>` |
| Generate quiz   | `python3 ai/skills/generate-quiz/quiz.py --doc <id> --num N` |
| Grade answer    | `python3 ai/skills/grade-answer/grade.py --quiz <id> --answers '<json>'` |
| Schedule review | `python3 ai/skills/schedule-review/schedule.py --grade <id> [--days D]` |
| Heartbeat       | `python3 ai/skills/schedule-review/schedule.py --state <path> [--days 0]` |
| Persistent memory | `python3 ai/agent/memory.py [--profile NAMA] [--show]` |

## Kontrak Data

Semua artefak disimpan di `data/` agar persisten dan bisa dibaca skill lain:

- `data/ingested/<id>.json` — dokumen ternormalisasi.
- `data/summaries/<id>.json` — ringkasan.
- `data/quizzes/<id>.json` — kuis pilihan ganda.
- `data/grades/<id>.json` — hasil penilaian.
- `data/reviews/<id>.json` — state spaced repetition.
- `data/memory/<profile>.json` — memori jangka panjang pembelajaran.

Folder `data/` (isi) ter-ignore oleh git; `.gitkeep` tetap di-commit.

## Workflow Agent

Alur utama tiap sesi belajar:

1. **Ingest** — terima bahan (unggah/teks), simpan sebagai dokumen.
2. **Summary** — ringkas dokumen jadi poin & konsep kunci.
3. **Quiz** — buat soal dari dokumen/summary.
4. **Grade** — terima jawaban, nilai, simpulkan skor.
5. **Schedule** — perbarui spaced repetition dari hasil grade.
6. **Heartbeat** — tiap awal sesi, baca `data/reviews` → daftar item yang
   jatuh tempo hari ini → tampilkan sebagai pengingat.
7. **Memory** — update profil pembelajar (akurasi per topik, topik lemah,
   item jatuh tempo) agar rekomendasi selanjutnya personal.

## Memory (persistent)

- `memory.py` mengagregasi semua artefak di atas menjadi profil per user di
  `data/memory/<profile>.json`.
- Berisi: `stats` (jumlah kuis, akurasi), `topics` (akurasi per topik),
  `weak_topics` (topik yang masih di bawah ambang), `due_today` (item yang
  perlu diulang), `history` (riwayat sesi).
- Agent memakainya untuk: menyapa user sesuai progress, menyarankan topik
  lemah untuk dikuatkan, dan tidak mengulang materi yang sudah dikuasai.

## Heartbeat / Reminder

- Dihitung dari `schedule.py --state` dengan membandingkan `due` terhadap
  tanggal hari ini (offset `--days`).
- Pesan pengingat diformat menggunakan prompt di `ai/prompts/reflect.md`.
- Dijalankan otomatis di awal setiap interaksi sesi.

## Prompt

- `ai/prompts/system.md` — system prompt utama agent.
- `ai/prompts/reflect.md` — template pesan reminder berbasis heartbeat.

## Catatan

- Skill saat ini deterministik (heuristik). Bila model LLM dikonfigurasi,
  prompt di `ai/prompts/` bisa mengarahkan model untuk menghasilkan output
  yang lebih natural (summary bertulisan baik, feedback kualitatif), dengan
  tetap menulis hasil ke `data/` sesuai kontrak di atas.
- Jangan mengubah kontrak data tanpa menyesuaikan seluruh skill + memory.