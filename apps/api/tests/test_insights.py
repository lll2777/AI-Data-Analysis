import unittest

import httpx

from app.schemas.dataset import (
    DatasetPreviewResponse,
    DatasetProfileResponse,
    DatasetResponse,
)
from app.services.insights import InsightService


class FailingAIService:
    async def generate_insight(self, dataset_profile, chart_context=None):
        raise httpx.ConnectError("network unavailable")


class InsightServiceTests(unittest.IsolatedAsyncioTestCase):
    async def test_ai_provider_failure_returns_warning_insight(self) -> None:
        service = object.__new__(InsightService)
        service.ai_service = FailingAIService()

        insights = await service._generate_ai_insights(
            profile=DatasetProfileResponse(
                dataset=DatasetResponse(
                    id="dataset-1",
                    workspace_id="workspace-1",
                    owner_id="user-1",
                    name="sales",
                    status="ready",
                    row_count=3,
                    column_count=1,
                ),
                columns=[],
                summary={"row_count": 3, "column_count": 1},
                missing_values={},
                outliers={},
                correlations={},
                time_series={},
                categorical_aggregates={},
            ),
            preview=DatasetPreviewResponse(
                dataset_id="dataset-1",
                columns=["region"],
                rows=[{"region": "East"}],
                row_count=1,
            ),
            chart_context=[],
        )

        self.assertEqual(len(insights), 1)
        self.assertEqual(insights[0]["insight_type"], "warning")
        self.assertIn("temporarily unavailable", insights[0]["summary"])


if __name__ == "__main__":
    unittest.main()
