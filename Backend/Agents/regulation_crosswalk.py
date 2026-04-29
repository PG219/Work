from __future__ import annotations

import csv
import json
from pathlib import Path
from typing import Any, Dict, Iterable, List

import pandas as pd

FRAMEWORKS = ("EU", "NIST", "ISO")

# Canonical governance cross-walk used by the scoring agent and exported for the paper.
REGULATION_MAPPING: Dict[str, Dict[str, Dict[str, str]]] = {
    "controls": {
        "human_oversight_design": {"EU": "Art. 14", "NIST": "Gov-4.2", "ISO": "Cl. 9.3"},
        "incident_response": {"EU": "Art. 62", "NIST": "Mng-5", "ISO": "Cl. 10.1"},
        "monitoring_bias_drift": {"EU": "Art. 15", "NIST": "Msr-2.4", "ISO": "Cl. 9.1"},
        "third_party_validation": {"EU": "Art. 17", "NIST": "Gov-5.3", "ISO": "Cl. 9.2"},
        "policy_aimgov": {"EU": "Art. 4", "NIST": "Gov-1.1", "ISO": "Cl. 5.2"},
        "risk_register": {"EU": "Art. 9", "NIST": "Map-1", "ISO": "Cl. 6.1"},
        "dpia_pia": {"EU": "Art. 35", "NIST": "Map-2", "ISO": "Cl. 6.1"},
        "model_docs": {"EU": "Art. 11", "NIST": "Gov-2", "ISO": "Cl. 7.5"},
        "security_mlsdlc": {"EU": "Art. 15", "NIST": "Manage-1", "ISO": "Cl. 8.1"},
        "monitoring_metrics": {"EU": "Art. 15", "NIST": "Msr-2", "ISO": "Cl. 9.1.1"},
    },
    "questions": {
        "risk_classification": {"EU": "Art. 6", "NIST": "Map-1", "ISO": "Cl. 8.2"},
        "docs_traceability": {"EU": "Art. 11", "NIST": "Gov-2", "ISO": "Cl. 7.5"},
        "independent_validation": {"EU": "Art. 17", "NIST": "Gov-5", "ISO": "Cl. 9.2"},
        "monitoring_metrics": {"EU": "Art. 15", "NIST": "Msr-2", "ISO": "Cl. 9.1.1"},
        "human_oversight": {"EU": "Art. 14", "NIST": "Gov-4.2", "ISO": "Cl. 9.3"},
        "audit_trails": {"EU": "Art. 11", "NIST": "Gov-2", "ISO": "Cl. 7.5"},
        "leadership": {"ISO": "Cl. 5.1"},
        "gov_policies": {"ISO": "Cl. 5.2"},
    },
}

QUESTION_LABELS: Dict[str, str] = {
    "risk_classification": "Has the AI use-case been classified by risk level according to the EU AI Act and mapped for potential harms (legal, ethical, safety, privacy, security)?",
    "docs_traceability": "What documentation exists: versioning, training data provenance, model governance, decision logs, incident records, and conformity assessments?",
    "independent_validation": "Have conformity assessments or external/third-party audits been conducted to validate controls and compliance?",
    "monitoring_metrics": "What metrics and benchmarks are used to monitor accuracy, fairness, robustness, security, and ethical compliance?",
    "human_oversight": "How is human oversight and intervention designed into the AI system, particularly for high-risk applications?",
    "audit_trails": "Are processes in place for audit trails and record keeping to support regulatory reviews and internal accountability?",
    "leadership": "How is top management involved in supporting, directing, and overseeing AI policies and risk controls?",
    "gov_policies": "Is there a written AI governance policy and an AIMS aligned to ISO/IEC 42001?",
}

CONTROL_LABELS: Dict[str, str] = {
    "human_oversight_design": "HITL/HOTL design with documented override/escalation",
    "incident_response": "AI incident management (detection, triage, comms, postmortems)",
    "monitoring_bias_drift": "Monitoring for bias/drift/robustness with thresholds & alerts",
    "third_party_validation": "External audit or conformity assessment completed",
    "policy_aimgov": "Written AI policy + AIMS aligned to ISO 42001 (approved, reviewed annually)",
    "risk_register": "Central AI risk register with owners, mitigations, review cadence",
    "dpia_pia": "DPIA/PIA conducted and updated for AI data processing",
    "model_docs": "Model cards/data sheets, versioning, lineage, decision logs",
    "security_mlsdlc": "Secure MLOps/ML-SDLC incl. adversarial testing & supply-chain checks",
    "monitoring_metrics": "Monitoring metrics and dashboards for AI control performance",
}


def _row(item_type: str, item_id: str, framework: str, reference: str, label_map: Dict[str, str]) -> Dict[str, str]:
    return {
        "item_type": item_type,
        "item_id": item_id,
        "label": label_map.get(item_id, item_id),
        "framework": framework,
        "reference": reference,
    }


