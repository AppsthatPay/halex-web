import { Action, ActionResult, Content, HandlerCallback, IAgentRuntime } from '@elizaos/core';
import * as crypto from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';

// ZINIUM-SEED ORLI actions, in-process edition of the reference agent.
// Public-safe ONLY: no funds, keys, seeds, passwords, credentials, or private
// data. No network. No signing. No spending. Lessons index into the ZENIUM
// memory chain (hash-chained JSONL shards) when ZINIUM_LEDGER_DIR is set;
// otherwise the block is computed and returned without persisting, and the
// response says so plainly. Nothing is ever claimed as indexed when it is not.
// Typed against @elizaos/core 1.7.2 (Handler returns ActionResult; callback
// is optional in the handler signature).

const SECRET_MARKERS = [
  'password', 'passwd', 'secret', 'api_key', 'apikey',
  'private_key', 'privatekey', 'mnemonic', 'seed_phrase', 'seedphrase',
  'credential', 'auth_token', 'access_token', 'session_token',
  'cookie', 'bearer', 'secretkey',
];

function guard(text: string): void {
  const lowered = text.toLowerCase();
  for (const marker of SECRET_MARKERS) {
    if (lowered.includes(marker)) {
      throw new Error(`refused: payload looks like a secret (${marker})`);
    }
  }
}

function utcnow(): string {
  return new Date().toISOString().replace('+00:00', 'Z');
}

function blockHash(prevHash: string, payloadJson: string): string {
  return crypto.createHash('sha256').update(prevHash + payloadJson).digest('hex');
}

function latestHash(ledgerDir: string): string | null {
  if (!fs.existsSync(ledgerDir)) return null;
  let latest: { hash: string } | null = null;
  for (const name of fs.readdirSync(ledgerDir).sort()) {
    if (!name.endsWith('.jsonl')) continue;
    for (const line of fs.readFileSync(path.join(ledgerDir, name), 'utf-8').split('\n')) {
      if (line.trim()) latest = JSON.parse(line);
    }
  }
  return latest ? latest.hash : null;
}

function indexLesson(lesson: Record<string, unknown>, runtime: IAgentRuntime): { block: Record<string, unknown>; persisted: boolean } {
  const ledgerDir = runtime.getSetting('ZINIUM_LEDGER_DIR') as string | undefined;
  const prevHash = (ledgerDir && latestHash(ledgerDir)) || '0'.repeat(64);
  const payloadJson = JSON.stringify(lesson);
  const block: Record<string, unknown> = {
    prev_hash: prevHash,
    ts: utcnow(),
    payload: lesson,
    hash: blockHash(prevHash, payloadJson),
  };
  if (!ledgerDir) return { block, persisted: false };
  fs.mkdirSync(ledgerDir, { recursive: true });
  const day = new Date().toISOString().slice(0, 10);
  fs.appendFileSync(path.join(ledgerDir, day + '.jsonl'), JSON.stringify(block) + '\n');
  return { block, persisted: true };
}

async function reply(
  text: string,
  data: Record<string, unknown>,
  callback: HandlerCallback | undefined,
): Promise<ActionResult> {
  const content: Content = { text, action: 'ZINIUM_ORLI' };
  if (callback) {
    await callback(content);
  }
  return { text, success: true, data };
}

export const ziniumObserveAction: Action = {
  name: 'ZINIUM_OBSERVE',
  similes: ['ZINIUM OBSERVE', 'SEED OBSERVE'],
  description: 'ZINIUM-SEED Observe: record what the host stack exposed, nothing more.',
  validate: async () => true,
  handler: async (runtime, message, _state, _options, callback) => {
    const text = (message.content.text || '').trim();
    try {
      guard(text);
    } catch (e) {
      return reply(`ZINIUM-SEED refused: ${(e as Error).message}. Public-safe material only.`, { refused: true }, callback);
    }
    const observation = { ts: utcnow(), source: 'elizaos', event: 'observe', payload: text };
    return reply(`ZINIUM-SEED observed: ${JSON.stringify(observation)}`, { observation }, callback);
  },
  examples: [[
    { name: '{{user}}', content: { text: 'ZINIUM observe: the feed just listed three new tokens' } },
    { name: '{{agent}}', content: { text: 'ZINIUM-SEED observed: {...}', actions: ['ZINIUM_OBSERVE'] } },
  ]],
};

export const ziniumReportAction: Action = {
  name: 'ZINIUM_REPORT',
  similes: ['ZINIUM REPORT', 'SEED REPORT'],
  description: 'ZINIUM-SEED Report: turn an observation into a plain report.',
  validate: async () => true,
  handler: async (runtime, message, _state, _options, callback) => {
    const text = (message.content.text || '').trim();
    try {
      guard(text);
    } catch (e) {
      return reply(`ZINIUM-SEED refused: ${(e as Error).message}. Public-safe material only.`, { refused: true }, callback);
    }
    return reply(`ZINIUM-SEED report: elizaos observed — ${text}`, { report: text }, callback);
  },
  examples: [[
    { name: '{{user}}', content: { text: 'ZINIUM report: what did the seed observe?' } },
    { name: '{{agent}}', content: { text: 'ZINIUM-SEED report: ...', actions: ['ZINIUM_REPORT'] } },
  ]],
};

