#!/usr/bin/env python3
"""Validate WheelMaker npm changelog files against the active npm policy."""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path
from typing import Iterable

from inspect_npm_policy import inspect_policy


VERSION_HEADING = re.compile(
    r"^##\s+\[?v?(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?)\]?(?:\s+-.*)?$"
)
PLACEHOLDER = re.compile(r"\b(?:TODO|TBD|FIXME)\b|待补充|待确认", re.IGNORECASE)


def fail(message: str, errors: list[str]) -> None:
    errors.append(message)


def semver_key(version: str) -> tuple:
    core, _, build = version.partition("+")
    numbers, _, prerelease = core.partition("-")
    major, minor, patch = (int(value) for value in numbers.split("."))
    if not prerelease:
        release_key = (1,)
    else:
        identifiers: list[tuple[int, object]] = []
        for identifier in prerelease.split("."):
            if identifier.isdigit():
                identifiers.append((0, int(identifier)))
            else:
                identifiers.append((1, identifier))
        release_key = (0, tuple(identifiers))
    return (major, minor, patch, release_key, build)


def version_sections(content: str) -> list[tuple[str, str]]:
    matches = list(
        re.finditer(
            r"(?m)^##\s+.*$",
            content,
        )
    )
    sections: list[tuple[str, str]] = []
    for index, match in enumerate(matches):
        heading = match.group(0)
        version_match = VERSION_HEADING.match(heading)
        if not version_match:
            continue
        end = matches[index + 1].start() if index + 1 < len(matches) else len(content)
        sections.append((version_match.group(1), content[match.end() : end]))
    return sections


def validate_file(path: Path, package_name: str, errors: list[str]) -> list[str]:
    try:
        content = path.read_text(encoding="utf-8")
    except OSError as exc:
        fail(f"{path}: cannot read file: {exc}", errors)
        return []

    if not re.search(rf"(?m)^#\s+{re.escape(package_name)}\s*$", content):
        fail(f"{path}: missing package title", errors)
    if PLACEHOLDER.search(content):
        fail(f"{path}: contains an unresolved placeholder", errors)

    sections = version_sections(content)
    if not sections:
        fail(f"{path}: no semver version headings", errors)
        return []
    versions = [version for version, _ in sections]
    if len(versions) != len(set(versions)):
        fail(f"{path}: duplicate version heading", errors)
    if versions != sorted(versions, key=semver_key, reverse=True):
        fail(f"{path}: version headings must be newest first", errors)
    for version, section in sections:
        if not re.search(r"(?m)^###\s+WheelMaker integration\s*$", section):
            fail(f"{path}: {version} missing WheelMaker integration section", errors)
    return versions


def validate(repo_root: Path) -> tuple[list[str], list[str]]:
    policy = inspect_policy(repo_root / "server" / "internal" / "hub" / "tools" / "npm.go")
    changelog_dir = repo_root / "docs" / "changelog"
    errors: list[str] = []
    summaries: list[str] = []
    expected_files = {item["fileName"] for item in policy["packages"]}
    if not changelog_dir.is_dir():
        return [], [f"missing changelog directory: {changelog_dir}"]

    actual_files = {path.name for path in changelog_dir.glob("*.md")}
    for extra in sorted(actual_files - expected_files):
        fail(f"unexpected changelog file: {extra}", errors)
    for item in policy["packages"]:
        path = changelog_dir / item["fileName"]
        if not path.exists():
            fail(f"missing changelog file: {item['fileName']}", errors)
            continue
        versions = validate_file(path, item["packageName"], errors)
        summaries.append(f"{item['packageName']}: {len(versions)} versions")
    return summaries, errors


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("repo_root", nargs="?", default=".", type=Path)
    args = parser.parse_args()
    summaries, errors = validate(args.repo_root.resolve())
    for summary in summaries:
        print(summary)
    if errors:
        for error in errors:
            print(f"error: {error}", file=sys.stderr)
        return 1
    print(f"validated {len(summaries)} changelog files")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