def iter_crosswalk_rows() -> Iterable[Dict[str, str]]:
    for item_type, items in REGULATION_MAPPING.items():
        label_map = QUESTION_LABELS if item_type == "questions" else CONTROL_LABELS
        for item_id, refs in items.items():
            for fw in FRAMEWORKS:
                reference = refs.get(fw)
                if reference:
                    yield _row(item_type, item_id, fw, reference, label_map)


def build_crosswalk_matrix() -> List[Dict[str, str]]:
    matrix: List[Dict[str, str]] = []
    for item_type, items in REGULATION_MAPPING.items():
        label_map = QUESTION_LABELS if item_type == "questions" else CONTROL_LABELS
        for item_id, refs in items.items():
            matrix.append(
                {
                    "item_type": item_type,
                    "item_id": item_id,
                    "label": label_map.get(item_id, item_id),
                    "EU": refs.get("EU", ""),
                    "NIST": refs.get("NIST", ""),
                    "ISO": refs.get("ISO", ""),
                }
            )
    return matrix


def _get_item_refs(item_type: str, item_id: str) -> Dict[str, str]:
    return dict(REGULATION_MAPPING.get(item_type, {}).get(item_id, {}))


def get_question_refs(question_id: str, framework: str | None = None) -> Dict[str, str] | str:
    """
    Return the canonical framework references for a governance question.

    If framework is provided, return the reference string for that single
    framework or an empty string when no mapping exists.
    """
    refs = _get_item_refs("questions", question_id)
    if framework is not None:
        return refs.get(framework, "")
    return refs


def get_control_refs(control_id: str, framework: str | None = None) -> Dict[str, str] | str:
    """
    Return the canonical framework references for an operational control.

    If framework is provided, return the reference string for that single
    framework or an empty string when no mapping exists.
    """
    refs = _get_item_refs("controls", control_id)
    if framework is not None:
        return refs.get(framework, "")
    return refs


def build_crosswalk_markdown_table() -> str:
    """Build a paper-ready markdown table from the canonical crosswalk."""
    rows = build_crosswalk_matrix()
    headers = ["Item Type", "Item ID", "Label", *FRAMEWORKS]
    lines = [
        "| " + " | ".join(headers) + " |",
        "| " + " | ".join(["---"] * len(headers)) + " |",
    ]
    for row in rows:
        lines.append(
            "| "
            + " | ".join(
                [
                    row["item_type"],
                    row["item_id"],
                    row["label"],
                    row.get("EU", ""),
                    row.get("NIST", ""),
                    row.get("ISO", ""),
                ]
            )
            + " |"
        )
    return "\n".join(lines) + "\n"


def export_crosswalk_csv(path: str | Path) -> Path:
    destination = Path(path)
    destination.parent.mkdir(parents=True, exist_ok=True)
    rows = list(iter_crosswalk_rows())
    with destination.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["item_type", "item_id", "label", "framework", "reference"])
        writer.writeheader()
        writer.writerows(rows)
    return destination


def export_crosswalk_json(path: str | Path) -> Path:
    destination = Path(path)
    destination.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "frameworks": list(FRAMEWORKS),
        "matrix": build_crosswalk_matrix(),
        "rows": list(iter_crosswalk_rows()),
    }
    destination.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")
    return destination


def export_crosswalk_markdown(path: str | Path) -> Path:
    destination = Path(path)
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(build_crosswalk_markdown_table(), encoding="utf-8")
    return destination


def _read_excel_codes(path: str | Path, code_columns: List[str]) -> List[str]:
    df = pd.read_excel(path).fillna("")
    df.columns = [str(c).strip().lower() for c in df.columns]
    for column in code_columns:
        if column in df.columns:
            return [str(v).strip() for v in df[column].tolist() if str(v).strip()]
    raise ValueError(f"None of the expected code columns were found in {path}: {code_columns}")


def canonical_risk_ids(path: str | Path) -> List[str]:
    return _read_excel_codes(path, ["risk id", "risk_id"])


def canonical_control_codes(path: str | Path) -> List[str]:
    return _read_excel_codes(path, ["code", "control id", "control_id"])


def canonical_library_root() -> Path:
    return Path(__file__).resolve().parent


def main() -> int:
    import argparse

    parser = argparse.ArgumentParser(description="Export the governance crosswalk as CSV and JSON.")
    parser.add_argument("--out-dir", type=Path, default=Path(__file__).resolve().parent / "artifacts")
    args = parser.parse_args()

    out_dir = args.out_dir
    out_dir.mkdir(parents=True, exist_ok=True)
    csv_path = export_crosswalk_csv(out_dir / "regulation_crosswalk.csv")
    json_path = export_crosswalk_json(out_dir / "regulation_crosswalk.json")
    md_path = export_crosswalk_markdown(out_dir / "crosswalk_paper_table.md")
    print(csv_path)
    print(json_path)
    print(md_path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
