#!/usr/bin/env python3
"""Create an inventory report for CSV files and ZIP archives."""

from __future__ import annotations

import argparse
import csv
import json
from pathlib import Path, PurePosixPath
import zipfile


def find_documents_folder(home: Path) -> Path:
    """Find `eshaare documents` below the user's Documents directory."""
    documents = home / "Documents"
    if not documents.is_dir():
        raise FileNotFoundError(f"Documents directory not found: {documents}")
    matches = sorted(
        path for path in documents.rglob("*")
        if path.is_dir() and path.name.casefold() == "eshaare documents"
    )
    if not matches:
        raise FileNotFoundError(
            f"No 'eshaare documents' folder found below {documents}"
        )
    return matches[0]


def csv_details(path: Path) -> dict[str, object]:
    result: dict[str, object] = {
        "path": str(path),
        "size_bytes": path.stat().st_size,
    }
    try:
        with path.open("r", encoding="utf-8-sig", newline="") as handle:
            reader = csv.reader(handle)
            header = next(reader, [])
            result.update(columns=header, row_count=sum(1 for _ in reader))
    except (OSError, UnicodeError, csv.Error) as error:
        result["error"] = str(error)
    return result


def _unsafe_member(name: str) -> bool:
    member = PurePosixPath(name.replace("\\", "/"))
    return member.is_absolute() or ".." in member.parts


def zip_details(path: Path) -> dict[str, object]:
    result: dict[str, object] = {
        "path": str(path),
        "size_bytes": path.stat().st_size,
        "members": [],
    }
    try:
        with zipfile.ZipFile(path) as archive:
            result["members"] = [
                {
                    "name": item.filename,
                    "size_bytes": item.file_size,
                    "compressed_bytes": item.compress_size,
                    "unsafe_path": _unsafe_member(item.filename),
                }
                for item in archive.infolist()
            ]
            bad_member = archive.testzip()
            result["valid"] = bad_member is None
            if bad_member:
                result["error"] = f"CRC check failed for {bad_member}"
    except (OSError, zipfile.BadZipFile, RuntimeError) as error:
        result.update(valid=False, error=str(error))
    return result


def inventory(folder: Path) -> dict[str, object]:
    files = [path for path in folder.rglob("*") if path.is_file()]
    csv_files = sorted(
        (path for path in files if path.suffix.casefold() == ".csv"),
        key=lambda path: str(path).casefold(),
    )
    zip_files = sorted(
        (path for path in files if path.suffix.casefold() == ".zip"),
        key=lambda path: str(path).casefold(),
    )
    return {
        "source": str(folder.resolve()),
        "csv_files": [csv_details(path) for path in csv_files],
        "zip_files": [zip_details(path) for path in zip_files],
    }


def render_markdown(report: dict[str, object]) -> str:
    csv_files = report["csv_files"]
    zip_files = report["zip_files"]
    lines = [
        "# Eshaare documents report",
        "",
        f"- Source: `{report['source']}`",
        f"- CSV files: {len(csv_files)}",
        f"- ZIP files: {len(zip_files)}",
        "",
        "## CSV files",
        "",
    ]
    if not csv_files:
        lines.append("No CSV files found.")
    for item in csv_files:
        lines.extend([
            f"### `{item['path']}`",
            f"- Size: {item['size_bytes']} bytes",
            f"- Data rows: {item.get('row_count', 'unavailable')}",
            f"- Columns: {', '.join(item.get('columns', [])) or 'none'}",
        ])
        if "error" in item:
            lines.append(f"- Error: {item['error']}")
        lines.append("")
    lines.extend(["## ZIP files", ""])
    if not zip_files:
        lines.append("No ZIP files found.")
    for item in zip_files:
        lines.extend([
            f"### `{item['path']}`",
            f"- Size: {item['size_bytes']} bytes",
            f"- Valid: {item.get('valid', False)}",
            f"- Members: {len(item['members'])}",
        ])
        if "error" in item:
            lines.append(f"- Error: {item['error']}")
        for member in item["members"]:
            warning = " **(unsafe path)**" if member["unsafe_path"] else ""
            lines.append(
                f"  - `{member['name']}` — {member['size_bytes']} bytes "
                f"({member['compressed_bytes']} compressed){warning}"
            )
        lines.append("")
    return "\n".join(lines).rstrip() + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("folder", nargs="?", type=Path)
    parser.add_argument("--output", type=Path, default=Path("eshaare_documents_report.md"))
    parser.add_argument("--json", type=Path, dest="json_output")
    args = parser.parse_args()

    try:
        folder = args.folder or find_documents_folder(Path.home())
        if not folder.is_dir():
            raise FileNotFoundError(f"Folder not found: {folder}")
        report = inventory(folder)
    except (FileNotFoundError, PermissionError) as error:
        parser.error(str(error))

    args.output.write_text(render_markdown(report), encoding="utf-8")
    if args.json_output:
        args.json_output.write_text(
            json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
        )
    print(f"Report written to {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
