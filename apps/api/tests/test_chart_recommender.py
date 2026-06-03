import unittest

from app.schemas.dataset import (
    DatasetColumnProfile,
    DatasetPreviewResponse,
    DatasetProfileResponse,
    DatasetResponse,
)
from app.services.charts.recommender import ChartRecommender


class ChartRecommenderTests(unittest.TestCase):
    def test_recommends_chinese_chart_set_for_mixed_sales_data(self) -> None:
        profile = DatasetProfileResponse(
            dataset=DatasetResponse(
                id="dataset-1",
                workspace_id="workspace-1",
                owner_id="user-1",
                name="sales",
                status="ready",
                row_count=3,
                column_count=5,
            ),
            columns=[
                column("date", "datetime"),
                column("region", "category"),
                column("channel", "category"),
                column("revenue", "number"),
                column("cost", "number"),
            ],
            summary={"row_count": 3, "column_count": 5},
            missing_values={},
            outliers={},
            correlations={},
            time_series={"date": {"non_null_count": 3}},
            categorical_aggregates={},
        )
        preview = DatasetPreviewResponse(
            dataset_id="dataset-1",
            columns=["date", "region", "channel", "revenue", "cost"],
            rows=[
                {
                    "date": "2024-01-01",
                    "region": "华东",
                    "channel": "线上",
                    "revenue": 100,
                    "cost": 60,
                },
                {
                    "date": "2024-01-02",
                    "region": "华南",
                    "channel": "门店",
                    "revenue": 150,
                    "cost": 90,
                },
                {
                    "date": "2024-01-03",
                    "region": "华东",
                    "channel": "线上",
                    "revenue": 120,
                    "cost": 70,
                },
            ],
            row_count=3,
        )

        charts = ChartRecommender().recommend(profile=profile, preview=preview)
        chart_types = {chart["chart_type"] for chart in charts}
        titles = [chart["title"] for chart in charts]

        self.assertLessEqual(len(charts), 10)
        self.assertIn("bar", chart_types)
        self.assertIn("pie", chart_types)
        self.assertIn("line", chart_types)
        self.assertIn("area", chart_types)
        self.assertIn("scatter", chart_types)
        self.assertTrue(any("收入按区域" in title for title in titles))
        self.assertTrue(all(chart["config"]["data"] for chart in charts))


def column(name: str, data_type: str) -> DatasetColumnProfile:
    return DatasetColumnProfile(
        name=name,
        original_name=name,
        data_type=data_type,
        nullable=False,
        missing_count=0,
        unique_count=3,
    )


if __name__ == "__main__":
    unittest.main()
