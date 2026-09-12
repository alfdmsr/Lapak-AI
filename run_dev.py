"""Jalankan layanan AI dan Next.js bersama: python run_dev.py."""
import os,sys,subprocess,time
from pathlib import Path
ROOT=Path(__file__).resolve().parent
if not (ROOT/'frontend'/'node_modules').exists():
 raise SystemExit('Jalankan npm ci di folder frontend terlebih dahulu.')
children=[]
try:
 children.append(subprocess.Popen([sys.executable,'-u','server.py'],cwd=ROOT/'ai-service'))
 time.sleep(.5)
 if children[0].poll() is not None:raise SystemExit('Backend gagal dimulai. Periksa port 8000.')
 children.append(subprocess.Popen(['npm.cmd' if os.name=='nt' else 'npm','run','dev','--','--webpack'],cwd=ROOT/'frontend',start_new_session=os.name!='nt'))
 print('Kedua layanan dimulai. Buka alamat Local yang dicetak Next.js. Ctrl+C untuk berhenti.',flush=True)
 while all(p.poll() is None for p in children):time.sleep(.5)
except KeyboardInterrupt:pass
finally:
 for p in children:
  if p.poll() is None:
   if os.name=='nt':subprocess.run(['taskkill','/PID',str(p.pid),'/T','/F'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
   else:
    import signal
    if p is children[-1] and len(children)>1:os.killpg(p.pid,signal.SIGTERM)
    else:p.terminate()
