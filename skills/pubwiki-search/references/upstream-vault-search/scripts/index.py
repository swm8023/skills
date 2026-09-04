#!/usr/bin/env python3
"""
Vault Search Indexer

Builds a sqlite-vec database with:
- notes table: frontmatter metadata from all markdown files
- vec_chunks table: vector embeddings for semantic search

Uses ChromaDB's DefaultEmbeddingFunction (ONNX MiniLM) for embeddings.

Usage:
    python index.py --vault-path /path/to/vault
    python index.py --rebuild  # Force full rebuild
    python index.py --stats    # Show index statistics
"""

import argparse
import json
import os
import re
import sqlite3
import sys
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Optional

# Check dependencies
try:
    import sqlite_vec
except ImportError:
    print("Error: sqlite-vec not installed. Run: pip install sqlite-vec")
    sys.exit(1)

try:
    from chromadb.utils import embedding_functions
except ImportError:
    print("Error: chromadb not installed. Run: pip install chromadb")
    sys.exit(1)

try:
    import yaml
except ImportError:
    print("Error: PyYAML not installed. Run: pip install pyyaml")
    sys.exit(1)


def json_serializer(obj):
    """JSON serializer for objects not serializable by default."""
    if hasattr(obj, 'isoformat'):
        return obj.isoformat()
    raise TypeError(f"Object of type {type(obj)} is not JSON serializable")


# Default configuration
DEFAULT_VAULT_PATH = "/Users/roasbeef/vault"
DEFAULT_DB_PATH = "/Users/roasbeef/vault/.claude/vault_search/vault.db"
EXCLUDED_FOLDERS = {".obsidian", ".smart-env", ".claude", "assets", "Templates"}
EMBEDDING_DIM = 384  # MiniLM dimension


@dataclass
class Note:
    """Represents a parsed markdown note."""
    path: str
    folder: str
    filename: str
    title: str
    modified: float
    content: str
    frontmatter: dict = field(default_factory=dict)


@dataclass
class Chunk:
    """Represents a text chunk for embedding."""
    chunk_id: str
    path: str
    heading: str
    text: str
    embedding: Optional[list] = None


def parse_frontmatter(content: str) -> tuple[dict, str]:
    """Parse YAML frontmatter from markdown content."""
    if not content.startswith("---"):
        return {}, content

    # Find the closing ---
    end_match = re.search(r"\n---\s*\n", content[3:])
    if not end_match:
        return {}, content

    yaml_content = content[3:end_match.start() + 3]
    body = content[end_match.end() + 3:]

    try:
        frontmatter = yaml.safe_load(yaml_content) or {}
    except yaml.YAMLError:
        frontmatter = {}

    return frontmatter, body


def extract_title(content: str, filename: str) -> str:
    """Extract title from first H1 heading or use filename."""
    match = re.search(r"^#\s+(.+)$", content, re.MULTILINE)
    if match:
        return match.group(1).strip()
    return filename.replace(".md", "").replace("-", " ").replace("_", " ")


def chunk_by_headings(content: str, path: str, min_chars: int = 100) -> list[Chunk]:
    """Split content into chunks by markdown headings."""
    chunks = []

    # Split by headings (## or ###)
    sections = re.split(r"^(#{1,3}\s+.+)$", content, flags=re.MULTILINE)

    current_heading = "Introduction"
    current_text = ""
    chunk_idx = 0

    for i, section in enumerate(sections):
        if re.match(r"^#{1,3}\s+", section):
            # This is a heading
            if current_text.strip() and len(current_text.strip()) >= min_chars:
                chunks.append(Chunk(
                    chunk_id=f"{path}#{chunk_idx}",
                    path=path,
                    heading=current_heading,
                    text=current_text.strip()[:2000]  # Limit chunk size
                ))
                chunk_idx += 1
            current_heading = section.strip().lstrip("#").strip()
            current_text = ""
        else:
            current_text += section

    # Don't forget the last section
    if current_text.strip() and len(current_text.strip()) >= min_chars:
        chunks.append(Chunk(
            chunk_id=f"{path}#{chunk_idx}",
            path=path,
            heading=current_heading,
            text=current_text.strip()[:2000]
        ))

    # If no chunks were created, create one from the whole content
    if not chunks and content.strip():
        chunks.append(Chunk(
            chunk_id=f"{path}#0",
            path=path,
            heading="Full Note",
            text=content.strip()[:2000]
        ))

    return chunks


