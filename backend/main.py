from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from core.analyzer import full_analysis
import uvicorn

# ── App Setup ─────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Sentinel AI",
    description="Enterprise Cyber Threat Intelligence Platform",
    version="1.0.0"
)

# ── CORS — allows frontend to talk to backend ─────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Request Model ─────────────────────────────────────────────────────────────
class AnalysisRequest(BaseModel):
    text: str

# ── Routes ────────────────────────────────────────────────────────────────────
@app.get("/")
async def root():
    return {
        "name": "Sentinel AI",
        "version": "1.0.0",
        "status": "operational",
        "message": "Enterprise Cyber Threat Intelligence Platform"
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.post("/analyze")
async def analyze(request: AnalysisRequest):
    """
    Main endpoint — takes any text input and returns full threat analysis.
    """
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Input text cannot be empty")
    
    if len(request.text) > 10000:
        raise HTTPException(status_code=400, detail="Input too long. Max 10000 characters.")
    
    try:
        result = await full_analysis(request.text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

# ── Run ───────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)