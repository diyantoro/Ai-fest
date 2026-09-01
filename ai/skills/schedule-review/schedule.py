#!/usr/bin/env python3
"""Skill: Schedule Review (Spaced Repetition + Heartbeat) — StudyBuddy.

Memperbarui jadwal review (spaced repetition) dari hasil penilaian dan
menghasilkan "heartbeat": daftar item yang perlu direview hari ini.
State tersimpan persisten di data/reviews/.  Python stdlib.

Pemakaian:
    python3 schedule.py --grade bab1-komputer-jaringan --days 3
    python3 schedule.py --days 0       # hanya heartbeat dari state lama
    python3 schedule.py --grade a --grade b --days 0
"""

import argparse
import json
import sys
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

# Agar modul _common (di ai/skills/) bisa diimpor saat script dijalankan langsung.
if str(Path(__file__).resolve().parents[1]) not in sys.path:
    sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from _common import DATA_DIR, resolve_json, slugify

GRADE_DIR = DATA_DIR / "grades"
REVIEW_DIR = DATA_DIR / "reviews"

# Parameter spaced repetition awal (inspirasi SM-2).
DEFAULT_INTERVAL = 1
DEFAULT_EASE = 2.5
EASE_MIN = 1.3
EASE_UP = 0.15
EASE_DOWN = 0.3


def today_iso() -> str:
    return datetime.now(timezone.utc).date().isoformat()


def load_state(path: Path) -> dict:
    if path.exists():
        return json.loads(path.read_text(encoding="utf-8"))
    return {"items": {}, "updated_at": None}


def save_state(path: Path, state: dict):
    path.parent.mkdir(parents=True, exist_ok=True)
    state["updated_at"] = datetime.now(timezone.utc).isoformat()
    path.write_text(
        json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8"
    )


def advance(item: dict, correct: bool, ref: date):
    """Perbarui metrik spaced repetition satu item untuk satu review."""
    interval = item.get("interval", DEFAULT_INTERVAL)
    reps = item.get("reps", 0)
    ease = item.get("ease", DEFAULT_EASE)
    success = item.get("success", 0)
    total = item.get("total", 0)

    total += 1
    item["total"] = total
    if correct:
        success += 1
        item["success"] = success
        reps += 1
        item["reps"] = reps
        # interval naik bertahap, dipercepat oleh ease
        interval = max(1, round(interval * ease))
        # ease naik perlahan setelah beberapa review sukses
        if reps >= 3:
            ease = min(3.0, ease + EASE_UP)
    else:
        # lupa: reset interval ke 1 hari, reps turun
        interval = 1
        item["reps"] = 0
        ease = max(EASE_MIN, ease - EASE_DOWN)

    item["interval"] = interval
    item["ease"] = round(ease, 2)
    item["due"] = (ref + timedelta(days=interval)).isoformat()
    item["accuracy"] = round(success / total, 2)
    return item


def main(argv=None):
    parser = argparse.ArgumentParser(
        description="Schedule review (spaced repetition + heartbeat) StudyBuddy")
    parser.add_argument("--grade", action="append", default=[],
                        help="Id/path hasil grading (boleh diulang)")
    parser.add_argument("--state", default=None,
                        help="Path file state (default: data/reviews/<slug>.json)")
    parser.add_argument("--days", type=int, default=0,
                        help="Offset hari acuan untuk heartbeat (default 0 = hari ini)")
    args = parser.parse_args(argv)

    ref = date.today() + timedelta(days=args.days)

    # Tentukan path state (berdasar grade pertama bila ada, atau derive).
    if args.state:
        state_path = Path(args.state)
    elif args.grade:
        first = resolve_json(args.grade[0], GRADE_DIR)
        state_path = REVIEW_DIR / f"{first.stem}.json"
    else:
        raise ValueError("Berikan setidaknya --grade atau --state.")

    state = load_state(state_path)
    items = state["items"]

    for g in args.grade:
        grade_path = resolve_json(g, GRADE_DIR)
        grade = json.loads(grade_path.read_text(encoding="utf-8"))
        source = grade.get("source", grade_path.stem)
        for res in grade["results"]:
            qid = res["id"]
            label = f"{source}::{qid}"
            item = items.get(label, {
                "title": res["question"],
                "interval": DEFAULT_INTERVAL,
                "ease": DEFAULT_EASE,
                "reps": 0,
                "due": today_iso(),
                "success": 0,
                "total": 0,
                "accuracy": 0.0,
            })
            # Hanya advance item yang memang jatuh tempo pada/referensi hari ini.
            # Item yang belum waktunya tidak di-advance supaya spaced repetition
            # tidak menyimpang saat mengirim hasil grade baru.
            if item["due"] <= ref.isoformat():
                items[label] = advance(item, res["correct"], ref)

    save_state(state_path, state)

    # Heartbeat: item yang jatuh tempo <= hari referensi.
    due_today = [
        {"id": k, "due": v["due"], "accuracy": v.get("accuracy", 0.0)}
        for k, v in items.items() if v["due"] <= ref.isoformat()
    ]
    due_today.sort(key=lambda x: x["due"])

    print(json.dumps({
        "ok": True,
        "state": str(state_path),
        "reference_date": ref.isoformat(),
        "grades_processed": len(args.grade),
        "heartbeat_count": len(due_today),
        "heartbeat": due_today,
        "items": [
            {"id": k, "interval": v["interval"], "ease": v["ease"],
             "reps": v["reps"], "accuracy": v.get("accuracy", 0.0),
             "due": v["due"]}
            for k, v in items.items()
        ],
    }, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (FileNotFoundError, ValueError) as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
