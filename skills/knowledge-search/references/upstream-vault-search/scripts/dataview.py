#!/usr/bin/env python3
"""
Vault Dataview Queries

Execute SQL queries against vault frontmatter metadata.
Replacement for Obsidian Dataview plugin queries.

Usage:
    python dataview.py --sql "SELECT path, due FROM notes WHERE status='open'"
    python dataview.py --sql "SELECT * FROM notes WHERE folder LIKE 'TaskNotes%'"
"""

import argparse
import json
import sqlite3
import sys
from pathlib import Path

DEFAULT_DB_PATH = "/Users/roasbeef/vault/.claude/vault_search/vault.db"


def execute_query(sql: str, db_path: str) -> tuple[list[str], list[tuple]]:
    """
    Execute a SQL query and return column names and rows.

    Args:
        sql: SQL query to execute
        db_path: Path to sqlite database

    Returns:
        Tuple of (column_names, rows)
    """
    if not Path(db_path).exists():
        print(f"Error: Database not found: {db_path}")
        print("Run: python index.py --rebuild")
        sys.exit(1)

    conn = sqlite3.connect(db_path)

    try:
        cursor = conn.execute(sql)
        columns = [description[0] for description in cursor.description]
        rows = cursor.fetchall()
    except sqlite3.Error as e:
        print(f"SQL Error: {e}")
        conn.close()
        sys.exit(1)

    conn.close()
    return columns, rows


def format_table(columns: list[str], rows: list[tuple], max_width: int = 50) -> str:
    """Format results as a text table."""
    if not rows:
        return "No results found."

    # Calculate column widths
    widths = []
    for i, col in enumerate(columns):
        col_values = [str(row[i]) if row[i] is not None else "" for row in rows]
        max_val_width = max(len(v) for v in col_values) if col_values else 0
        widths.append(min(max(len(col), max_val_width), max_width))

    # Build header
    header = " | ".join(col.ljust(widths[i])[:widths[i]] for i, col in enumerate(columns))
    separator = "-+-".join("-" * w for w in widths)

    # Build rows
    formatted_rows = []
    for row in rows:
        formatted_row = " | ".join(
            str(val if val is not None else "").ljust(widths[i])[:widths[i]]
            for i, val in enumerate(row)
        )
        formatted_rows.append(formatted_row)

    return "\n".join([header, separator] + formatted_rows)


def rows_to_dicts(columns: list[str], rows: list[tuple]) -> list[dict]:
    """Convert rows to list of dictionaries."""
    return [dict(zip(columns, row)) for row in rows]


def show_schema(db_path: str):
    """Show the database schema."""
    if not Path(db_path).exists():
        print(f"Error: Database not found: {db_path}")
        return

    conn = sqlite3.connect(db_path)

    print("=== Notes Table Schema ===\n")

    # Get column info
    cursor = conn.execute("PRAGMA table_info(notes)")
    columns = cursor.fetchall()

    print("Column".ljust(20) + "Type".ljust(15) + "Nullable")
    print("-" * 45)
    for col in columns:
        name = col[1]
        col_type = col[2]
        nullable = "Yes" if col[4] == 0 else "No"
        print(f"{name.ljust(20)}{col_type.ljust(15)}{nullable}")

    # Show sample values for key columns
    print("\n=== Sample Values ===\n")

    sample_sql = """
        SELECT DISTINCT status FROM notes WHERE status IS NOT NULL LIMIT 5
    """
    cursor = conn.execute(sample_sql)
    statuses = [row[0] for row in cursor.fetchall()]
    print(f"status values: {statuses}")

    sample_sql = """
        SELECT DISTINCT priority FROM notes WHERE priority IS NOT NULL LIMIT 5
    """
    cursor = conn.execute(sample_sql)
    priorities = [row[0] for row in cursor.fetchall()]
    print(f"priority values: {priorities}")

    sample_sql = """
        SELECT DISTINCT folder FROM notes ORDER BY folder LIMIT 10
    """
    cursor = conn.execute(sample_sql)
    folders = [row[0] for row in cursor.fetchall()]
    print(f"folder values: {folders}")

    conn.close()


def main():
    parser = argparse.ArgumentParser(
        description="Execute SQL queries on vault metadata"
    )
    parser.add_argument(
        "--sql", "-s",
        help="SQL query to execute"
    )
    parser.add_argument(
        "--db-path",
        default=DEFAULT_DB_PATH,
        help=f"Database path (default: {DEFAULT_DB_PATH})"
    )
    parser.add_argument(
        "--format", "-f",
        choices=["table", "json"],
        default="table",
        help="Output format (default: table)"
    )
    parser.add_argument(
        "--schema",
        action="store_true",
        help="Show database schema"
    )

    args = parser.parse_args()

    if args.schema:
        show_schema(args.db_path)
        return

    if not args.sql:
        print("Error: --sql is required (or use --schema to see available columns)")
        sys.exit(1)

    columns, rows = execute_query(args.sql, args.db_path)

    if args.format == "json":
        results = rows_to_dicts(columns, rows)
        print(json.dumps(results, indent=2, default=str))
    else:
        print(format_table(columns, rows))
        print(f"\n({len(rows)} rows)")

        # Also output JSON for programmatic use
        print("\n--- JSON OUTPUT ---")
        results = rows_to_dicts(columns, rows)
        print(json.dumps(results, indent=2, default=str))


if __name__ == "__main__":
    main()
