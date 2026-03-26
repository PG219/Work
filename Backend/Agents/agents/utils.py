# agents/utils.py
import pandas as pd
from pathlib import Path

# Load the Excel once
RISK_FILE = Path(__file__).parent.parent / "predefined_risks.xlsx"
df = pd.read_excel(RISK_FILE)

# Create a clean DataFrame with only the necessary columns for the prompt
prompt_df = df[['RISK ID', 'RISK NAME', 'MITIGATION', 'TARGET_DATE']].copy()

# Convert to a markdown string that the LLM can easily understand
PREDEFINED_RISKS_MARKDOWN = prompt_df.to_markdown(index=False)

# Keep these for other potential uses if needed
RISK_LIST = df["RISK NAME"].tolist()
BASE_SEVERITY = dict(zip(df["RISK NAME"], df["BASE_SEVERITY"]))
MITIGATION = dict(zip(df["RISK NAME"], df["MITIGATION"]))
TARGET_DATE = dict(zip(df["RISK NAME"], df["TARGET_DATE"]))
RISK_ID = df["RISK ID"].tolist()