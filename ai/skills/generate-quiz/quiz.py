#!/usr/bin/env python3
"""Skill: Generate Quiz — StudyBuddy AI Personal Learning Agent.

Membaca dokumen/summary/teks lalu menghasilkan kuis pilihan ganda dan
menyimpannya ke data/quizzes/.  Hanya Python standard library.

Pemakaian:
    python3 quiz.py --doc bab1-komputer
    python3 quiz.py --text "konten..."
    python3 quiz.py --summary <id-atau-path>
"""

import argparse
import json
import random
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

# Agar modul _common (di ai/skills/) bisa diimpor saat script dijalankan langsung.
if str(Path(__file__).resolve().parents[1]) not in sys.path:
    sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from _common import DATA_DIR, resolve_json, slugify

INGEST_DIR = DATA_DIR / "ingested"
SUMMARY_DIR = DATA_DIR / "summaries"
QUIZ_DIR = DATA_DIR / "quizzes"

MIN_SENT_LEN = 30


def load_content(args) -> tuple[str, str]:
    """Kembalikan (content, source_label)."""
    if args.summary:
        path = resolve_json(args.summary, SUMMARY_DIR)
        data = json.loads(path.read_text(encoding="utf-8"))
        s = data.get("summary", {})
        bullets = s.get("bullets", [])
        content = "\n".join(bullets)
        return content, data.get("title", path.stem)
    if args.doc:
        path = resolve_json(args.doc, INGEST_DIR)
        data = json.loads(path.read_text(encoding="utf-8"))
        return data.get("content", ""), data.get("id", path.stem)
    if args.text:
        return args.text, "direct-text"
    raise ValueError("Berikan --doc, --text, atau --summary.")


def split_sentences(text: str) -> list[str]:
    parts = re.split(r"(?<=[.!?])\s+|\n+", text.strip())
    return [p.strip() for p in parts if len(p.strip()) >= MIN_SENT_LEN]


def pick_phrase(sentence: str) -> str:
    """Pilih frasa kunci (kata dengan >=4 huruf) yang paling sering muncul."""
    words = re.findall(r"[A-Za-z]{4,}", sentence)
    if not words:
        # fallback: kata terpanjang
        allw = re.findall(r"[A-Za-z]+", sentence)
        words = allw or sentence.split()
    freq = {}
    for w in words:
        freq[w] = freq.get(w, 0) + 1
    # Urutkan berdasarkan frekuensi turun, lalu panjang.
    target = sorted(words, key=lambda w: (-freq[w], -len(w)))[0]
    return target


FALLBACK_WORDS = [
    "sistem", "proses", "data", "perangkat", "pengguna", "informasi",
    "jaringan", "teknik", "metode", "komponen", "layanan", "aplikasi",
]


def build_options(correct: str, bank: list[str]) -> list[str]:
    """Buat 4 opsi: jawaban benar + distraktor. Case-insensitive & tanpa duplikat."""
    options = [correct]
    seen = {correct.lower()}
    for cand in bank:
        if len(options) >= 4:
            break
        if cand and cand.lower() not in seen:
            options.append(cand)
            seen.add(cand.lower())
    for fb in FALLBACK_WORDS:
        if len(options) >= 4:
            break
        fc = fb.capitalize()
        if fc.lower() not in seen:
            options.append(fc)
            seen.add(fc.lower())
    while len(options) < 4:
        options.append(f"Pilihan {len(options) + 1}")
    return options


def generate_quiz(content: str, num: int, seed: int | None) -> dict:
    rng = random.Random(seed)
    sentences = split_sentences(content)
    rng.shuffle(sentences)
    sentences = sentences[:num]

    phrase_bank = []
    for s in sentences:
        p = pick_phrase(s)
        if p:
            phrase_bank.append(p)

    questions = []
    for i, sentence in enumerate(sentences, start=1):
        phrase = pick_phrase(sentence)
        before, sep, after = sentence.partition(phrase)
        stem = f"{before}______{after}".strip().rstrip(".").strip()
        question_text = f"Isi titik-titik: {stem}"
        options = build_options(phrase.capitalize(), phrase_bank)
        rng.shuffle(options)
        answer_index = options.index(phrase.capitalize())
        questions.append({
            "id": i,
            "question": question_text,
            "options": options,
            "answer_index": answer_index,
            "answer": options[answer_index],
        })
    return {"questions": questions}


def main(argv=None):
    parser = argparse.ArgumentParser(description="Generate quiz StudyBuddy")
    parser.add_argument("--doc", help="Id dokumen ter-ingest atau path")
    parser.add_argument("--text", help="Konten langsung")
    parser.add_argument("--summary", help="Id/path file ringkasan")
    parser.add_argument("--num", type=int, default=5,
                        help="Jumlah pertanyaan (default 5)")
    parser.add_argument("--seed", type=int, default=None,
                        help="Seed acak agar hasil bisa direproduksi")
    parser.add_argument("--out-dir", default=str(QUIZ_DIR),
                        help=f"Folder output (default: {QUIZ_DIR})")
    args = parser.parse_args(argv)

    content, title = load_content(args)
    if not content.strip():
        raise ValueError("Konten kosong, tidak bisa membuat kuis.")

    result = generate_quiz(content, max(1, args.num), args.seed)
    now = datetime.now(timezone.utc).isoformat()
    slug = slugify(title)

    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"{slug}.json"
    payload = {
        "source": title,
        "questions": result["questions"],
        "created_at": now,
        "stats": {"questions": len(result["questions"])},
    }
    out_path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    print(json.dumps({
        "ok": True,
        "path": str(out_path),
        "title": title,
        "questions": result["questions"],
    }, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (FileNotFoundError, ValueError) as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
