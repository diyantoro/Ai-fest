#!/usr/bin/env python3
"""Skill: Generate Summary — StudyBuddy AI Personal Learning Agent.

Membaca dokumen hasil ingest (data/ingested) atau teks langsung, lalu
menghasilkan ringkasan terstruktur (bullets + key_concepts) dan menyimpannya
ke data/summaries/.  Hanya Python standard library.

Pemakaian:
    python3 summary.py --doc <id-atau-path>
    python3 summary.py --text "teks langsung..."
"""

import argparse
import json
import re
import sys
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

# Agar modul _common (di ai/skills/) bisa diimpor saat script dijalankan langsung.
if str(Path(__file__).resolve().parents[1]) not in sys.path:
    sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from _common import DATA_DIR, resolve_json, slugify

INGEST_DIR = DATA_DIR / "ingested"
SUMMARY_DIR = DATA_DIR / "summaries"

STOPWORDS = {
    "yang", "dan", "di", "ke", "dari", "untuk", "dengan", "pada", "adalah",
    "ini", "itu", "atau", "juga", "akan", "tidak", "serta", "dalam", "para",
    "oleh", "sebagai", "antar", "karena", "agar", "bagi", "the", "and", "of",
    "to", "a", "an", "in", "is", "are", "for", "on", "with", "that", "this",
}


def load_text(doc: str | None, text: str | None) -> tuple[str, str | None]:
    """Kembalikan (content, doc_id)."""
    if doc:
        path = resolve_json(doc, INGEST_DIR)
        if path.suffix.lower() == ".json":
            data = json.loads(path.read_text(encoding="utf-8"))
            return data.get("content", ""), data.get("id", path.stem)
        content = path.read_text(encoding="utf-8")
        return content, path.stem
    if text:
        return text, None
    raise ValueError("Berikan --doc atau --text.")


def split_sentences(text: str) -> list[str]:
    parts = re.split(r"(?<=[.!?])\s+|\n+", text.strip())
    return [p.strip() for p in parts if p.strip()]


def extract_key_concepts(text: str, limit: int = 5) -> list[str]:
    words = re.findall(r"[A-Za-z]{4,}", text.lower())
    filtered = [w for w in words if w not in STOPWORDS]
    common = Counter(filtered)
    return [w.title() for w, _ in common.most_common(limit) if w]


def generate_summary(text: str, limit: int = 6) -> dict:
    sentences = split_sentences(text)
    if not sentences:
        return {"bullets": [], "key_concepts": []}

    bullets = []
    for s in sentences[:limit]:
        s = s.rstrip(".").strip()
        if s:
            bullets.append(s.capitalize())

    key_concepts = extract_key_concepts(text)
    return {"bullets": bullets, "key_concepts": key_concepts}


def main(argv=None):
    parser = argparse.ArgumentParser(description="Generate summary StudyBuddy")
    parser.add_argument("--doc", help="Id dokumen ter-ingest atau path file")
    parser.add_argument("--text", help="Teks langsung untuk diringkas")
    parser.add_argument("--bullets", type=int, default=6,
                        help="Jumlah poin maksimal (default 6)")
    parser.add_argument("--out-dir", default=str(SUMMARY_DIR),
                        help=f"Folder output (default: {SUMMARY_DIR})")
    args = parser.parse_args(argv)

    content, doc_id = load_text(args.doc, args.text)
    if not content.strip():
        raise ValueError("Konten kosong, tidak bisa meringkas.")

    result = generate_summary(content, limit=args.bullets)
    now = datetime.now(timezone.utc).isoformat()

    title = doc_id or "direct-text"
    slug = slugify(title)
    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"{slug}.json"

    payload = {
        "doc_id": doc_id,
        "title": title,
        "summary": result,
        "created_at": now,
        "stats": {
            "bullets": len(result["bullets"]),
            "key_concepts": len(result["key_concepts"]),
        },
    }
    out_path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    print(json.dumps({
        "ok": True,
        "path": str(out_path),
        "title": title,
        "bullets": result["bullets"],
        "key_concepts": result["key_concepts"],
    }, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (FileNotFoundError, ValueError) as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
