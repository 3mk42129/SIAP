// SIAP complaint classifier — JavaScript port of the scikit-learn pipeline
// FeatureUnion(word TF-IDF 1-2gram + char_wb TF-IDF 2-5gram) -> LinearSVC.
// The weights are exported from siap_classifier.joblib by export_model.py.

function b64ToBytes(b64) {
  if (typeof atob === "function") {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }
  return new Uint8Array(Buffer.from(b64, "base64"));
}

// Python's (?u)\b[^\W\d_]{2,}\b : runs of 2+ letters bounded by non-word characters.
const WORD_TOKEN = /(?<![\p{L}\p{M}\p{N}_])[\p{L}\p{M}]{2,}(?![\p{L}\p{M}\p{N}_])/gu;
const WHITESPACE = /[\s\u001c-\u001f\u0085]+/u;

function wordNgrams(text, [minN, maxN]) {
  const tokens = text.toLowerCase().match(WORD_TOKEN) || [];
  const grams = [];
  for (let n = minN; n <= maxN; n += 1) {
    for (let i = 0; i + n <= tokens.length; i += 1) grams.push(tokens.slice(i, i + n).join(" "));
  }
  return grams;
}

// Mirrors sklearn's _char_wb_ngrams.
function charWbNgrams(text, [minN, maxN]) {
  const grams = [];
  for (const word of text.toLowerCase().split(WHITESPACE)) {
    if (!word) continue;
    const chars = Array.from(` ${word} `);
    for (let n = minN; n <= maxN; n += 1) {
      let offset = 0;
      grams.push(chars.slice(offset, offset + n).join(""));
      while (offset + n < chars.length) {
        offset += 1;
        grams.push(chars.slice(offset, offset + n).join(""));
      }
      if (offset === 0) break;
    }
  }
  return grams;
}

export function loadModel(json) {
  const vectorizers = json.vectorizers.map((v) => {
    const idfBytes = b64ToBytes(v.idf);
    return {
      analyzer: v.analyzer,
      ngram: v.ngram,
      index: new Map(v.terms.map((term, i) => [term, i])),
      idf: new Float32Array(idfBytes.buffer, idfBytes.byteOffset, idfBytes.byteLength / 4),
    };
  });
  const coefBytes = b64ToBytes(json.coef);
  const coef = new Int16Array(coefBytes.buffer, coefBytes.byteOffset, coefBytes.byteLength / 2);
  return { classes: json.classes, vectorizers, coef, scale: json.coefScale, intercept: json.intercept, nFeatures: json.nFeatures };
}

export function decisionFunction(model, text) {
  const { classes, vectorizers, coef, scale, intercept, nFeatures } = model;
  const scores = classes.map(() => 0);
  let offset = 0;
  for (const v of vectorizers) {
    const grams = v.analyzer === "char_wb" ? charWbNgrams(text, v.ngram) : wordNgrams(text, v.ngram);
    const counts = new Map();
    for (const g of grams) {
      const idx = v.index.get(g);
      if (idx !== undefined) counts.set(idx, (counts.get(idx) || 0) + 1);
    }
    const weights = [];
    let norm = 0;
    for (const [idx, tf] of counts) {
      const w = (1 + Math.log(tf)) * v.idf[idx];
      weights.push([idx, w]);
      norm += w * w;
    }
    norm = Math.sqrt(norm);
    if (norm > 0) {
      for (const [idx, w] of weights) {
        const value = w / norm;
        const col = offset + idx;
        for (let c = 0; c < classes.length; c += 1) scores[c] += value * coef[c * nFeatures + col] * scale[c];
      }
    }
    offset += v.index.size;
  }
  return scores.map((s, c) => s + intercept[c]);
}

export function predict(model, text) {
  const scores = decisionFunction(model, text);
  let best = 0;
  for (let c = 1; c < scores.length; c += 1) if (scores[c] > scores[best]) best = c;
  // softmax over SVM margins — a rough confidence for display only
  const exps = scores.map((s) => Math.exp(3 * (s - scores[best])));
  const total = exps.reduce((a, b) => a + b, 0);
  return { category: model.classes[best], confidence: exps[best] / total, scores };
}
