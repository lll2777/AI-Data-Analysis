from __future__ import annotations

import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class LocalDevScriptTests(unittest.TestCase):
    def test_start_local_script_documents_and_starts_both_services(self) -> None:
        script = ROOT / "scripts" / "start-local.ps1"

        self.assertTrue(script.exists(), "scripts/start-local.ps1 should exist")
        content = script.read_text(encoding="utf-8")
        self.assertIn("uvicorn", content)
        self.assertIn("npm.cmd", content)
        self.assertIn("127.0.0.1", content)
        self.assertIn("8000", content)
        self.assertIn("3000", content)

    def test_check_local_script_checks_frontend_backend_and_supabase(self) -> None:
        script = ROOT / "scripts" / "check-local.ps1"

        self.assertTrue(script.exists(), "scripts/check-local.ps1 should exist")
        content = script.read_text(encoding="utf-8")
        self.assertIn("BackendPort = 8000", content)
        self.assertIn("FrontendPort = 3000", content)
        self.assertIn("api/v1/health", content)
        self.assertIn("http://127.0.0.1", content)
        self.assertIn("SUPABASE_URL", content)
        self.assertIn("auth/v1/settings", content)


if __name__ == "__main__":
    unittest.main()
