const { calculateSampleSize } = require('../utils/samplingMethodology');

function randomSample(populationSize, sampleSize) {
  const pool = [];
  for (let i = 1; i <= populationSize; i++) pool.push(i);
  const picked = [];
  for (let i = 0; i < sampleSize && pool.length > 0; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(idx, 1)[0]);
  }
  return picked.sort((a, b) => a - b);
}

function systematicSample(populationSize, sampleSize) {
  const interval = Math.floor(populationSize / sampleSize) || 1;
  const offset = Math.floor(Math.random() * interval) + 1;
  const picked = [];
  let current = offset;
  while (picked.length < sampleSize && current <= populationSize) {
    picked.push(current);
    current += interval;
  }
  return picked;
}

function formatSampleNumbers(numbers) {
  const width = String(numbers.length ? Math.max(...numbers) : 0).length || 3;
  return numbers.map((n) => "#" + String(n).padStart(Math.max(width, 3), "0"));
}

async function generateSamples(req, res) {
  const { populationSize, sampleSize, method } = req.body;
  const pop = Number(populationSize);
  const size = Number(sampleSize);
  if (!pop || !size || size > pop) {
    return res
      .status(400)
      .json({ message: "invalid population or sample size" });
  }
  const numbers =
    method === "systematic"
      ? systematicSample(pop, size)
      : randomSample(pop, size);
  res.json({ sampleNumbers: formatSampleNumbers(numbers) });
}

async function calculateSize(req, res) {
  try {
    const result = calculateSampleSize(req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

module.exports = { generateSamples, calculateSize };
