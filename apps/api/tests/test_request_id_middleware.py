import unittest

from fastapi.testclient import TestClient

from app.main import create_app


class RequestIDMiddlewareTests(unittest.TestCase):
    def test_adds_request_id_header(self) -> None:
        client = TestClient(create_app())

        response = client.get("/api/v1/health")

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.headers.get("x-request-id"))

    def test_preserves_caller_request_id(self) -> None:
        client = TestClient(create_app())

        response = client.get(
            "/api/v1/health",
            headers={"X-Request-ID": "test-request-id"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers.get("x-request-id"), "test-request-id")


if __name__ == "__main__":
    unittest.main()
