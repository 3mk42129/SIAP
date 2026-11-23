import { useEffect, useState } from "react";
import { MODEL_URL } from "../config.js";
import { loadModel } from "./classifier.js";

// The model (~2.7 MB, ~1.4 MB gzipped) is fetched once and shared by every page.
let modelPromise = null;
let loadedModel = null;

export function getModel() {
  if (!modelPromise) {
    modelPromise = fetch(MODEL_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`Model download failed (${res.status})`);
        return res.json();
      })
      .then((json) => { loadedModel = loadModel(json); return loadedModel; })
      .catch((err) => { modelPromise = null; throw err; });
  }
  return modelPromise;
}

export function useModel() {
  const [state, setState] = useState(() => ({ model: loadedModel, error: null }));
  useEffect(() => {
    // Always subscribe: the model can finish loading between the first render and this effect
    // (e.g. when the page is opened directly), so never skip just because it's already loaded.
    let alive = true;
    getModel()
      .then((model) => alive && setState((s) => (s.model === model ? s : { model, error: null })))
      .catch((error) => alive && setState({ model: null, error }));
    return () => { alive = false; };
  }, []);
  return state;
}
