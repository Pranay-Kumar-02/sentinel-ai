# ─────────────────────────────────────────────────────────────────────────────
# SENTINEL AI — Backend Dockerfile
#
# Why this exists instead of Render's default Python buildpack: two of your
# dependencies (pytesseract, pyzbar) are thin Python wrappers around real
# system-level binaries/libraries (Tesseract OCR, libzbar). pip installing
# the Python package does NOT install the underlying binary — without this
# Dockerfile's apt-get step, Screenshot OCR and QR Safe Scanner would crash
# on Render even though they work fine on your machine (which already has
# these installed at the OS level, probably via a Windows installer you set
# up separately from pip).
# ─────────────────────────────────────────────────────────────────────────────

FROM python:3.12-slim

WORKDIR /app

# System-level dependencies pip cannot provide on its own:
#   tesseract-ocr    — real OCR engine behind pytesseract (Screenshot forensics)
#   libzbar0         — real barcode/QR decoding library behind pyzbar (QR Scanner)
#   libglib2.0-0     — common runtime dependency for opencv-python-headless
#                       on minimal Linux images; cheap to include, avoids a
#                       hard-to-diagnose import crash if OpenCV needs it.
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    libzbar0 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (before the rest of the code) so Docker caches the
# pip install layer separately — code changes won't force a full dependency
# reinstall on every rebuild, only requirements.txt changes will.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Now copy the actual backend code
COPY . .

# Render injects the real port to listen on via the PORT env var at runtime
# — it is NOT always 8000, and hardcoding 8000 here is a common way this
# silently fails (the container runs, but Render's health check can never
# reach it, and the deploy looks "successful" while being totally broken).
# ${PORT:-8000} falls back to 8000 for local `docker run` testing, and uses
# Render's real assigned port in production automatically.
ENV PORT=8000
EXPOSE $PORT

# NOTE: "main:app" assumes your FastAPI instance is named `app` inside
# backend/main.py (i.e. `uvicorn.run` would normally target `main:app`).
# If your entrypoint file/object is named differently, this line needs a
# one-word change to match — confirm once main.py is shared.
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}