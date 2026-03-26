# agents/shared/excel_io.py
from __future__ import annotations
from pathlib import Path
from typing import Dict, List
import pandas as pd

# Excel files live at the repository root (same as before)
ROOT = Path(__file__).resolve().parents[1]

PREDEFINED_RISKS_XLSX    = ROOT / "predefined_risks.xlsx"
PREDEFINED_CONTROLS_XLSX = ROOT / "predefined_controls.xlsx"
STRIDE_RISKS_XLSX        = ROOT / "stride_risks.xlsx"
NIST_CONTROLS_XLSX       = ROOT / "nist_controls.xlsx"

SHEET_PREDEFINED_RISKS    = "Sheet"
SHEET_PREDEFINED_CONTROLS = "Sheet1"
SHEET_STRIDE_RISKS        = "Sheet"
SHEET_NIST_CONTROLS       = "Sheet"

def _read_xlsx(path: Path, sheet: str) -> pd.DataFrame:
    if not path.exists():
        raise FileNotFoundError(f"Excel not found: {path}")
    df = pd.read_excel(path, sheet_name=sheet, dtype=str).fillna("")
    df.columns = [c.strip().lower() for c in df.columns]
    return df

def read_ai_risks() -> pd.DataFrame:
    return _read_xlsx(PREDEFINED_RISKS_XLSX, SHEET_PREDEFINED_RISKS)

def read_ai_controls() -> pd.DataFrame:
    return _read_xlsx(PREDEFINED_CONTROLS_XLSX, SHEET_PREDEFINED_CONTROLS)

def read_cyber_risks() -> pd.DataFrame:
    return _read_xlsx(STRIDE_RISKS_XLSX, SHEET_STRIDE_RISKS)

def read_nist_controls() -> pd.DataFrame:
    return _read_xlsx(NIST_CONTROLS_XLSX, SHEET_NIST_CONTROLS)
