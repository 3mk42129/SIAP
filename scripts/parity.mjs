import fs from "fs";
import { loadModel, decisionFunction, predict } from "../src/lib/classifier.js";
const model = loadModel(JSON.parse(fs.readFileSync("public/model/siap_model.json", "utf8")));
const ref = JSON.parse(fs.readFileSync("scripts/ref.json", "utf8"));
let agree = 0, maxErr = 0; const bad = [];
const t0 = Date.now();
ref.texts.forEach((t, i) => {
  const d = decisionFunction(model, t);
  d.forEach((x, c) => { maxErr = Math.max(maxErr, Math.abs(x - ref.dec[i][c])); });
  const p = predict(model, t).category;
  if (p === ref.pred[i]) agree++; else bad.push([t.slice(0, 80), p, ref.pred[i]]);
});
console.log(`agree ${agree}/${ref.texts.length}, max |decision diff| ${maxErr.toFixed(5)}, ${((Date.now()-t0)/ref.texts.length).toFixed(2)} ms/text`);
console.log(bad.slice(0, 10));
