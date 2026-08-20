#!/usr/bin/env python3
"""Extract WheelMaker's active npm runtime package policy from npm.go."""

from __future__ import annotations

import argparse
import ast
import json
import re
import sys
from pathlib import Path
from typing import Any


STRING_OR_ALIAS = r'("(?:\\.|[^"\\])*")|([A-Za-z_][A-Za-z0-9_]*)'


def fail(message: str) -> None:
    print(f"error: {message}", file=sys.stderr)
    raise SystemExit(2)


def parse_string_constants(source: str) -> dict[str, str]:
    constants: dict[str, str] = {}
    for name, raw_value in re.findall(
        r"(?m)^\s*(?:const\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(\"(?:\\.|[^\"\\])*\")\s*$",
        source,
    ):
        constants[name] = ast.literal_eval(raw_value)
    return constants


def resolve_value(raw_value: str, constants: dict[str, str]) -> str:
    raw_value = raw_value.strip()
    if raw_value.startswith('"'):
        return str(ast.literal_eval(raw_value))
    return constants.get(raw_value, raw_value)


def parse_field(entry: str, field_name: str, constants: dict[str, str]) -> str:
    match = re.search(
        rf"\b{re.escape(field_name)}\s*:\s*({STRING_OR_ALIAS})",
        entry,
    )
    if not match:
        return ""
    return resolve_value(match.group(1) or match.group(2), constants)


def parse_agent_types(entry: str, constants: dict[str, str]) -> list[str]:
    match = re.search(r"\bAgentTypes\s*:\s*\[\]string\{(.*?)\}", entry, re.DOTALL)
    if not match:
        return []
    return [
        resolve_value(raw_value, constants)
        for raw_value in re.findall(r'"(?:\\.|[^"\\])*"|[A-Za-z_][A-Za-z0-9_]*', match.group(1))
    ]


def runtime_block(source: str) -> str:
    match = re.search(
        r"(?ms)^\s*var\s+runtimeNPMPackages\s*=\s*\[\]npmPackagePolicy\{(.*?)^\}",
        source,
    )
    if not match:
        fail("runtimeNPMPackages block not found")
    return match.group(1)


def entry_blocks(block: str) -> list[str]:
    entries: list[str] = []
    depth = 0
    start = -1
    in_string = False
    escaped = False
    for index, character in enumerate(block):
        if in_string:
            if escaped:
                escaped = False
            elif character == "\\":
                escaped = True
            elif character == '"':
                in_string = False
            continue
        if character == '"':
            in_string = True
            continue
        if character == "{":
            if depth == 0:
                start = index
            depth += 1
        elif character == "}":
            depth -= 1
            if depth == 0 and start >= 0:
                entries.append(block[start : index + 1])
                start = -1
    if depth != 0:
        fail("runtimeNPMPackages contains unbalanced braces")
    return entries


def package_file_name(package_name: str) -> str:
    return package_name.removeprefix("@").replace("/", "--") + ".md"


def inspect_policy(npm_go_path: Path) -> dict[str, Any]:
    try:
        source = npm_go_path.read_text(encoding="utf-8")
    except OSError as exc:
        fail(f"cannot read {npm_go_path}: {exc}")

    constants = parse_string_constants(source)
    private_package = constants.get("myFlickerPackageName", "@myflicker/cli")
    private_registry = constants.get("myFlickerRegistry", "")
    default_registry = constants.get("defaultNPMRegistry", "https://registry.npmjs.org")
    packages: list[dict[str, Any]] = []

    for raw_entry in entry_blocks(runtime_block(source)):
        package_name = parse_field(raw_entry, "PackageName", constants)
        kind = parse_field(raw_entry, "Kind", constants)
        if not package_name or kind != "runtime":
            continue
        packages.append(
            {
                "packageName": package_name,
                "displayName": parse_field(raw_entry, "DisplayName", constants),
                "agentTypes": parse_agent_types(raw_entry, constants),
                "binaryName": parse_field(raw_entry, "BinaryName", constants),
                "kind": kind,
                "registry": private_registry if package_name == private_package else default_registry,
                "fileName": package_file_name(package_name),
            }
        )

    if not packages:
        fail("runtimeNPMPackages contains no runtime packages")
    names = [item["packageName"] for item in packages]
    files = [item["fileName"] for item in packages]
    if len(names) != len(set(names)):
        fail("runtimeNPMPackages contains duplicate package names")
    if len(files) != len(set(files)):
        fail("runtimeNPMPackages maps multiple packages to one changelog file")

    return {"source": str(npm_go_path), "packages": packages}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("repo_root", nargs="?", default=".", type=Path)
    args = parser.parse_args()
    repo_root = args.repo_root.resolve()
    payload = inspect_policy(repo_root / "server" / "internal" / "hub" / "tools" / "npm.go")
    json.dump(payload, sys.stdout, ensure_ascii=False, indent=2)
    sys.stdout.write("\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
