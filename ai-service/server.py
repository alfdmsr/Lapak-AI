"""HTTP API for LAPAK-AI. Run with python server.py or uvicorn server:app."""
import json
import os
from pathlib import Path
from typing import Literal

import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ConfigDict, Field, ValidationError
from starlette.concurrency import run_in_threadpool

from jawab import ROOT, answer

LAYERS = {name: ROOT / 'data' / 'map' / (name + '.geojson') for name in (
    'study_boundary', 'osm_reference', 'rbi_reference', 'survey_unverified'
)}
SUMMARY = ROOT / 'data' / 'processed' / 'summary.json'
app = FastAPI(title='LAPAK-AI API', docs_url=None, redoc_url=None, openapi_url=None)
origins = [value.strip() for value in os.getenv('WEBGIS_ORIGIN', 'http://localhost:3000').split(',') if value.strip()]
app.add_middleware(CORSMiddleware, allow_origins=origins,
                   allow_methods=['GET', 'POST'], allow_headers=['Content-Type'])


def error(status: int, message: str):
    return JSONResponse({'error': message}, status_code=status)


def read_data(path: Path):
    try:
        return JSONResponse(json.loads(path.read_text(encoding='utf-8')))
    except (OSError, ValueError):
        return error(503, 'Data belum tersedia atau format data tidak valid di server.')


@app.get('/health')
def health():
    return {'status': 'ok', 'provider': 'gemini',
            'key_configured': bool(os.getenv('GEMINI_API_KEY'))}


@app.get('/summary')
def summary():
    return read_data(SUMMARY)


@app.get('/layers/{name}')
def layer(name: str):
    if name not in LAYERS:
        return error(404, 'Layer tidak ditemukan.')
    return read_data(LAYERS[name])


class ChatInput(BaseModel):
    model_config = ConfigDict(extra='forbid', strict=True)
    question: str = Field(min_length=1, max_length=2000)
    mode: Literal['preview', 'live'] = 'preview'
    evidence_ids: list[str] | None = Field(default=None, max_length=5)


@app.post('/chat')
async def chat(request: Request):
    origin = request.headers.get('origin')
    if origin and origin not in origins:
        return error(403, 'Origin tidak diizinkan.')
    body = bytearray()
    async for chunk in request.stream():
        body.extend(chunk)
        if len(body) > 12000:
            return error(413, 'Permintaan terlalu besar.')
    try:
        data = ChatInput.model_validate_json(body)
        if not data.question.strip():
            raise ValueError('empty')
    except (ValidationError, ValueError):
        return error(400, 'Gunakan question 1–2000 karakter, mode preview/live, dan maksimal 5 evidence_ids.')
    try:
        return await run_in_threadpool(answer, data.question.strip(), data.mode,
                                      evidence_ids=data.evidence_ids)
    except (FileNotFoundError, json.JSONDecodeError):
        return error(503, 'Data analisis belum tersedia atau tidak valid di server.')
    except (ValueError, TypeError):
        return error(400, 'Input, konfigurasi AI, atau format jawaban tidak valid.')
    except RuntimeError:
        return error(502, 'Layanan AI belum tersedia. Coba kembali nanti.')
    except Exception:
        return error(500, 'Analisis gagal diproses oleh server.')


if __name__ == '__main__':
    uvicorn.run(app, host=os.getenv('HOST', '0.0.0.0'),
                port=int(os.getenv('PORT', '8000')), access_log=False)
