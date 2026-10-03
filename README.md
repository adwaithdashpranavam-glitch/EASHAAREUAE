# Eshaare document reporter

This repository contains a small, dependency-free utility for inventorying CSV
files and ZIP archives in an Eshaare documents folder. It records file sizes,
CSV headers and row counts, and ZIP member metadata without extracting archive
contents to disk.

## Usage

```bash
python3 report_documents.py
```

By default, the utility searches (case-insensitively) below `~/Documents` for a
directory named `eshaare documents`. You can also supply the directory directly:

```bash
python3 report_documents.py "/path/to/eshaare documents" --output report.md
```

The Markdown report defaults to `eshaare_documents_report.md` in the current
directory. Use `--json report.json` to also create a machine-readable report.
ZIP archives are validated and inspected in place; unsafe member paths are
flagged in the report.
