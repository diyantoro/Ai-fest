#!/usr/bin/env python3
"""Skill: Ingest Material — StudyBuddy AI Personal Learning Agent.

Menerima bahan belajar mentah (teks langsung, file .txt/.md/.markdown/.rst,
atau stdin), menormalkannya, lalu menyimpan hasil sebagai satu dokumen JSON
di data/ingested/.  Hanya memakai Python standard library.

Pemakaian:
    python3 ingest.py --text "bahan belajar..."
    python3 ingest.py --file path/to/bahan.md
    python3 ingest.py --file path/to/bahan.md --title "Judul Kustom"
    cat bahan.txt | python3 ingest.py
"""

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

# Agar modul _common (di ai/skills/) bisa diimpor saat script dijalankan langsung.
if str(Path(__file__).resolve().parents[1]) not in sys.path:
    sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from _common import DATA_DIR, slugify

INGEST_DIR = DATA_DIR / "ingested"

# Ekstensi file teks yang didukung untuk ingestion.
TEXT_EXTENSIONS = {".txt", ".md", ".markdown", ".rst"}


def normalize(text: str) -> str:
    """Rapikan teks mentah.

    1. Bersihkan whitespace berlebih di awal/akhir setiap baris.
    2. Hapus baris yang hanya berisi spasi/tab.
    3. Gabungkan baris kosong berurutan menjadi satu baris kosong.
    """
    lines = []
    for raw in text.splitlines():
        line = raw.strip()
        if not line:
            lines.append("")
        else:
            lines.append(line)
    normalized = []
    prev_blank = False
    for line in lines:
        if line == "":
            if not prev_blank:
                normalized.append("")
            prev_blank = True
        else:
            normalized.append(line)
            prev_blank = False
    return "\n".join(normalized).strip()


def read_text_file(path: Path) -> str:
    """Baca file teks.

    Tahan BOM (utf-8-sig) dan fallback ke latin-1 bila utf-8 gagal.
    Cuma menerima ekstensi teks plain; selain itu ditolak dengan jelas.
    """
    ext = path.suffix.lower()
    if ext not in TEXT_EXTENSIONS:
        raise ValueError(
            f"Ekstensi tidak didukung: '{ext or '(tanpa ekstensi)'}'. "
            f"Didukung: {', '.join(sorted(TEXT_EXTENSIONS))}"
        )
    for encoding in ("utf-8-sig", "latin-1"):
        try:
            return path.read_text(encoding=encoding)
        except UnicodeDecodeError:
            continue
    raise ValueError(f"Tidak dapat membaca file sebagai teks: {path.name}")


def detect_title(text: str, fallback: str) -> str:
    """Tebak judul dari isi: heading markdown '#' dulu, lalu baris pertama."""
    for line in text.splitlines():
        line = line.strip()
        if not line:
            continue
        if line.startswith("#"):
            return line.lstrip("#").strip()[:80] or fallback
        return line[:80]
    return fallback


def load_source(args) -> tuple[str, str, str | None]:
    """Kembalikan (text, source_label, title_hint).

    source_label: 'text' | 'file' | 'stdin'
    title_hint   : judul yang bisa dipakai (nama file / awal teks / None).
    """
    if args.file:
        path = Path(args.file)
        if not path.exists():
            raise FileNotFoundError(f"File tidak ditemukan: {args.file}")
        text = read_text_file(path)
        return text, "file", path.stem
    if args.text:
        return args.text, "text", args.text[:20]
    if not sys.stdin.isatty():
        return sys.stdin.read(), "stdin", None
    raise ValueError("Berikan --text, --file, atau input lewat stdin.")


def main(argv=None):
    parser = argparse.ArgumentParser(description="Ingest bahan belajar StudyBuddy")
    parser.add_argument("--text", help="Bahan belajar sebagai teks langsung")
    parser.add_argument("--file", help="Path file teks (.txt/.md/.markdown/.rst)")
    parser.add_argument(
        "--title",
        default=None,
        help="Judul dokumen (dipakai untuk slug file). "
             "Default: judul otomatis dari isi, atau nama file.",
    )
    parser.add_argument(
        "--out-dir",
        default=str(INGEST_DIR),
        help=f"Folder output (default: {INGEST_DIR})",
    )
    args = parser.parse_args(argv)

    text, source, title_hint = load_source(args)
    if not text or not text.strip():
        raise ValueError(
            "Input kosong. Berikan --text, --file, atau isi lewat stdin."
        )
    content = normalize(text)

    if args.title:
        title = args.title
    elif source == "file" and title_hint:
        title = detect_title(content, title_hint)
    else:
        title = title_hint or "untitled"
    slug = slugify(title)

    now = datetime.now(timezone.utc).isoformat()
    words = len(content.split())
    chars = len(content)
    lines = len(content.splitlines())

    document = {
        "id": slug,
        "source": source,
        "title": title,
        "content": content,
        "created_at": now,
        "stats": {
            "words": words,
            "chars": chars,
            "lines": lines,
        },
    }

    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"{slug}.json"
    out_path.write_text(
        json.dumps(document, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    print(json.dumps({
        "ok": True,
        "path": str(out_path),
        "id": slug,
        "title": title,
        "stats": document["stats"],
    }, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (FileNotFoundError, ValueError) as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)