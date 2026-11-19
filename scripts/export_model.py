# Exports siap_classifier.joblib to public/model/siap_model.json for the web app,
# plus scripts/ref.json (Python predictions) used by `npm run test:model`.
# Usage (from the project root):  python scripts/export_model.py path/to/siap_classifier.joblib path/to/combined_dataset_bilingual_full.csv
import sys, joblib, json, base64, numpy as np, pandas as pd
MODEL = sys.argv[1] if len(sys.argv) > 1 else 'siap_classifier.joblib'
DATA = sys.argv[2] if len(sys.argv) > 2 else 'combined_dataset_bilingual_full.csv'
m = joblib.load(MODEL)
fu = m.named_steps['features']; clf = m.named_steps['clf']
out = {"classes": clf.classes_.tolist(), "vectorizers": []}
offset = 0
for name, v in fu.transformer_list:
    vocab = sorted(v.vocabulary_.items(), key=lambda kv: kv[1])
    terms = [t for t, _ in vocab]
    out["vectorizers"].append({
        "name": name, "analyzer": v.analyzer, "ngram": list(v.ngram_range),
        "terms": terms,
        "idf": base64.b64encode(v.idf_.astype('<f4').tobytes()).decode(),
    })
    offset += len(terms)
coef = clf.coef_.astype(np.float64)
scale = np.abs(coef).max(1) / 32767.0
q = np.round(coef / scale[:, None]).astype('<i2')
out["coef"] = base64.b64encode(q.tobytes()).decode()
out["coefScale"] = scale.tolist()
out["intercept"] = clf.intercept_.tolist()
out["nFeatures"] = int(coef.shape[1])
json.dump(out, open('public/model/siap_model.json', 'w'), ensure_ascii=False, separators=(',', ':'))

# reference predictions for the parity test
df = pd.read_csv(DATA)
texts = df['Reports'].astype(str).str.strip().drop_duplicates().tolist()
extra = ["Someone keeps harassing me in the dorm", "Wifi di perpustakaan mati terus sejak minggu lalu!!",
         "Beasiswa saya belum cair padahal sudah 2 bulan", "The canteen food gave me food poisoning",
         "Café ñandú — naïve test 123 ___ x"]
texts += extra
pred = m.predict(texts).tolist()
dec = m.decision_function(texts)
json.dump({"texts": texts, "pred": pred, "dec": dec.round(6).tolist()}, open('scripts/ref.json', 'w'), ensure_ascii=False)
print(len(texts))
