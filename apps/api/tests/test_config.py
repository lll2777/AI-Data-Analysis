import unittest
from pathlib import Path
from tempfile import TemporaryDirectory

from app.core.config import Settings, find_api_root, find_repository_root


class SettingsTests(unittest.TestCase):
    def test_default_cors_allows_localhost_and_loopback(self) -> None:
        settings = Settings(_env_file=None)

        self.assertIn("http://localhost:3000", settings.cors_origins)
        self.assertIn("http://127.0.0.1:3000", settings.cors_origins)

    def test_repository_root_detection_supports_local_repo_layout(self) -> None:
        with TemporaryDirectory() as temp_dir:
            repo_root = Path(temp_dir) / "repo"
            config_file = repo_root / "apps" / "api" / "app" / "core" / "config.py"
            config_file.parent.mkdir(parents=True)
            repo_root.joinpath("apps", "api").mkdir(parents=True, exist_ok=True)
            repo_root.joinpath("scripts").mkdir()
            repo_root.joinpath("infra").mkdir()

            self.assertEqual(find_api_root(config_file), repo_root / "apps" / "api")
            self.assertEqual(find_repository_root(config_file), repo_root)

    def test_repository_root_detection_supports_docker_layout(self) -> None:
        with TemporaryDirectory() as temp_dir:
            app_root = Path(temp_dir) / "app"
            config_file = app_root / "app" / "core" / "config.py"
            config_file.parent.mkdir(parents=True)
            app_root.joinpath("scripts").mkdir()
            app_root.joinpath("infra").mkdir()

            self.assertEqual(find_api_root(config_file), app_root)
            self.assertEqual(find_repository_root(config_file), app_root)


if __name__ == "__main__":
    unittest.main()
