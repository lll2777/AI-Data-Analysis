from __future__ import annotations

import unittest
import sys
from pathlib import Path
from tempfile import TemporaryDirectory

sys.path.insert(0, str(Path(__file__).resolve().parent))

from check_env import parse_env


class EnvParsingTests(unittest.TestCase):
    def test_parse_env_accepts_utf8_bom(self) -> None:
        tmp_root = Path.cwd() / "tmp"
        tmp_root.mkdir(exist_ok=True)
        with TemporaryDirectory(dir=tmp_root) as temp_dir:
            env_path = Path(temp_dir) / ".env"
            env_path.write_text("APP_ENV=development\n", encoding="utf-8-sig")

            self.assertEqual(parse_env(env_path)["APP_ENV"], "development")

    def test_production_template_uses_default_mimo_provider_settings(self) -> None:
        env = parse_env(Path(".env.production.example"))

        self.assertEqual(env["MIMO_BASE_URL"], "https://token-plan-cn.xiaomimimo.com/v1")
        self.assertEqual(env["MIMO_MODEL"], "mimo-v2.5")


if __name__ == "__main__":
    unittest.main()
