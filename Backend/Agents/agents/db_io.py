# agents/db_io.py
# ─────────────────────────────────────────────────────────────
# This is the DROP-IN REPLACEMENT for excel_io.py
# It exposes the exact same 4 functions:
#   - read_ai_risks()
#   - read_ai_controls()
#   - read_cyber_risks()
#   - read_nist_controls()
#
# But instead of reading Excel files, it queries PostgreSQL.
# The rest of the codebase doesn't need to know the difference.
# ─────────────────────────────────────────────────────────────

import pandas as pd
import sys
from pathlib import Path

# Add parent directory to path so we can import db/connection.py
sys.path.append(str(Path(__file__).resolve().parent.parent))
from db.connection import get_connection


def _query_to_dataframe(sql: str) -> pd.DataFrame:
    """
    Runs a SQL query and returns the result as a pandas DataFrame.
    This is the core helper used by all 4 read functions below.
    
    We return a DataFrame (not raw rows) because the rest of
    the codebase already expects DataFrames from excel_io.py.
    This way nothing else needs to change.
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(sql)
            rows = cur.fetchall()
            if not rows:
                return pd.DataFrame()
            # RealDictCursor returns list of dicts → perfect for DataFrame
            return pd.DataFrame(rows)


def read_ai_risks() -> pd.DataFrame:
    """
    Replaces: excel_io.read_ai_risks()
    Returns all AI risks from PostgreSQL as a DataFrame.
    
    Columns returned:
        risk_id, risk_name, base_severity, base_likelihood,
        mitigation, target_date
    """
    return _query_to_dataframe("""
        SELECT 
            risk_id,
            risk_name,
            base_severity,
            base_likelihood,
            mitigation,
            target_date
        FROM ai_risks
        ORDER BY base_severity DESC, risk_id ASC;
    """)


def read_ai_controls() -> pd.DataFrame:
    """
    Replaces: excel_io.read_ai_controls()
    Returns all AI controls from PostgreSQL as a DataFrame.
    
    Columns returned:
        code, section, control, requirements
    """
    return _query_to_dataframe("""
        SELECT 
            code,
            section,
            control,
            requirements
        FROM ai_controls
        ORDER BY code ASC;
    """)


def read_cyber_risks() -> pd.DataFrame:
    """
    Replaces: excel_io.read_cyber_risks()
    Returns all STRIDE cyber risks from PostgreSQL as a DataFrame.
    
    Columns returned:
        risk_id, category, description (as 'risk description'),
        likelihood, impact, severity, mitigation
    """
    return _query_to_dataframe("""
        SELECT 
            risk_id,
            category,
            description  AS "risk description",
            likelihood,
            impact,
            severity,
            mitigation
        FROM cyber_risks
        ORDER BY severity DESC, risk_id ASC;
    """)


def read_nist_controls() -> pd.DataFrame:
    """
    Replaces: excel_io.read_nist_controls()
    Returns all NIST controls from PostgreSQL as a DataFrame.
    
    Columns returned:
        control_id (as 'control id'), family,
        control_name (as 'control name'),
        control_description (as 'control description')
    """
    return _query_to_dataframe("""
        SELECT 
            control_id          AS "control id",
            family,
            control_name        AS "control name",
            control_description AS "control description"
        FROM nist_controls
        ORDER BY family ASC, control_id ASC;
    """)


# ── Test this file directly ───────────────────────────────────
if __name__ == "__main__":
    print("Testing db_io.py...\n")

    print("AI Risks:")
    df = read_ai_risks()
    print(f"  {len(df)} rows, columns: {list(df.columns)}")
    if len(df) > 0:
        print(f"  First row: {dict(df.iloc[0])}\n")

    print("AI Controls:")
    df = read_ai_controls()
    print(f"  {len(df)} rows, columns: {list(df.columns)}")
    if len(df) > 0:
        print(f"  First row: {dict(df.iloc[0])}\n")

    print("Cyber Risks:")
    df = read_cyber_risks()
    print(f"  {len(df)} rows, columns: {list(df.columns)}")
    if len(df) > 0:
        print(f"  First row: {dict(df.iloc[0])}\n")

    print("NIST Controls:")
    df = read_nist_controls()
    print(f"  {len(df)} rows, columns: {list(df.columns)}")
    if len(df) > 0:
        print(f"  First row: {dict(df.iloc[0])}\n")

    print("All tests passed!")