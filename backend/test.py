import asyncio
import os
import sys
import tempfile
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


class TestHandler(BaseHTTPRequestHandler):
    def do_GET(self) -> None:
        self.send_response(200 if self.path == "/up" else 503)
        self.end_headers()

    def log_message(self, format: str, *args: object) -> None:
        return


def run() -> None:
    backend_directory = Path(__file__).resolve().parent
    original_directory = Path.cwd()
    sys.path.insert(0, str(backend_directory))

    with tempfile.TemporaryDirectory(prefix="pingly-test-") as temporary_directory:
        os.chdir(temporary_directory)

        from fastapi.testclient import TestClient

        from app.database.database import Base, SessionLocal, engine
        from app.main import app
        from app.models.health_check import HealthCheck
        from app.scheduler import monitor_active_websites

        server = ThreadingHTTPServer(("127.0.0.1", 0), TestHandler)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        base_url = f"http://127.0.0.1:{server.server_port}"

        try:
            Base.metadata.create_all(bind=engine)
            client = TestClient(app)

            up_response = client.post("/api/websites", json={"url": f"{base_url}/up"})
            down_response = client.post(
                "/api/websites",
                json={"url": f"{base_url}/down"},
            )
            invalid_response = client.post(
                "/api/websites",
                json={"url": "not-a-url"},
            )

            assert up_response.status_code == 201, up_response.text
            assert down_response.status_code == 201, down_response.text
            assert invalid_response.status_code == 422, invalid_response.text

            websites_response = client.get("/api/websites")
            assert websites_response.status_code == 200, websites_response.text
            assert len(websites_response.json()) == 2

            asyncio.run(monitor_active_websites())

            db = SessionLocal()
            try:
                health_checks = list(
                    db.query(HealthCheck).order_by(HealthCheck.website_id).all()
                )
            finally:
                db.close()

            assert len(health_checks) == 2
            assert [check.status.value for check in health_checks] == ["up", "down"]
            assert health_checks[0].status_code == 200
            assert health_checks[1].status_code == 503

            delete_response = client.delete(
                f"/api/websites/{up_response.json()['id']}"
            )
            assert delete_response.status_code == 204, delete_response.text

            active_websites_response = client.get("/api/websites")
            assert len(active_websites_response.json()) == 1
        finally:
            server.shutdown()
            server.server_close()
            engine.dispose()
            os.chdir(original_directory)

    print("All Pingly backend smoke tests passed.")


if __name__ == "__main__":
    run()
