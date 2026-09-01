#!/usr/bin/env python3
"""Persistent Memory — StudyBuddy AI Personal Learning Agent.

Mengagregasi semua artefak belajar yang dihasilkan skill (ingested, summaries,
grades, reviews) menjadi satu profil pembelajaran yang persisten di
data/memory/<profile>.json.  Memori ini bertahan antar sesi sehingga agent
bisa memberi rekomendasi dan pengingat yang sesuai dengan progress user.

Python standard library.

Pemakaian:
    python3 memory.py                       # update profil default "studybuddy"
    python3 memory.py --profile dewi        # profil per user
    python3 memory.py --show                # hanya tampilkan profil, tanpa update
    python3 memory.py --clear               # reset profil
"""

import argparse
import json
import sys
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

# Agar modul _common (di ai/skills/) bisa diimpor saat script dijalankan langsung.
_SKILLS_DIR = Path(__file__).resolve().parent.parent / "skills"
if str(_SKILLS_DIR) not in sys.path:
    sys.path.insert(0, str(_SKILLS_DIR))

from _common import DATA_DIR, slugify  # noqa: E402

MEMORY_DIR = DATA_DIR / "memory"

WEAK_THRESHOLD = 0.7  # topik dengan akurasi di bawah ini dianggap lemah


def _read_json(path: Path) -> dict | None:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return None


def aggregate_artifacts() -> dict:
    """Baca data/ yang dihasilkan skill dan kembalikan ringkasan terstruktur."""
    topics = defaultdict(lambda: {"attempts": 0, "correct": 0, "last_pct": 0.0})
    history = []
    due_items = []
    covered = []

    # Grades: tiap file = satu sesi kuis yang dinilai.
    for path in sorted((DATA_DIR / "grades").glob("*.json")):
        grade = _read_json(path) or {}
        results = grade.get("results", [])
        q_total = len(results)
        q_correct = sum(1 for r in results if r.get("correct"))
        source = grade.get("source", path.stem)
        pct = round(q_correct / q_total * 100, 1) if q_total else 0.0
        topics[source]["attempts"] += q_total
        topics[source]["correct"] += q_correct
        topics[source]["last_pct"] = pct
        if q_total:
            history.append({
                "source": source,
                "date": grade.get("created_at", ""),
                "correct": q_correct,
                "total": q_total,
                "percentage": pct,
            })

    # Reviews: state spaced repetition → akurasi per item + item jatuh tempo.
    for path in sorted((DATA_DIR / "reviews").glob("*.json")):
        state = _read_json(path) or {}
        for qid, item in state.get("items", {}).items():
            acc = item.get("accuracy", 0.0)
            if item.get("due", "") and item["due"] <= datetime.now(timezone.utc).date().isoformat():
                due_items.append({"id": qid, "due": item["due"], "accuracy": acc})

    # Summaries: daftar topik yang pernah diringkas.
    for path in sorted((DATA_DIR / "summaries").glob("*.json")):
        summ = _read_json(path) or {}
        covered.append(summ.get("title") or path.stem)

    # Gabungkan akurasi review ke topik (berdasarkan awalan id).
    for path in sorted((DATA_DIR / "reviews").glob("*.json")):
        state = _read_json(path) or {}
        for qid, item in state.get("items", {}).items():
            source = qid.split("::")[0]
            t = topics[source]
            # akurasi review menggabung; represikan sebagai correct dari total review
            t["correct"] += round(item.get("accuracy", 0.0) * item.get("total", 0))
            t["attempts"] += item.get("total", 0)

    return {"topics": dict(topics), "history": history,
            "due_items": due_items, "covered": covered}


def compute_profile(learner: str, data: dict) -> dict:
    topics = data["topics"]
    total_attempts = sum(t["attempts"] for t in topics.values())
    total_correct = sum(t["correct"] for t in topics.values())
    weak = sorted(
        [{"topic": k, "accuracy": round(t["correct"] / t["attempts"], 2)
          if t["attempts"] else 0.0, "last_pct": t["last_pct"]}
         for k, t in topics.items()
         if t["attempts"] and (t["correct"] / t["attempts"]) < WEAK_THRESHOLD],
        key=lambda x: x["accuracy"],
    )
    if data["due_items"]:
        due = data["due_items"]
    else:
        due = []

    return {
        "learner": learner,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "stats": {
            "quizzes_taken": len(data["history"]),
            "questions_answered": total_attempts,
            "correct": total_correct,
            "accuracy": round(total_correct / total_attempts, 2) if total_attempts else 0.0,
        },
        "topics": {
            k: {"attempts": t["attempts"], "correct": t["correct"],
                "last_pct": t["last_pct"],
                "accuracy": round(t["correct"] / t["attempts"], 2)
                if t["attempts"] else 0.0}
            for k, t in topics.items()
        },
        "covered_topics": data["covered"],
        "weak_topics": weak,
        "due_today": due,
        "history": data["history"],
    }


def main(argv=None):
    parser = argparse.ArgumentParser(description="Persistent memory StudyBuddy")
    parser.add_argument("--profile", default="studybuddy",
                        help="Nama profil pembelajar (default: studybuddy)")
    parser.add_argument("--show", action="store_true",
                        help="Tampilkan profil tanpa memperbarui dari file data")
    parser.add_argument("--clear", action="store_true",
                        help="Hapus profil yang tersimpan")
    args = parser.parse_args(argv)

    if args.clear:
        path = MEMORY_DIR / f"{slugify(args.profile)}.json"
        if path.exists():
            path.unlink()
            print(json.dumps({"ok": True, "cleared": str(path)},
                             ensure_ascii=False, indent=2))
        else:
            print(json.dumps({"ok": True, "cleared": None}, ensure_ascii=False))
        return 0

    profile_path = MEMORY_DIR / f"{slugify(args.profile)}.json"
    if args.show:
        if not profile_path.exists():
            raise FileNotFoundError(
                f"Profil tidak ditemukan: {profile_path} (jalankan tanpa --show dulu).")
        payload = _read_json(profile_path)
    else:
        merged = aggregate_artifacts()
        payload = compute_profile(args.profile, merged)
        MEMORY_DIR.mkdir(parents=True, exist_ok=True)
        profile_path.write_text(
            json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8"
        )

    print(json.dumps({
        "ok": True,
        "path": str(profile_path),
        "learner": payload.get("learner"),
        "stats": payload.get("stats"),
        "weak_topics": [w["topic"] for w in payload.get("weak_topics", [])],
        "due_today_count": len(payload.get("due_today", [])),
    }, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (FileNotFoundError, ValueError) as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)