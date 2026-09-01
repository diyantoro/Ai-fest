"""Utilitas bersama untuk skill-skill StudyBuddy.

Dipanggil via `sys.path` (script skill dijalankan langsung, bukan sebagai
paket). Memusatkan helper/path yang dipakai banyak skill agar tidak
terduplikasi.  Hanya Python standard library.
"""

import re
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = REPO_ROOT / "data"


def resolve_json(value: str, base_dir: Path) -> Path:
    """Ubah input menjadi Path; bila path tidak ada, cari base_dir/<value>.json."""
    path = Path(value)
    if not path.exists():
        candidate = base_dir / f"{value}.json"
        if candidate.exists():
            return candidate
        raise FileNotFoundError(f"File tidak ditemukan: {value}")
    return path


def slugify(title: str, fallback: str = "document") -> str:
    """Buat slug aman untuk nama file dari sebuah judul/title."""
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", title.strip().lower()).strip("-")
    return slug or fallback