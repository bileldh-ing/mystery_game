#!/usr/bin/env node
/* Story validator + automated playthrough simulator.
 *  - checks every label / clue / photo / note / article / puzzle reference
 *  - plays the game thousands of times with random choices (puzzles auto-solved)
 *  - reports which endings were reached and any dead ends
 * Usage: node scripts/validate-story.js
 */
const fs = require('fs');
const path = require('path');
const Module = require('module');
const ts = require('typescript');

// Asset requires -> numbers; TS files -> transpiled on the fly.
for (const ext of ['.jpg', '.png', '.wav', '.mp3']) Module._extensions[ext] = (m) => { m.exports = 1; };
Module._extensions['.ts'] = Module._extensions['.tsx'] = (m, filename) => {
  const src = fs.readFileSync(filename, 'utf8');
  const out = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.React, esModuleInterop: true },
    fileName: filename,
  }).outputText;
  m._compile(out, filename);
};
const origResolve = Module._resolveFilename;
Module._resolveFilename = function (req, parent, ...rest) {
  try { return origResolve.call(this, req, parent, ...rest); } catch (e) {
    for (const ext of ['.ts', '.tsx', '/index.ts']) {
      try { return origResolve.call(this, req + ext, parent, ...rest); } catch {}
    }
    throw e;
  }
};

const root = path.join(__dirname, '..', 'src');
const content = require(path.join(root, 'content', 'index.ts'));
const engine = require(path.join(root, 'game', 'engine.ts'));
const { CHAPTERS, CLUES, PHOTOS, NOTES, ARTICLES, PUZZLES, IVY_THREADS } = content;

let errors = 0;
const err = (m) => { errors++; console.log('  ✗ ' + m); };

console.log('Static checks');
for (const ch of CHAPTERS) {
  const labels = new Set(ch.nodes.filter((n) => n.k === 'label').map((n) => n.id));
  const refLabel = (l, where) => { if (!labels.has(l)) err(`ch${ch.n}: missing label "${l}" (${where})`); };
  ch.nodes.forEach((n, i) => {
    const w = `node ${i}`;
    if (n.k === 'goto') refLabel(n.to, w);
    if (n.k === 'if') { refLabel(n.then, w); if (n.else) refLabel(n.else, w); }
    if (n.k === 'choice') n.options.forEach((o) => o.goto && refLabel(o.goto, w));
    if (n.k === 'unlock') {
      if (n.clue && !CLUES[n.clue]) err(`ch${ch.n} ${w}: unknown clue ${n.clue}`);
      if (n.photo && !PHOTOS[n.photo]) err(`ch${ch.n} ${w}: unknown photo ${n.photo}`);
      if (n.note && !NOTES[n.note]) err(`ch${ch.n} ${w}: unknown note ${n.note}`);
      if (n.article && !ARTICLES[n.article]) err(`ch${ch.n} ${w}: unknown article ${n.article}`);
      if (n.ivyThread && !IVY_THREADS[n.ivyThread]) err(`ch${ch.n} ${w}: unknown ivy thread ${n.ivyThread}`);
    }
    if (n.k === 'msg' && n.photo && !PHOTOS[n.photo]) err(`ch${ch.n} ${w}: unknown photo ${n.photo}`);
    if (n.k === 'puzzle' && !PUZZLES[n.id]) err(`ch${ch.n} ${w}: unknown puzzle ${n.id}`);
  });
}
for (const p of Object.values(PUZZLES)) {
  if (p.onSolve?.clue && !CLUES[p.onSolve.clue]) err(`puzzle ${p.id}: unknown clue ${p.onSolve.clue}`);
  if (p.kind.type === 'photo') p.kind.options.forEach((o) => !PHOTOS[o] && err(`puzzle ${p.id}: unknown photo ${o}`));
}
for (const c of Object.values(CLUES)) if (c.photo && !PHOTOS[c.photo]) err(`clue ${c.id}: unknown photo ${c.photo}`);
console.log(errors ? `  ${errors} problem(s)` : '  ✓ all references resolve');

// ---------- simulation ----------
console.log('\nSimulated playthroughs');
const settings = { speed: 'instant', sound: false, haptics: false, notifications: false };
const results = {};
var words = 0; let msgs = 0, maxMsgs = 0, totalMs = 0;
for (const ch of CHAPTERS) for (const n of ch.nodes) { if (n.k === 'msg' && n.text) words += n.text.split(/\s+/).length; if (n.k === 'choice') n.options.forEach((o) => (words += (o.say || o.text).split(/\s+/).length)); }
const RUNS = 3000;
for (let run = 0; run < RUNS; run++) {
  let s = engine.initialCore();
  s.cursor = { ch: 1, i: 0 }; s.awaitingChapter = null;
  let now = 0, steps = 0, ended = null, runMsgs = 0, realMs = 0;
  const normal = { ...settings, speed: 'normal' };
  while (steps++ < 20000) {
    if (!s.cursor) {
      if (s.awaitingChapter) { s = { ...s, cursor: { ch: s.awaitingChapter, i: 0 }, awaitingChapter: null }; continue; }
      break;
    }
    const node = engine.nodeAt(s.cursor);
    now += 5000;
    const r = engine.tick(s, now, settings, null);
    s = r.state;
    for (const e of r.events) {
      if (e.type === 'message') { runMsgs++; realMs += engine.nodeDuration({ k: 'msg', t: e.thread, from: e.msg.from, text: e.msg.text, photo: e.msg.photo }, 'normal').total; }
      if (e.type === 'ending') ended = e.id;
    }
    if (ended) break;
    const n = engine.nodeAt(s.cursor);
    if (!n) continue;
    if (n.k === 'choice') {
      const vis = n.options.filter((o) => !o.requires || engine.evalCond(o.requires, s));
      s = engine.choose(s, Math.floor(Math.random() * vis.length), now);
      realMs += 4000; // reading + deciding
    } else if (n.k === 'puzzle') {
      const p = PUZZLES[n.id];
      const solved = { ...s.solved, [n.id]: true };
      const flags = { ...s.flags };
      let clues = s.clues;
      if (p.kind.type === 'choice' && p.kind.oneShot) flags[p.kind.oneShot.flag] = Math.random() < 0.5;
      if (p.onSolve?.set) Object.assign(flags, p.onSolve.set);
      if (p.onSolve?.clue && !clues.includes(p.onSolve.clue)) clues = [...clues, p.onSolve.clue];
      s = { ...s, solved, flags, clues, anchor: now, waitUntil: null };
      realMs += 90000; // ~1.5 min per puzzle
    }
  }
  if (!ended) { err(`run ${run}: no ending reached (cursor ${JSON.stringify(s.cursor)})`); break; }
  results[ended] = (results[ended] || 0) + 1;
  msgs += runMsgs; maxMsgs = Math.max(maxMsgs, runMsgs); totalMs += realMs;
}
console.log('  endings reached:', results);
console.log(`  avg messages per playthrough: ${Math.round(msgs / RUNS)} (max ${maxMsgs})`);
console.log(`  words of chat script (all branches): ~${words}`);
console.log(`  estimated play time at real-time speed: ~${Math.round(totalMs / RUNS / 60000)} min (+ reading notes/articles)`);
for (const e of ['bad', 'good', 'true']) if (!results[e]) err(`ending "${e}" never reached`);
console.log(errors ? `\n${errors} problem(s) found` : '\n✓ story OK');
process.exit(errors ? 1 : 0);
