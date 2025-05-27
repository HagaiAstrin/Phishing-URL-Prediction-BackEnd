import { extractAllFeatures } from './feature_extractor.js';
import { predict } from './model.js';

document.getElementById('checkBtn').addEventListener('click', async () => {
  const url = document.getElementById('urlInput').value;
  const statusEl = document.getElementById('status');
  try {
    const features = extractAllFeatures(url);
    const result = await predict(features);
    statusEl.textContent = result;
    statusEl.style.color = result === 'phishing' ? 'red' : result === 'safe' ? 'green' : 'gray';
  } catch (err) {
    console.error(err);
    statusEl.textContent = 'Error';
    statusEl.style.color = 'black';
  }
});
