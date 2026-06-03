import unittest
from types import SimpleNamespace

from app.services.agent import AgentService


class FakeAgentRepository:
    def __init__(self) -> None:
        self.failed_steps: list[tuple[str, str]] = []
        self.completed_steps: list[tuple[str, dict]] = []

    def start_step(self, *, run_id, step_name, input_payload):
        return SimpleNamespace(id=f"{run_id}:{step_name}")

    def fail_step(self, *, step_id, error_message):
        self.failed_steps.append((step_id, error_message))

    def complete_step(self, *, step_id, output):
        self.completed_steps.append((step_id, output))


class AgentServiceToolTests(unittest.IsolatedAsyncioTestCase):
    def test_run_tool_marks_step_failed_when_tool_raises(self) -> None:
        service = object.__new__(AgentService)
        repository = FakeAgentRepository()
        service.agent_repository = repository

        with self.assertRaisesRegex(RuntimeError, "chart failure"):
            service._run_tool(
                run_id="run-1",
                step_name="recommend_charts",
                input_payload={"dataset_id": "dataset-1"},
                tool=lambda: raise_runtime_error("chart failure"),
            )

        self.assertEqual(
            repository.failed_steps,
            [("run-1:recommend_charts", "chart failure")],
        )
        self.assertEqual(repository.completed_steps, [])

    async def test_run_async_tool_marks_step_failed_when_tool_raises(self) -> None:
        service = object.__new__(AgentService)
        repository = FakeAgentRepository()
        service.agent_repository = repository

        async def failing_tool():
            raise RuntimeError("insight failure")

        with self.assertRaisesRegex(RuntimeError, "insight failure"):
            await service._run_async_tool(
                run_id="run-1",
                step_name="generate_insights",
                input_payload={"dataset_id": "dataset-1"},
                tool=failing_tool,
            )

        self.assertEqual(
            repository.failed_steps,
            [("run-1:generate_insights", "insight failure")],
        )
        self.assertEqual(repository.completed_steps, [])


def raise_runtime_error(message: str):
    raise RuntimeError(message)


if __name__ == "__main__":
    unittest.main()
