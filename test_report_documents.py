import csv
import tempfile
import unittest
from pathlib import Path
import zipfile

from report_documents import inventory, render_markdown


class ReportDocumentsTests(unittest.TestCase):
    def test_inventory_describes_csv_and_zip(self):
        with tempfile.TemporaryDirectory() as temporary_directory:
            folder = Path(temporary_directory)
            with (folder / "people.CSV").open("w", newline="", encoding="utf-8") as file:
                writer = csv.writer(file)
                writer.writerows([["name", "city"], ["Ali", "Dubai"]])
            with zipfile.ZipFile(folder / "files.ZIP", "w") as archive:
                archive.writestr("notes/readme.txt", "hello")
                archive.writestr("../unsafe.txt", "blocked")

            report = inventory(folder)

            self.assertEqual(report["csv_files"][0]["row_count"], 1)
            self.assertEqual(report["csv_files"][0]["columns"], ["name", "city"])
            self.assertTrue(report["zip_files"][0]["valid"])
            self.assertTrue(report["zip_files"][0]["members"][1]["unsafe_path"])
            markdown = render_markdown(report)
            self.assertIn("CSV files: 1", markdown)
            self.assertIn("**(unsafe path)**", markdown)


if __name__ == "__main__":
    unittest.main()
