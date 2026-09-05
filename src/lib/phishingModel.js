let modelPromise;

function cleanText(text) {
  return String(text)
    .toLowerCase()
    .replace(/http\S+/g, " ")
    .replace(/\S+@\S+/g, " ")
    .replace(/[^a-zA-Z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sigmoid(value) {
  return 1 / (1 + Math.exp(-Math.max(-60, Math.min(60, value))));
}

async function loadModel() {
  if (!modelPromise) {
    modelPromise = fetch("/phishing-model.json").then((response) => {
      if (!response.ok) throw new Error("The browser phishing model could not be loaded.");
      return response.json();
    });
  }
  return modelPromise;
}

export async function analyzePhishingModel(text) {
  const model = await loadModel();
  const tokens = cleanText(text).match(/[a-zA-Z]{2,}/g) || [];
  const stopWords = new Set(model.stopWords);
  const counts = new Map();
  tokens.forEach((token) => {
    const term = token.toLowerCase();
    if (!stopWords.has(term) && model.vocabulary[term] !== undefined) {
      const index = model.vocabulary[term];
      counts.set(index, (counts.get(index) || 0) + 1);
    }
  });

  const norm = Math.sqrt([...counts].reduce((sum, [index, count]) => sum + (count * model.idf[index]) ** 2, 0)) || 1;
  const hidden = model.intercepts[0].slice();
  for (const [index, count] of counts) {
    const value = (count * model.idf[index]) / norm;
    const weights = model.coefs[0][index];
    for (let unit = 0; unit < hidden.length; unit += 1) hidden[unit] += value * weights[unit];
  }
  for (let unit = 0; unit < hidden.length; unit += 1) hidden[unit] = Math.max(0, hidden[unit]);

  const outputWeights = model.coefs[1];
  const output = model.intercepts[1][0] + hidden.reduce((sum, value, index) => sum + value * outputWeights[index][0], 0);
  const phishingProbability = sigmoid(output) * 100;
  return {
    prediction: phishingProbability >= 50 ? "phishing" : "legitimate",
    phishingProbability: Number(phishingProbability.toFixed(2)),
    model: "MLPClassifier + TF-IDF (browser)",
  };
}
