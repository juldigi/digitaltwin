import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../frontend/src/omodos-status-embed.js', import.meta.url), 'utf8');

test('ambiguous SAP machine codes require an exact machine-name match', () => {
  assert.match(source, /const sameCodePeers\s*=\s*code\?state\.registry\.filter/);
  assert.match(source, /const payloadCodeRows\s*=\s*code\?state\.records\.filter/);
  assert.match(source, /const codeIsUnique\s*=\s*sameCodePeers\.length===1&&payloadCodeRows\.length===1/);
  assert.match(source, /else if\(name&&\(name===machineName\|\|name===short\)\)score=160/);
});

test('a conflicting explicit code cannot be overridden by a name alias', () => {
  assert.match(source, /An explicit different code must never be overridden by a fuzzy name match/);
  assert.match(source, /else if\(rowCode&&code&&rowCode!==code\)\{\s*\/\/ An explicit different code must never be overridden by a fuzzy name match\.\s*continue;/);
});

test('critical OMODOS label is styled as critical, not unknown', () => {
  assert.match(source, /critical\|kritikal/);
});
