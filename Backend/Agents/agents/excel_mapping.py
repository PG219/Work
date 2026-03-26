# agents/excel_mapping.py
from __future__ import annotations

import os
from pathlib import Path
from typing import Any, Dict, Optional, Tuple, Union

import pandas as pd

# ---------- Exceptions ----------
class BadMapping(Exception):
    pass

class DataValidationError(Exception):
    pass


# ---------- Utilities ----------
def _project_root() -> Path:
    # repo root = parent of 'agents' folder
    return Path(__file__).resolve().parent.parent

def _as_path_or_buffer(src: Union[str, os.PathLike, Any]) -> Tuple[Any, str]:
    """
    Accept a path or a file-like object and return:
      - the object to pass to pandas (path str or file-like)
      - a human-friendly display name (for logs)
    """
    if isinstance(src, (str, os.PathLike)):
        p = Path(src)
        return str(p), p.name
    # file-like (e.g., open(..., "rb"))
    display = getattr(src, "name", None)
    if isinstance(display, (str, os.PathLike)):
        display = Path(display).name
    else:
        display = "<in-memory>"
    return src, display

def _read_excel_any(
    src: Union[str, os.PathLike, Any], sheet: Optional[Union[str, int]] = None
) -> pd.DataFrame:
    path_or_buf, display = _as_path_or_buffer(src)
    sheet_name = 0 if sheet in (None, "first", "0") else sheet
    df = pd.read_excel(path_or_buf, sheet_name=sheet_name)
    # Normalize duplicate-friendly aliases WITHOUT destroying the original headers:
    # We keep original columns, but add lowercase / spaced / underscored aliases
    # so downstream code can access with r["risk id"] OR r["risk_id"] OR r["Risk ID"].
    original_cols = list(df.columns)
    for col in original_cols:
        base = str(col).strip()
        low = base.lower()
        spaced = low.replace("_", " ").replace("-", " ")
        underscored = low.replace(" ", "_").replace("-", "_")

        # Add aliases if missing
        if low not in df.columns:
            df[low] = df[col]
        if spaced not in df.columns:
            df[spaced] = df[col]
        if underscored not in df.columns:
            df[underscored] = df[col]

    # Drop completely empty rows
    df = df.dropna(how="all")

    print(f"[excel] loaded '{display}' sheet={sheet_name} rows={len(df)} "
          f"cols_sample={list(df.columns)[:10]}")
    return df

def _require_columns(df: pd.DataFrame, needed: list[str], kind: str):
    missing = [c for c in needed if c not in df.columns]
    if missing:
        raise DataValidationError(
            f"{kind}: required columns missing: {missing}. "
            f"Available columns (sample): {list(df.columns)[:15]}"
        )


# ---------- Mapping from questionnaire answers to files ----------
def map_answers_to_sources(answers: Dict[str, Any]):
    """
    Decide scope/system/mapped_type and pick the excel files + sheet names.
    Returns: (scope, system_type_out, mapped_type, risks_file, controls_file, risks_sheet, controls_sheet)
    """
    # Inputs can be in different shapes; normalize
    q2 = (answers.get("Q2") or answers.get("q2") or "").strip().lower()
    sys_in = (answers.get("system_type") or answers.get("systemType") or "").strip()

    # Scope
    is_third = "third" in q2
    scope = "third_party" if is_third else "in_house"

    # Mapped type
    mapped_type = "Cyber" if "cyber" in sys_in.lower() else "AI"

    # System type out (exact labels used elsewhere)
    if mapped_type == "Cyber":
        system_type_out = "Third-party Cybersecurity" if is_third else "Cybersecurity Management system"
    else:
        system_type_out = "Third-party AI-System" if is_third else "AI-System"

    # Default files live at repo root
    root = _project_root()
    risks_file = root / "predefined_risks.xlsx"
    controls_file = root / "predefined_controls.xlsx"
    risks_sheet = None
    controls_sheet = None

    print(f"[map] scope={scope} system_type_out={system_type_out} mapped_type={mapped_type}")
    print(f"[map] risks={risks_file.name} sheet={'first'}  | controls={controls_file.name} sheet={'first'}")

    # Check existence if paths were used
    if not risks_file.exists():
        raise DataValidationError(f"Risks file not found at {risks_file}")
    if not controls_file.exists():
        raise DataValidationError(f"Controls file not found at {controls_file}")

    return scope, system_type_out, mapped_type, str(risks_file), str(controls_file), risks_sheet, controls_sheet


# ---------- Load and validate risks / controls ----------
def load_risks_controls(
    mapped_type: str,
    risks_file: Union[str, os.PathLike, Any],
    controls_file: Union[str, os.PathLike, Any],
    risks_sheet: Optional[Union[str, int]] = None,
    controls_sheet: Optional[Union[str, int]] = None,
) -> Dict[str, pd.DataFrame]:
    """
    Read the two Excel sources and return dataframes with friendly aliases.
    mapped_type: "AI" or "Cyber"
    """
    # Read
    risks_df = _read_excel_any(risks_file, risks_sheet)
    ctrls_df = _read_excel_any(controls_file, controls_sheet)

    # Validate expected columns (we validate against multiple aliases)
    if mapped_type == "AI":
        # Accept any of the alias forms added in _read_excel_any
        risk_needed = ["risk id", "risk_id", "risk name", "risk_name",
                       "base_likelihood", "base likelihood",
                       "base_severity", "base severity", "mitigation"]
        ctrl_needed = ["code", "control", "section", "requirements"]
        _require_columns(risks_df, risk_needed, "AI risks")
        _require_columns(ctrls_df, ctrl_needed, "AI controls")
    else:
        risk_needed = ["risk id", "risk_id", "risk description", "risk_description",
                       "likelihood", "impact", "severity", "mitigation", "category"]
        ctrl_needed = ["control id", "control_id", "family",
                       "control name", "control_name",
                       "control description", "control_description"]
        _require_columns(risks_df, risk_needed, "Cyber risks")
        _require_columns(ctrls_df, ctrl_needed, "Cyber controls")

    return {"risks": risks_df, "controls": ctrls_df}
