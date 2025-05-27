import { scaler } from './scaler.js';

function normalizeFeatures(rawFeatures) {
  return rawFeatures.map((val, i) => {
    const mean = scaler.mean[i];
    const std = scaler.scale[i];
    return std !== 0 ? (val - mean) / std : val;
  });
}
let modelData = null;

// ✅ Same feature order used during model training
export const FEATURE_NAMES = [
  "length_url", "length_hostname", "nb_dots", "nb_hyphens", "nb_at", "nb_qm", "nb_eq", "nb_underscore", "nb_percent", "nb_slash",
  "nb_www", "nb_com", "https_token", "ratio_digits_url", "ratio_digits_host", "tld_in_subdomain", "prefix_suffix", "random_domain",
  "shortening_service", "nb_redirection", "length_words_raw", "char_repeat", "shortest_words_raw", "shortest_word_host",
  "shortest_word_path", "longest_words_raw", "longest_word_host", "longest_word_path", "avg_words_raw", "avg_word_host",
  "avg_word_path", "phish_hints", "domain_in_brand", "suspecious_tld"
];

// Load the model once from extension assets
export async function loadModel() {
  if (!modelData) {
    const response = await fetch(chrome.runtime.getURL("xgb_model.json"));
    modelData = await response.json();
  }
  return modelData;
}

// Logistic sigmoid used in binary classification
function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

// Predict output from a single tree
function predictTree(tree, featureVector) {
  let nodeIndex = 0;
  while (true) {
    const left = tree.left_children[nodeIndex];
    const right = tree.right_children[nodeIndex];
    if (left === -1 && right === -1) {
      return tree.base_weights[nodeIndex];  // leaf node
    }
    const featureIdx = tree.split_indices[nodeIndex];
    const threshold = tree.split_conditions[nodeIndex];
    const featureVal = featureVector[featureIdx];
    nodeIndex = featureVal < threshold ? left : right;
  }
}

// Predict label using all trees in the model
export async function predict(features) {
  try {
    features = normalizeFeatures(features);
    const model = await loadModel();
    const trees = model.learner.gradient_booster.model.trees;
    const base_score = parseFloat(model.learner.attributes["base_score"] || "0.5");

    let score = base_score;
    for (const tree of trees) {
      const treeScore = predictTree(tree, features);
      score += treeScore;
    }

    const probability = sigmoid(score);

    // 🧠 Add these:
    console.log("🔍 Input features:", features);
    console.log("📊 Raw score:", score);
    console.log("🎯 Probability:", probability);

    
  if (probability > 0.85) {
    return `🛑 <strong class="phishing">Phishing</strong><br><small>${(probability * 100).toFixed(0)}% confidence</small>`;
  } else if (probability >= 0.7) {
    return `⚠️ <strong class="suspicious">Suspicious</strong><br><small>${(probability * 100).toFixed(0)}% phishing confidence</small>`;
  } else {
    return `✅ <strong class="legitimate">Safe</strong><br><small>Under 70% phishing then it's probably safe</small>`;
  }
  } catch (err) {
    console.error("Prediction error:", err);
    return "unknown";
  }
}

