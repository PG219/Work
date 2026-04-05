# db/connection.py
# ─────────────────────────────────────────────────────────────
# This file handles ONE thing: connecting to PostgreSQL.
# Every other file imports get_connection() from here.
# ─────────────────────────────────────────────────────────────

import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

load_dotenv()

# Read connection details from environment variables
# These match what we defined in docker-compose.yml
DB_CONFIG = {
    "host":     os.getenv("POSTGRES_HOST",     "localhost"),
    "port":     int(os.getenv("POSTGRES_PORT", "5432")),
    "database": os.getenv("POSTGRES_DB",       "governance_risks"),
    "user":     os.getenv("POSTGRES_USER",     "governance_user"),
    "password": os.getenv("POSTGRES_PASSWORD", "governance_pass"),
}

def get_connection():
    """
    Opens and returns a connection to PostgreSQL.
    
    Usage in other files:
        from db.connection import get_connection
        
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM ai_risks")
                rows = cur.fetchall()
    
    The 'with' statement automatically closes the connection
    when the block finishes — no memory leaks.
    """
    try:
        conn = psycopg2.connect(
            **DB_CONFIG,
            cursor_factory=RealDictCursor  # returns rows as dicts, not tuples
        )
        return conn
    except psycopg2.OperationalError as e:
        raise RuntimeError(
            f"Could not connect to PostgreSQL.\n"
            f"Make sure Docker is running and PostgreSQL container is up.\n"
            f"Original error: {e}"
        )


def test_connection():
    """
    Quick helper to verify the database is reachable.
    Run this file directly to test: python db/connection.py
    """
    print("Testing PostgreSQL connection...")
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT version();")
                version = cur.fetchone()
                print(f"Connected! PostgreSQL version: {version['version']}")
                
                # Check our tables exist
                cur.execute("""
                    SELECT table_name 
                    FROM information_schema.tables 
                    WHERE table_schema = 'public'
                    ORDER BY table_name;
                """)
                tables = cur.fetchall()
                print(f"Tables found: {[t['table_name'] for t in tables]}")
    except RuntimeError as e:
        print(f"Connection failed: {e}")


# Allows running: python db/connection.py
if __name__ == "__main__":
    test_connection()