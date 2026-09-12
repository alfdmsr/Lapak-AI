// Import ke komponen chat. baseUrl adalah URL backend, bukan API key.
export async function tanyaAI(question, baseUrl = 'http://127.0.0.1:8000') {
  const response = await fetch(`${baseUrl}/chat`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({question, mode: 'live'})
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Layanan belum tersedia.');
  return {mode: data.mode, ...data.display};
}
// Render answer sebagai teks (React: {answer}), jangan sebagai HTML mentah.
// Tampilkan sources, notes dan mode; fallback bukan jawaban Gemini yang tervalidasi.
// Nonaktifkan tombol kirim selama menunggu; jangan retry otomatis dari frontend.
