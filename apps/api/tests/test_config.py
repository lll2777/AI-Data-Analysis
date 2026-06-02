import unittest

from app.core.config import Settings


class SettingsTests(unittest.TestCase):
    def test_default_cors_allows_localhost_and_loopback(self) -> None:
        settings = Settings(_env_file=None)

        self.assertIn("http://localhost:3000", settings.cors_origins)
        self.assertIn("http://127.0.0.1:3000", settings.cors_origins)


if __name__ == "__main__":
    unittest.main()
