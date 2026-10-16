import test from 'node:test';
import assert from 'node:assert/strict';
import { romanizeText, phonemizeToIPA, runUniversalG2P } from './g2p.ts';

test('Uzbek Cyrillic to Latin romanization', () => {
  const cyr = 'Салом дунё';
  const lat = romanizeText(cyr, 'uz');
  assert.equal(lat, 'Salom dunyo');
});

test('Uzbek specific digraphs romanization: ў, ғ, қ, ҳ', () => {
  const cyr = 'Ўзбекистон қўшиғи';
  const lat = romanizeText(cyr, 'uz');
  assert.equal(lat, "O'zbekiston qo'shig'i");
});

test('Russian Cyrillic romanization', () => {
  const ru = 'Привет мир';
  const lat = romanizeText(ru, 'ru');
  assert.equal(lat, 'Privet mir');
});

test('Phonemize Uzbek Latin to IPA', () => {
  const ipa = phonemizeToIPA('Salom', 'uz');
  assert.match(ipa, /\/s.*l.*m\//);
});

test('Universal G2P pipeline returns valid stats and tokens', () => {
  const result = runUniversalG2P("O'zbekiston kelajagi buyuk davlat", 'uz');
  assert.equal(result.tokens.length, 4);
  assert.ok(result.stats.vowels > 0);
  assert.ok(result.stats.consonants > 0);
  assert.ok(result.ipa.length > 0);
});