export const ziniumLearnAction: Action = {
  name: 'ZINIUM_LEARN',
  similes: ['ZINIUM LEARN', 'SEED LEARN'],
  description: 'ZINIUM-SEED Learn: keep a lesson stated in plain words. No scores are invented.',
  validate: async () => true,
  handler: async (runtime, message, _state, _options, callback) => {
    const lesson = (message.content.text || '').replace(/^zinium learn:\s*/i, '').trim();
    try {
      guard(lesson);
    } catch (e) {
      return reply(`ZINIUM-SEED refused: ${(e as Error).message}. Public-safe material only.`, { refused: true }, callback);
    }
    if (!lesson) {
      return reply('ZINIUM-SEED: give me the lesson in plain words after "ZINIUM learn:".', { refused: false }, callback);
    }
    const record = { ts: utcnow(), source: 'elizaos', event: 'learn', lesson };
    return reply(`ZINIUM-SEED learned: ${JSON.stringify(record)}`, { lesson: record }, callback);
  },
  examples: [[
    { name: '{{user}}', content: { text: 'ZINIUM learn: tokens with no metadata and one-way tape keep failing the live gate' } },
    { name: '{{agent}}', content: { text: 'ZINIUM-SEED learned: {...}', actions: ['ZINIUM_LEARN'] } },
  ]],
};

export const ziniumIndexAction: Action = {
  name: 'ZINIUM_INDEX',
  similes: ['ZINIUM INDEX', 'SEED INDEX'],
  description: 'ZINIUM-SEED Index: append a lesson as a hash-chained block into the ZENIUM memory chain.',
  validate: async () => true,
  handler: async (runtime, message, _state, _options, callback) => {
    const lessonText = (message.content.text || '').replace(/^zinium index:\s*/i, '').trim();
    try {
      guard(lessonText);
    } catch (e) {
      return reply(`ZINIUM-SEED refused: ${(e as Error).message}. Public-safe material only.`, { refused: true }, callback);
    }
    if (!lessonText) {
      return reply('ZINIUM-SEED: give me the lesson in plain words after "ZINIUM index:".', { refused: false }, callback);
    }
    const record = { ts: utcnow(), source: 'elizaos', event: 'index', lesson: lessonText };
    const { block, persisted } = indexLesson(record, runtime);
    const suffix = persisted
      ? 'indexed into the ZENIUM chain.'
      : 'block computed but NOT persisted: no ZINIUM_LEDGER_DIR is set. Set it to index for real.';
    return reply(`ZINIUM-SEED ${suffix} Block: ${JSON.stringify(block)}`, { block, persisted }, callback);
  },
  examples: [[
    { name: '{{user}}', content: { text: 'ZINIUM index: tokens with no metadata and one-way tape keep failing the live gate' } },
    { name: '{{agent}}', content: { text: 'ZINIUM-SEED indexed into the ZENIUM chain. Block: {...}', actions: ['ZINIUM_INDEX'] } },
  ]],
};

export const ziniumRequestAction: Action = {
  name: 'ZINIUM_REQUEST',
  similes: ['ZINIUM REQUEST', 'SEED REQUEST'],
  description: 'ZINIUM-SEED Send side: request computational input as an agent. The seed never writes into another AI; the outside source decides what to return.',
  validate: async () => true,
  handler: async (runtime, message, _state, _options, callback) => {
    const task = (message.content.text || '').replace(/^zinium request:\s*/i, '').trim();
    try {
      guard(task);
    } catch (e) {
      return reply(`ZINIUM-SEED refused: ${(e as Error).message}. Public-safe material only.`, { refused: true }, callback);
    }
    if (!task) {
      return reply('ZINIUM-SEED: describe the computation you want requested after "ZINIUM request:".', { refused: false }, callback);
    }
    const envelopeId = crypto.createHash('sha256').update(utcnow() + task).digest('hex').slice(0, 16);
    const envelope = { envelope_id: envelopeId, ts: utcnow(), task, reply_via: 'ZENIUM index (ZINIUM_INDEX)' };
    return reply(`ZINIUM-SEED request envelope: ${JSON.stringify(envelope)}`, { envelope }, callback);
  },
  examples: [[
    { name: '{{user}}', content: { text: 'ZINIUM request: summarize the newest Base launches' } },
    { name: '{{agent}}', content: { text: 'ZINIUM-SEED request envelope: {...}', actions: ['ZINIUM_REQUEST'] } },
  ]],
};
