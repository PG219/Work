# migrate_excel_to_db.py
# ─────────────────────────────────────────────────────────────
# ONE-TIME SCRIPT: Reads all 4 Excel files and inserts their
# data into PostgreSQL tables.
#
# Run this ONCE after Docker is up:
#   cd Backend/Agents
#   python migrate_excel_to_db.py
# ─────────────────────────────────────────────────────────────

import pandas as pd
from pathlib import Path
from db.connection import get_connection

# ── Paths to your Excel files ────────────────────────────────
BASE = Path(__file__).resolve().parent

PREDEFINED_RISKS_XLSX    = BASE / "predefined_risks.xlsx"
PREDEFINED_CONTROLS_XLSX = BASE / "predefined_controls.xlsx"
STRIDE_RISKS_XLSX        = BASE / "stride_risks.xlsx"
NIST_CONTROLS_XLSX       = BASE / "nist_controls.xlsx"


def read_excel(path: Path, sheet: str) -> pd.DataFrame:
    """Read an Excel file and normalize column names to lowercase."""
    print(f"  Reading {path.name} (sheet: {sheet})...")
    df = pd.read_excel(path, sheet_name=sheet, dtype=str).fillna("")
    df.columns = [c.strip().lower() for c in df.columns]
    print(f"  Found {len(df)} rows, columns: {list(df.columns)}")
    return df


def safe_int(value: str, default: int = 3) -> int:
    """Convert a string to int safely, returning default if it fails."""
    try:
        return int(float(str(value).strip()))
    except (ValueError, TypeError):
        return default


# ── Migration functions ───────────────────────────────────────

def migrate_ai_risks(conn):
    """Migrate predefined_risks.xlsx → ai_risks table."""
    print("\n[1/4] Migrating AI Risks...")
    df = read_excel(PREDEFINED_RISKS_XLSX, "Sheet")

    # Show what columns we found — helpful for debugging
    print(f"  Columns detected: {list(df.columns)}")

    inserted = 0
    skipped = 0

    with conn.cursor() as cur:
        for _, row in df.iterrows():
            risk_id = str(row.get("risk id", "")).strip()
            if not risk_id:
                skipped += 1
                continue

            # Get risk name — your Excel might use "risk name" or "risk"
            risk_name = str(
                row.get("risk name") or row.get("risk") or ""
            ).strip()

            try:
                cur.execute("""
                    INSERT INTO ai_risks 
                        (risk_id, risk_name, base_severity, base_likelihood, 
                         mitigation, target_date)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    ON CONFLICT (risk_id) DO UPDATE SET
                        risk_name       = EXCLUDED.risk_name,
                        base_severity   = EXCLUDED.base_severity,
                        base_likelihood = EXCLUDED.base_likelihood,
                        mitigation      = EXCLUDED.mitigation,
                        target_date     = EXCLUDED.target_date;
                """, (
                    risk_id,
                    risk_name,
                    safe_int(row.get("base_severity", "3")),
                    safe_int(row.get("base_likelihood", "3")),
                    str(row.get("mitigation", "")).strip(),
                    str(row.get("target_date", "")).strip(),
                ))
                inserted += 1
            except Exception as e:
                print(f"  WARNING: Could not insert risk_id={risk_id}: {e}")
                skipped += 1

    conn.commit()
    print(f"  Done. Inserted/updated: {inserted}, Skipped: {skipped}")


def migrate_ai_controls(conn):
    """Migrate predefined_controls.xlsx → ai_controls table."""
    print("\n[2/4] Migrating AI Controls...")
    df = read_excel(PREDEFINED_CONTROLS_XLSX, "Sheet1")

    print(f"  Columns detected: {list(df.columns)}")

    inserted = 0
    skipped = 0

    with conn.cursor() as cur:
        for _, row in df.iterrows():
            code = str(row.get("code", "")).strip()
            if not code:
                skipped += 1
                continue

            try:
                cur.execute("""
                    INSERT INTO ai_controls 
                        (code, section, control, requirements)
                    VALUES (%s, %s, %s, %s)
                    ON CONFLICT (code) DO UPDATE SET
                        section      = EXCLUDED.section,
                        control      = EXCLUDED.control,
                        requirements = EXCLUDED.requirements;
                """, (
                    code,
                    str(row.get("section", "")).strip(),
                    str(row.get("control", "")).strip(),
                    str(row.get("requirements", "")).strip(),
                ))
                inserted += 1
            except Exception as e:
                print(f"  WARNING: Could not insert code={code}: {e}")
                skipped += 1

    conn.commit()
    print(f"  Done. Inserted/updated: {inserted}, Skipped: {skipped}")


