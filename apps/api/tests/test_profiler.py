import unittest

from app.services.analysis.profiler import DatasetProfiler


class DatasetProfilerTests(unittest.TestCase):
    def test_boolean_columns_are_not_counted_as_numeric(self) -> None:
        content = "\n".join(
            [
                "age,is_active,revenue,signup_date",
                "41,true,100.5,2024-01-01",
                "52,false,120.0,2024-01-02",
                "37,true,90.25,2024-01-03",
                "44,false,110.75,2024-01-04",
            ],
        ).encode()

        result = DatasetProfiler().analyze(content=content, filename="sample.csv")
        columns = {column.name: column for column in result.columns}

        self.assertEqual(columns["is_active"].data_type, "boolean")
        self.assertEqual(result.summary["numeric_column_count"], 2)
        self.assertIn("age", result.correlations["pairs"][0].values())
        self.assertNotIn("is_active", result.outliers)
        self.assertTrue(
            all("is_active" not in pair.values() for pair in result.correlations["pairs"]),
        )

    def test_integer_columns_are_not_treated_as_time_series(self) -> None:
        content = "\n".join(
            [
                "age,revenue,event_date",
                "41,100,2024-01-01",
                "52,120,2024-01-02",
                "37,90,2024-01-03",
            ],
        ).encode()

        result = DatasetProfiler().analyze(content=content, filename="sample.csv")

        self.assertNotIn("age", result.time_series)
        self.assertIn("event_date", result.time_series)


if __name__ == "__main__":
    unittest.main()
