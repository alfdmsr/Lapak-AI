"""HTTP contract tests; never call the external AI provider."""
import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
from fastapi.testclient import TestClient
import server


class ApiTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(server.app)

    def test_layers_and_summary_without_ai_key(self):
        with patch.dict(os.environ, {'GEMINI_API_KEY': ''}):
            self.assertEqual(self.client.get('/health').json()['status'], 'ok')
            self.assertFalse(self.client.get('/health').json()['key_configured'])
            self.assertEqual(self.client.get('/summary').status_code, 200)
            for name in server.LAYERS:
                response = self.client.get('/layers/' + name)
                self.assertEqual(response.status_code, 200)
                self.assertEqual(response.json()['type'], 'FeatureCollection')

    def test_missing_and_invalid_data(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / 'data.json'
            with patch.object(server, 'SUMMARY', path):
                self.assertEqual(self.client.get('/summary').status_code, 503)
                path.write_text('invalid')
                self.assertEqual(self.client.get('/summary').status_code, 503)
        self.assertEqual(self.client.get('/layers/unknown').status_code, 404)

    def test_chat_validation(self):
        for payload in [{}, {'question': ' '}, {'question': 'x', 'mode': 'wrong'},
                        {'question': 'x', 'evidence_ids': [1]},
                        {'question': 'x', 'evidence_ids': ['x'] * 6},
                        {'question': 'x', 'unexpected': True}]:
            self.assertEqual(self.client.post('/chat', json=payload).status_code, 400)
        self.assertEqual(self.client.post('/chat', content='x' * 12001).status_code, 413)
        self.assertEqual(self.client.post('/chat', json={'question': 'x'},
                         headers={'origin': 'https://untrusted.invalid'}).status_code, 403)

    def test_chat_contract_and_sanitized_failure(self):
        with patch.object(server, 'answer', return_value={'mode': 'preview_not_llm'}) as answer:
            self.assertEqual(self.client.post('/chat', json={'question': ' x '}).status_code, 200)
            answer.assert_called_once_with('x', 'preview', evidence_ids=None)
        with patch.object(server, 'answer', side_effect=RuntimeError('private detail')):
            response = self.client.post('/chat', json={'question': 'x'})
            self.assertEqual(response.status_code, 502)
            self.assertNotIn('private detail', response.text)


if __name__ == '__main__':
    unittest.main()
