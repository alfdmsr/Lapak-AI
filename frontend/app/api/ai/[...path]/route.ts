const allowed = new Set(['health', 'summary', 'layers/study_boundary', 'layers/osm_reference', 'layers/rbi_reference', 'layers/survey_unverified']);
export const runtime = 'nodejs';

async function forward(path: string, body?: {question: string; mode: string; evidence_ids?: string[]}) {
  try {
    const configured = process.env.AI_BACKEND_URL?.trim();
    if (!configured && process.env.NODE_ENV === 'production') {
      return Response.json({error: 'AI_BACKEND_URL belum dikonfigurasi pada server frontend.'}, {status: 503});
    }
    const base = (configured || 'http://127.0.0.1:8000').replace(/\/$/, '');
    const response = await fetch(`${base}/${path}`, {
      method: body ? 'POST' : 'GET',
      headers: {'Content-Type': 'application/json'},
      body: body ? JSON.stringify(body) : undefined,
      cache: 'no-store', signal: AbortSignal.timeout(body ? 360000 : 15000),
    });
    const data = await response.json();
    return Response.json(data, {status: response.status});
  } catch {
    return Response.json({error: 'Backend AI belum tersedia atau waktu tunggu habis. Pastikan backend aktif.'}, {status: 502});
  }
}

export async function GET(_request: Request, context: {params: Promise<{path: string[]}>}) {
  const path = (await context.params).path.join('/');
  if (!allowed.has(path)) return Response.json({error: 'Endpoint tidak ditemukan.'}, {status: 404});
  return forward(path);
}

export async function POST(request: Request, context: {params: Promise<{path: string[]}>}) {
  if ((await context.params).path.join('/') !== 'chat') return Response.json({error: 'Endpoint tidak ditemukan.'}, {status: 404});
  const origin = request.headers.get('origin');
  // Origin tambahan ditentukan operator; jangan percaya header forwarded atau wildcard.
  const allowedOrigins = new Set([
    new URL(request.url).origin,
    ...(process.env.AI_ALLOWED_ORIGINS || '')
      .split(',')
      .map(value => value.trim())
      .filter(Boolean),
  ]);
  if (origin && !allowedOrigins.has(origin)) {
    return Response.json({error: 'Origin tidak diizinkan.'}, {status: 403});
  }
  try {
    const text = await request.text();
    if (new TextEncoder().encode(text).length > 12000) return Response.json({error: 'Permintaan terlalu panjang.'}, {status: 413});
    const data = JSON.parse(text);
    if (!data || typeof data !== 'object' || Object.keys(data).some(k => !['question','mode','evidence_ids'].includes(k)) || typeof data.question !== 'string' || !data.question.trim() || data.question.length > 2000 || !['live','preview'].includes(data.mode || 'live')) {
      return Response.json({error: 'Gunakan pertanyaan 1–2000 karakter.'}, {status: 400});
    }
    if (data.evidence_ids !== undefined && (!Array.isArray(data.evidence_ids) || data.evidence_ids.length > 5 || !data.evidence_ids.every((id: unknown) => typeof id === 'string'))) {
      return Response.json({error: 'Pilihan sumber tidak valid.'}, {status: 400});
    }
    return forward('chat', {question: data.question.trim(), mode: data.mode || 'live', evidence_ids: data.evidence_ids});
  } catch {
    return Response.json({error: 'Format permintaan tidak valid.'}, {status: 400});
  }
}
