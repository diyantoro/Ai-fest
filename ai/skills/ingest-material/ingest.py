#!/usr/bin/env python3
"""StudyBuddy - Skill: Ingest Material.

Membaca bahan belajar mentah (teks / file teks), menormalkannya, lalu
menyimpan hasil sebagai dokumen JSON terstruktur di data/ingested/.

Hanya menggunakan Python standard library.
"""

import argparse
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

DEFAULT_OUTPUT_DIR = Path(__file__).resolve().parents[3] / "data" / "ingested"


def slugify(text: str) -> str:
    """Buat slug aman untuk nama file dari sebuah judul/teks."""
    text = text.strip().lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    text = text.strip("-")
    return text or "document"


def normalize(raw: str) -> str:
    """Normalisasi teks bahan belajar.

    - Trim whitespace per baris.
    - Buang baris yang hanya spasi/tab.
    - Gabungkan baris kosong berurutan jadi satu.
    """
    lines = [line.strip() for line in raw.splitlines()]
    lines = [line for line in lines if line != ""]

    result: list[str] = []
    prev_blank = False
    for line in lines:
        if line == "":
            if not prev_blank:
                result.append("")
            prev_blank = True
        else:
            result.append(line)
            prev_blank = False
    return "\n".join(result)


def read_input(args) -> str:
    """Baca teks mentah dari --text, --file, atau stdin."""
    if args.file:
        path = Path(args.file)
        if not path.is_file():
            raise FileNotFoundError(f"File tidak ditemukan: {args.file}")
        return path.read_text(encoding="utf-8")
    if args.text:
        return args.text
    if not sys.stdin.isatty():
        return sys.stdin.read()
    raise ValueError("Tidak ada input. Gunakan --text, --file, atau stdin.")


def build_document(raw: str, source: str, title: str, output_dir: Path) -> dict:
    """Buat struktur dokumen JSON dari teks yang sudah dinormalisasi."""
    content = normalize(raw)
    words = len(content.split())
    lines = len([ln for ln in content.splitlines() if ln != ""])

    doc = {
        "id": slugify(title),
        "source": source,
        "title": title if title else slugify(title),
        "content": content,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "stats": {"words": words, "chars": len(content), "lines": lines},
    }

    out_path = output_dir / f"{doc['id']}.json"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(
        json.dumps(doc, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    return doc


def parse_args(argv=None):
    parser = argparse.ArgumentParser(
        description="StudyBuddy ingest-material: normalisasi bahan belajar."
    )
    parser.add_argument("--text", help="Teks bahan belajar langsung.")
    parser.add_argument("--file", help="Path file .txt / .md untuk diingest.")
    parser.add_argument("--title", default="", help="Judul dokumen (opsional).")
    parser.add_argument(
        "--output-dir",
        default=str(DEFAULT_OUTPUT_DIR),
        help="Direktori output dokumen ter-ingest.",
    )
    return parser.parse_args(argv)


def main(argv=None) -> int:
    args = parse_args(argv)
    try:
        raw = read_input(args)
        output_dir = Path(args.output_dir)
        title = args.title or Path(args.file).stem if args.file else args.title
        doc = build_document(raw, args.file or "stdin", title, output_dir)
    except (ValueError, FileNotFoundError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1

    out_path = Path(args.output_dir) / f"{doc['id']}.json"
    print(f"OK  ingest-material -> {out_path}")
    print(f"    id      : {doc['id']}")
    print(f"    words   : {doc['stats']['words']}")
    print(f"    chars   : {doc['stats']['chars']}")
    print(f"    lines   : {doc['stats']['lines']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