def scan_vault(vault_path: str) -> list[Note]:
    """Scan vault for markdown files and parse them."""
    notes = []
    vault = Path(vault_path)

    for md_file in vault.rglob("*.md"):
        # Check if in excluded folder
        rel_path = md_file.relative_to(vault)
        parts = rel_path.parts

        if any(part in EXCLUDED_FOLDERS for part in parts):
            continue

        try:
            content = md_file.read_text(encoding="utf-8")
        except Exception as e:
            print(f"Warning: Could not read {rel_path}: {e}")
            continue

        frontmatter, body = parse_frontmatter(content)
        title = extract_title(body, md_file.name)

        # Get folder (first directory component)
        folder = str(rel_path.parent) if len(parts) > 1 else ""

        notes.append(Note(
            path=str(rel_path),
            folder=folder,
            filename=md_file.name,
            title=title,
            modified=md_file.stat().st_mtime,
            content=body,
            frontmatter=frontmatter
        ))

    return notes


def init_database(db_path: str) -> sqlite3.Connection:
    """Initialize the SQLite database with sqlite-vec."""
    # Ensure directory exists
    Path(db_path).parent.mkdir(parents=True, exist_ok=True)

    conn = sqlite3.connect(db_path)
    conn.enable_load_extension(True)
    sqlite_vec.load(conn)
    conn.enable_load_extension(False)

    # Create notes table for frontmatter
    conn.execute("""
        CREATE TABLE IF NOT EXISTS notes (
            path TEXT PRIMARY KEY,
            folder TEXT,
            filename TEXT,
            title TEXT,
            modified REAL,
            -- Common frontmatter fields
            status TEXT,
            priority TEXT,
            due TEXT,
            scheduled TEXT,
            tags TEXT,
            projects TEXT,
            contexts TEXT,
            -- Investing fields
            ticker TEXT,
            strategy TEXT,
            expiry TEXT,
            -- Generic frontmatter JSON
            frontmatter_json TEXT
        )
    """)

    # Create indexes
    conn.execute("CREATE INDEX IF NOT EXISTS idx_notes_folder ON notes(folder)")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_notes_status ON notes(status)")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_notes_due ON notes(due)")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_notes_ticker ON notes(ticker)")

    # Create vec_chunks table for embeddings
    conn.execute(f"""
        CREATE VIRTUAL TABLE IF NOT EXISTS vec_chunks USING vec0 (
            chunk_id TEXT PRIMARY KEY,
            path TEXT,
            heading TEXT,
            chunk_text TEXT,
            embedding FLOAT[{EMBEDDING_DIM}]
        )
    """)

    conn.commit()
    return conn


