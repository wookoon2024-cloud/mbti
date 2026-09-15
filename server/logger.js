import { appendFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_DIR = path.join(__dirname, '..', 'logs');
const LOG_FILE = path.join(LOG_DIR, 'analyze.log');

export async function logAnalyze(entry) {
  const line = `${new Date().toISOString()} ${JSON.stringify(entry)}`;
  try {
    await mkdir(LOG_DIR, { recursive: true });
    await appendFile(LOG_FILE, `${line}\n`, 'utf8');
  } catch {
    /* logging must never break a request */
  }
  console.log(`[analyze] ${line}`);
}

export async function saveRawResponse(raw) {
  try {
    await mkdir(LOG_DIR, { recursive: true });
    const name = `raw-${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
    const file = path.join(LOG_DIR, name);
    await writeFile(file, raw, 'utf8');
    return file;
  } catch {
    return null;
  }
}