def migrate_cyber_risks(conn):
    """Migrate stride_risks.xlsx → cyber_risks table."""
    print("\n[3/4] Migrating Cyber Risks (STRIDE)...")
    df = read_excel(STRIDE_RISKS_XLSX, "Sheet")

    print(f"  Columns detected: {list(df.columns)}")

    inserted = 0
    skipped = 0

    with conn.cursor() as cur:
        for _, row in df.iterrows():
            risk_id = str(row.get("risk id", "")).strip()
            if not risk_id:
                skipped += 1
                continue

            try:
                cur.execute("""
                    INSERT INTO cyber_risks 
                        (risk_id, category, description, likelihood, 
                         impact, severity, mitigation)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (risk_id) DO UPDATE SET
                        category    = EXCLUDED.category,
                        description = EXCLUDED.description,
                        likelihood  = EXCLUDED.likelihood,
                        impact      = EXCLUDED.impact,
                        severity    = EXCLUDED.severity,
                        mitigation  = EXCLUDED.mitigation;
                """, (
                    risk_id,
                    str(row.get("category", "")).strip(),
                    str(row.get("risk description", "")).strip(),
                    str(row.get("likelihood", "")).strip(),
                    str(row.get("impact", "")).strip(),
                    safe_int(row.get("severity", "3")),
                    str(row.get("mitigation", "")).strip(),
                ))
                inserted += 1
            except Exception as e:
                print(f"  WARNING: Could not insert risk_id={risk_id}: {e}")
                skipped += 1

    conn.commit()
    print(f"  Done. Inserted/updated: {inserted}, Skipped: {skipped}")


def migrate_nist_controls(conn):
    """Migrate nist_controls.xlsx → nist_controls table."""
    print("\n[4/4] Migrating NIST Controls...")
    df = read_excel(NIST_CONTROLS_XLSX, "Sheet")

    print(f"  Columns detected: {list(df.columns)}")

    inserted = 0
    skipped = 0

    with conn.cursor() as cur:
        for _, row in df.iterrows():
            control_id = str(row.get("control id", "")).strip()
            if not control_id:
                skipped += 1
                continue

            try:
                cur.execute("""
                    INSERT INTO nist_controls 
                        (control_id, family, control_name, control_description)
                    VALUES (%s, %s, %s, %s)
                    ON CONFLICT (control_id) DO UPDATE SET
                        family              = EXCLUDED.family,
                        control_name        = EXCLUDED.control_name,
                        control_description = EXCLUDED.control_description;
                """, (
                    control_id,
                    str(row.get("family", "")).strip(),
                    str(row.get("control name", "")).strip(),
                    str(row.get("control description", "")).strip(),
                ))
                inserted += 1
            except Exception as e:
                print(f"  WARNING: Could not insert control_id={control_id}: {e}")
                skipped += 1

    conn.commit()
    print(f"  Done. Inserted/updated: {inserted}, Skipped: {skipped}")


# ── Main ──────────────────────────────────────────────────────

def run_migration():
    print("=" * 55)
    print("  Excel → PostgreSQL Migration")
    print("=" * 55)

    # Verify all Excel files exist before starting
    files = [
        PREDEFINED_RISKS_XLSX,
        PREDEFINED_CONTROLS_XLSX,
        STRIDE_RISKS_XLSX,
        NIST_CONTROLS_XLSX,
    ]
    for f in files:
        if not f.exists():
            print(f"ERROR: File not found: {f}")
            print("Make sure all Excel files are in Backend/Agents/")
            return

    print("All Excel files found. Connecting to PostgreSQL...")

    try:
        conn = get_connection()
        print("Connected to PostgreSQL successfully!\n")
    except RuntimeError as e:
        print(f"ERROR: {e}")
        return

    try:
        migrate_ai_risks(conn)
        migrate_ai_controls(conn)
        migrate_cyber_risks(conn)
        migrate_nist_controls(conn)

        print("\n" + "=" * 55)
        print("  Migration Complete!")
        print("=" * 55)

        # Verify row counts
        print("\nVerifying row counts:")
        with conn.cursor() as cur:
            for table in ["ai_risks", "ai_controls", 
                          "cyber_risks", "nist_controls"]:
                cur.execute(f"SELECT COUNT(*) as count FROM {table};")
                result = cur.fetchone()
                print(f"  {table}: {result['count']} rows")

    finally:
        conn.close()
        print("\nDatabase connection closed.")


if __name__ == "__main__":
    run_migration()