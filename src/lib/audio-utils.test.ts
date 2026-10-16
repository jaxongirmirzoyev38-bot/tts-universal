import test from 'node:test';
import assert from 'node:assert/strict';
import { createWavHeader, generateSyntheticSpeechWav } from './audio-utils.ts';

test('createWavHeader produces valid 44-byte RIFF WAVE header', () => {
  const header = createWavHeader(48000, 24000, 1, 16);
  assert.equal(header.byteLength, 44);
  const view = new DataView(header);
  
  // Verify RIFF signature
  const r = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3));
  assert.equal(r, 'RIFF');
  
  // Verify WAVE signature
  const w = String.fromCharCode(view.getUint8(8), view.getUint8(9), view.getUint8(10), view.getUint8(11));
  assert.equal(w, 'WAVE');

  // Verify sample rate 24000
  assert.equal(view.getUint32(24, true), 24000);
});

test('generateSyntheticSpeechWav creates non-empty base64 audio and positive duration', () => {
  const res = generateSyntheticSpeechWav('Salom dunyo', { speed: 1.0, gender: 'male' });
  assert.ok(res.base64.length > 500);
  assert.ok(res.duration > 0.5);
});
