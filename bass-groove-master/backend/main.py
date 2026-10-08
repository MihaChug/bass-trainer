import os
import subprocess
from pathlib import Path
from fastapi import FastAPI
from fastapi.responses import HTMLResponse, FileResponse
from api.main import app as api_app

app = FastAPI()
app.mount("/api", api_app)

BACKEND_DIR = Path(__file__).parent
FRONTEND_BUILD = BACKEND_DIR / "frontend_build"
INDEX_HTML = FRONTEND_BUILD / "index.html"

def ensure_frontend_exists():
    if not INDEX_HTML.exists():
        frontend_dir = BACKEND_DIR.parent / "frontend"
        if (frontend_dir / "package.json").exists():
            print("Building frontend...")
            subprocess.run(["npm", "install"], cwd=frontend_dir, check=True)
            subprocess.run(["npm", "run", "build"], cwd=frontend_dir, check=True)
            dist = frontend_dir / "dist"
            if dist.exists():
                os.system(f"cp -r {dist}/* {FRONTEND_BUILD}/")

@app.get("/")
async def serve_frontend():
    ensure_frontend_exists()
    return HTMLResponse(content=INDEX_HTML.read_text()) if INDEX_HTML.exists() else HTMLResponse(content="Frontend building...", status_code=202)

@app.get("/assets/{path:path}")
async def serve_assets(path: str):
    ensure_frontend_exists()
    file_path = FRONTEND_BUILD / "assets" / path
    return FileResponse(file_path) if file_path.exists() else FileResponse(INDEX_HTML)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