def insert_note(conn: sqlite3.Connection, note: Note):
    """Insert or update a note in the database."""
    fm = note.frontmatter

    # Helper to serialize values that might be dates
    def serialize(val):
        if val is None:
            return None
        if hasattr(val, 'isoformat'):
            return val.isoformat()
        return str(val) if not isinstance(val, (str, int, float, bool)) else val

    # Extract common fields
    tags = json.dumps(fm.get("tags", []), default=json_serializer) if fm.get("tags") else None
    projects = json.dumps(fm.get("projects", []), default=json_serializer) if fm.get("projects") else None
    contexts = json.dumps(fm.get("contexts", []), default=json_serializer) if fm.get("contexts") else None

    conn.execute("""
        INSERT OR REPLACE INTO notes
        (path, folder, filename, title, modified, status, priority, due, scheduled,
         tags, projects, contexts, ticker, strategy, expiry, frontmatter_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        note.path,
        note.folder,
        note.filename,
        note.title,
        note.modified,
        serialize(fm.get("status")),
        serialize(fm.get("priority")),
        serialize(fm.get("due")),
        serialize(fm.get("scheduled")),
        tags,
        projects,
        contexts,
        serialize(fm.get("ticker")),
        serialize(fm.get("strategy")),
        serialize(fm.get("expiry")),
        json.dumps(fm, default=json_serializer)
    ))


def insert_chunks(conn: sqlite3.Connection, chunks: list[Chunk]):
    """Insert chunks with embeddings into vec_chunks."""
    import struct
    for chunk in chunks:
        if chunk.embedding is None:
            continue

        # Convert embedding to bytes for sqlite-vec
        embedding_bytes = struct.pack(f"{len(chunk.embedding)}f", *chunk.embedding)

        # vec0 virtual tables don't support INSERT OR REPLACE, so delete first
        conn.execute("DELETE FROM vec_chunks WHERE chunk_id = ?", (chunk.chunk_id,))
        conn.execute("""
            INSERT INTO vec_chunks (chunk_id, path, heading, chunk_text, embedding)
            VALUES (?, ?, ?, ?, ?)
        """, (chunk.chunk_id, chunk.path, chunk.heading, chunk.text, embedding_bytes))


def build_index(vault_path: str, db_path: str, rebuild: bool = False):
    """Build or update the search index."""
    print(f"Scanning vault: {vault_path}")
    notes = scan_vault(vault_path)
    print(f"Found {len(notes)} notes")

    # Initialize database
    if rebuild and Path(db_path).exists():
        print("Removing existing database for rebuild...")
        Path(db_path).unlink()

    conn = init_database(db_path)

    # Initialize embedding function
    print("Loading embedding model (ONNX MiniLM)...")
    ef = embedding_functions.DefaultEmbeddingFunction()

    # Process notes
    all_chunks = []
    for note in notes:
        insert_note(conn, note)
        chunks = chunk_by_headings(note.content, note.path)
        all_chunks.extend(chunks)

    conn.commit()
    print(f"Indexed {len(notes)} notes in metadata table")

    # Generate embeddings in batches
    print(f"Generating embeddings for {len(all_chunks)} chunks...")
    batch_size = 100

    for i in range(0, len(all_chunks), batch_size):
        batch = all_chunks[i:i + batch_size]
        texts = [c.text for c in batch]
        embeddings = ef(texts)

        for chunk, embedding in zip(batch, embeddings):
            chunk.embedding = embedding

        insert_chunks(conn, batch)
        conn.commit()

        progress = min(i + batch_size, len(all_chunks))
        print(f"  Processed {progress}/{len(all_chunks)} chunks")

    print(f"\nIndex complete!")
    print(f"  Database: {db_path}")
    print(f"  Notes: {len(notes)}")
    print(f"  Chunks: {len(all_chunks)}")


def show_stats(db_path: str):
    """Show index statistics."""
    if not Path(db_path).exists():
        print(f"Database not found: {db_path}")
        print("Run: python index.py --rebuild")
        return

    conn = sqlite3.connect(db_path)
    conn.enable_load_extension(True)
    sqlite_vec.load(conn)
    conn.enable_load_extension(False)

    # Get counts
    notes_count = conn.execute("SELECT COUNT(*) FROM notes").fetchone()[0]
    chunks_count = conn.execute("SELECT COUNT(*) FROM vec_chunks").fetchone()[0]

    # Get folder distribution
    folders = conn.execute("""
        SELECT folder, COUNT(*) as count
        FROM notes
        GROUP BY folder
        ORDER BY count DESC
        LIMIT 10
    """).fetchall()

    # Get status distribution
    statuses = conn.execute("""
        SELECT status, COUNT(*) as count
        FROM notes
        WHERE status IS NOT NULL
        GROUP BY status
    """).fetchall()

    # Get database size
    db_size = Path(db_path).stat().st_size / (1024 * 1024)

    print(f"\n=== Vault Search Index Statistics ===\n")
    print(f"Database: {db_path}")
    print(f"Size: {db_size:.2f} MB")
    print(f"Notes: {notes_count}")
    print(f"Chunks: {chunks_count}")

    print(f"\nTop folders:")
    for folder, count in folders:
        folder_display = folder if folder else "(root)"
        print(f"  {folder_display}: {count}")

    if statuses:
        print(f"\nStatus distribution:")
        for status, count in statuses:
            print(f"  {status}: {count}")

    conn.close()


def main():
    parser = argparse.ArgumentParser(
        description="Build vault search index with sqlite-vec"
    )
    parser.add_argument(
        "--vault-path",
        default=DEFAULT_VAULT_PATH,
        help=f"Path to vault root (default: {DEFAULT_VAULT_PATH})"
    )
    parser.add_argument(
        "--db-path",
        default=DEFAULT_DB_PATH,
        help=f"Database path (default: {DEFAULT_DB_PATH})"
    )
    parser.add_argument(
        "--rebuild",
        action="store_true",
        help="Force full rebuild"
    )
    parser.add_argument(
        "--stats",
        action="store_true",
        help="Show index statistics"
    )

    args = parser.parse_args()

    if args.stats:
        show_stats(args.db_path)
    else:
        build_index(args.vault_path, args.db_path, args.rebuild)


if __name__ == "__main__":
    main()
