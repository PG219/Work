from __future__ import annotations

import argparse
import json
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Any, Dict, List, Sequence
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

import pandas as pd

from regulation_crosswalk import (
    canonical_control_codes,
    canonical_library_root,
    canonical_risk_ids,
)


@dataclass
class CaseResult:
    case_id: str
    family: str
    run_index: int
    risk_ids: List[str]
    control_codes: List[str]
    deviant_risk_ids: List[str]
    fabricated_control_codes: List[str]

    @property
    def risk_deviation_count(self) -> int:
        return len(self.deviant_risk_ids)

    @property
    def control_fabrication_count(self) -> int:
        return len(self.fabricated_control_codes)


def _load_cases(path: Path) -> List[Dict[str, Any]]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(payload, list):
        raise ValueError(f"Expected a list of cases in {path}")
    return payload


def _post_json(url: str, payload: Dict[str, Any], timeout: int = 120) -> Dict[str, Any]:
    data = json.dumps(payload).encode("utf-8")
    req = Request(url, data=data, headers={"Content-Type": "application/json"}, method="POST")
    with urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8"))


def _extract_codes(rows: Sequence[Dict[str, Any]], code_key: str) -> List[str]:
    values: List[str] = []
    for row in rows:
        code = str(row.get(code_key, "")).strip()
        if code:
            values.append(code)
    return values


def _load_excel(path: Path) -> pd.DataFrame:
    df = pd.read_excel(path).fillna("")
    df.columns = [str(c).strip().lower() for c in df.columns]
    return df


def _score_row(text: str, hay: str) -> int:
    if not text or not hay:
        return 0
    tokens = [w for w in text.lower().split() if len(w) > 3]
    haystack = hay.lower()
    return sum(1 for w in tokens if w in haystack)


def _select_risks_ai(df: pd.DataFrame, summary: str) -> pd.DataFrame:
    scored = []
    for i, r in df.iterrows():
        name = str(r.get("risk name") or r.get("risk") or "")
        mit = str(r.get("mitigation") or "")
        scored.append((_score_row(summary, f"{name} {mit}"), i))
    keep = [idx for score, idx in scored if score > 0]
    return df.loc[keep] if keep else df


def _select_risks_cyber(df: pd.DataFrame, summary: str) -> pd.DataFrame:
    scored = []
    for i, r in df.iterrows():
        desc = str(r.get("risk description") or "")
        cat = str(r.get("category") or "")
        mit = str(r.get("mitigation") or "")
        scored.append((_score_row(summary, f"{desc} {cat} {mit}"), i))
    keep = [idx for score, idx in scored if score > 0]
    return df.loc[keep] if keep else df


def _ai_pipeline(summary: str) -> tuple[list[str], list[str]]:
    risks_df = _load_excel(canonical_library_root() / "predefined_risks.xlsx")
    controls_df = _load_excel(canonical_library_root() / "predefined_controls.xlsx")

    selected = _select_risks_ai(risks_df, summary)
    risk_ids = [str(v).strip() for v in selected.get("risk id", []) if str(v).strip()]
    control_codes = [str(v).strip() for v in controls_df.get("code", []) if str(v).strip()]
    return risk_ids, control_codes


def _cyber_pipeline(summary: str) -> tuple[list[str], list[str]]:
    risks_df = _load_excel(canonical_library_root() / "stride_risks.xlsx")
    controls_df = _load_excel(canonical_library_root() / "nist_controls.xlsx")

    selected = _select_risks_cyber(risks_df, summary)
    risk_ids = [str(v).strip() for v in selected.get("risk id", []) if str(v).strip()]
    control_codes = [str(v).strip() for v in controls_df.get("control id", []) if str(v).strip()]
    return risk_ids, control_codes


def _benchmark_one_case(
    case: Dict[str, Any],
    run_index: int,
    canonical_risks: Sequence[str],
    canonical_controls: Sequence[str],
) -> CaseResult:
    family = str(case.get("family", "ai")).strip().lower()
    summary = str(case.get("summary", "")).strip()
    case_id = str(case.get("id", f"case-{run_index}"))
    session_id = f"bench-{case_id[:24]}-{run_index:02d}"
    if family == "ai":
        risk_ids, control_codes = _ai_pipeline(summary)
    else:
        risk_ids, control_codes = _cyber_pipeline(summary)

    deviant_risk_ids = [rid for rid in risk_ids if rid not in canonical_risks]
    fabricated_control_codes = [cid for cid in control_codes if cid not in canonical_controls]

    return CaseResult(
        case_id=case_id,
        family=family,
        run_index=run_index,
        risk_ids=risk_ids,
        control_codes=control_codes,
        deviant_risk_ids=deviant_risk_ids,
        fabricated_control_codes=fabricated_control_codes,
    )


def _write_json(path: Path, payload: Dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2), encoding="utf-8")


def _write_csv(path: Path, rows: Sequence[Dict[str, Any]]) -> None:
    import csv

    path.parent.mkdir(parents=True, exist_ok=True)
    if not rows:
        path.write_text("", encoding="utf-8")
        return
    with path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)


def main() -> int:
    parser = argparse.ArgumentParser(description="Hallucination quantification benchmark for the governance pipeline.")
    parser.add_argument("--cases", type=Path, default=Path(__file__).with_name("questionnaire_cases.json"))
    parser.add_argument("--runs", type=int, default=5)
    parser.add_argument("--output-dir", type=Path, default=Path(__file__).with_name("benchmark_results"))
    args = parser.parse_args()

    cases = _load_cases(args.cases)
    if not cases:
        raise SystemExit("No benchmark cases found.")

    root = canonical_library_root()
    ai_risks = canonical_risk_ids(root / "predefined_risks.xlsx")
    ai_controls = canonical_control_codes(root / "predefined_controls.xlsx")
    cyber_risks = canonical_risk_ids(root / "stride_risks.xlsx")
    cyber_controls = canonical_control_codes(root / "nist_controls.xlsx")

    all_results: List[CaseResult] = []
    for case in cases:
        family = str(case.get("family", "ai")).strip().lower()
        canonical_risks = ai_risks if family == "ai" else cyber_risks
        canonical_controls = ai_controls if family == "ai" else cyber_controls
        for run_index in range(1, args.runs + 1):
            all_results.append(
                _benchmark_one_case(
                    case,
                    run_index,
                    canonical_risks,
                    canonical_controls,
                )
            )

    summary = {
        "cases": len(cases),
        "runs_per_case": args.runs,
        "total_runs": len(all_results),
        "total_risk_ids": sum(len(r.risk_ids) for r in all_results),
        "total_control_codes": sum(len(r.control_codes) for r in all_results),
        "risk_id_deviations": sum(r.risk_deviation_count for r in all_results),
        "fabricated_control_codes": sum(r.control_fabrication_count for r in all_results),
    }
    summary["risk_id_deviation_rate"] = (
        summary["risk_id_deviations"] / summary["total_risk_ids"] if summary["total_risk_ids"] else 0.0
    )
    summary["control_fabrication_rate"] = (
        summary["fabricated_control_codes"] / summary["total_control_codes"] if summary["total_control_codes"] else 0.0
    )

    output_dir = args.output_dir
    output_dir.mkdir(parents=True, exist_ok=True)
    _write_json(output_dir / "hallucination_summary.json", summary)
    _write_json(output_dir / "hallucination_runs.json", {"results": [asdict(r) for r in all_results]})
    _write_csv(output_dir / "hallucination_runs.csv", [asdict(r) for r in all_results])

    print(json.dumps(summary, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
