from pathlib import Path
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from api.main import app as api_app

app = FastAPI()
app.mount("/api", api_app)

FRONTEND_BUILD = Path(__file__).parent / "frontend_build"

app.mount("/assets", StaticFiles(directory=FRONTEND_BUILD / "assets"), name="assets")


@app.get("/")
async def serve_frontend():
    return FileResponse(FRONTEND_BUILD / "index.html")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
