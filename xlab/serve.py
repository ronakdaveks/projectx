#!/usr/bin/env python3
"""Serve X Intelact Lab locally: python3 serve.py [port]  ->  http://localhost:8000"""
import http.server, socketserver, sys, os
port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
os.chdir(os.path.dirname(os.path.abspath(__file__)))
class H(http.server.SimpleHTTPRequestHandler):
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map, '.js': 'text/javascript', '.woff2': 'font/woff2'}
    def log_message(self, *a): pass
    def do_GET(self):
        if self.path == '/favicon.ico':  # browsers ask for this regardless of <link rel=icon>
            self.send_response(204); self.end_headers(); return
        super().do_GET()
with socketserver.TCPServer(("127.0.0.1", port), H) as srv:
    print(f"X Intelact Lab running at http://localhost:{port}  (Ctrl+C to stop)")
    srv.serve_forever()
