const RISK_LEVELS = ['High', 'Medium', 'Low'];

const RISK_COMBINATIONS = {
  'High-High': 'High',
  'High-Medium': 'High',
  'High-Low': 'Medium',
  'Medium-High': 'Medium',
  'Medium-Medium': 'Medium',
  'Medium-Low': 'Low',
  'Low-High': 'Medium',
  'Low-Medium': 'Low',
  'Low-Low': 'Low'
};

const CONFIDENCE_BY_RISK = { High: 90, Medium: 75, Low: 50 };

const STATISTICAL_BUCKETS = [1, 0.5, 0.3, 0.1, 0.08, 0.06, 0.05, 0.04, 0.03, 0.02, 0.01, 0.005];
const STATISTICAL_TABLE = {
  High: [5, 5, 8, 24, 31, 42, 49, 62, 83, 124, 250, 500],
  Medium: [3, 3, 5, 15, 19, 25, 30, 37, 50, 74, 148, 297],
  Low: [2, 2, 3, 8, 10, 13, 15, 18, 25, 37, 73, 147]
};

const HAPHAZARD_BUCKETS = [0.5, 0.3, 0.1, 0.08, 0.06, 0.05, 0.04, 0.03, 0.02, 0.01, 0.005];
const HAPHAZARD_TABLE = {
  High: [6, 10, 29, 37, 50, 59, 74, 100, 149, 300, 600],
  Medium: [4, 6, 18, 23, 30, 36, 44, 60, 89, 178, 356],
  Low: [2, 4, 10, 12, 16, 18, 22, 30, 44, 88, 176]
};

function resolveAuditRisk(inherentRisk, controlRisk) {
  const key = `${inherentRisk}-${controlRisk}`;
  const resultingAuditRisk = RISK_COMBINATIONS[key];
  if (!resultingAuditRisk) throw new Error('invalid risk combination');
  return { resultingAuditRisk, confidenceLevel: CONFIDENCE_BY_RISK[resultingAuditRisk] };
}

function interpolateSampleSize(buckets, sizes, ratio) {
  if (ratio >= buckets[0]) return sizes[0];
  if (ratio <= buckets[buckets.length - 1]) return sizes[sizes.length - 1];
  for (let i = 0; i < buckets.length - 1; i++) {
    const upper = buckets[i];
    const lower = buckets[i + 1];
    if (ratio <= upper && ratio >= lower) {
      const upperSize = sizes[i];
      const lowerSize = sizes[i + 1];
      const position = (upper - ratio) / (upper - lower);
      return upperSize + position * (lowerSize - upperSize);
    }
  }
  return sizes[sizes.length - 1];
}

function calculateSampleSize(params) {
  const {
    performanceMateriality,
    inherentRisk,
    controlRisk,
    totalPopulationSize,
    testingThresholdPercent,
    keyItemsCount,
    method
  } = params;

  const { resultingAuditRisk, confidenceLevel } = resolveAuditRisk(inherentRisk, controlRisk);

  const pm = Number(performanceMateriality);
  const totalPopulation = Number(totalPopulationSize);
  const thresholdPercent = Number(testingThresholdPercent) / 100;
  const keyItems = Number(keyItemsCount) || 0;

  const testingThresholdValue = pm * thresholdPercent;
  const balancePopulationSize = Math.max(totalPopulation - keyItems, 0);
  const tmPercent = balancePopulationSize > 0 ? pm / balancePopulationSize : 0;

  let statisticalSampleCount = 0;
  if (balancePopulationSize > 0 && tmPercent < 1) {
    const buckets = method === 'haphazard' ? HAPHAZARD_BUCKETS : STATISTICAL_BUCKETS;
    const table = method === 'haphazard' ? HAPHAZARD_TABLE : STATISTICAL_TABLE;
    statisticalSampleCount = Math.round(interpolateSampleSize(buckets, table[resultingAuditRisk], tmPercent));
    statisticalSampleCount = Math.min(statisticalSampleCount, balancePopulationSize);
  }

  const totalSamples = keyItems + statisticalSampleCount;

  return {
    resultingAuditRisk,
    confidenceLevel,
    testingThresholdValue: Math.round(testingThresholdValue),
    balancePopulationSize,
    tmPercent: Number((tmPercent * 100).toFixed(2)),
    statisticalSampleCount,
    keyItemsCount: keyItems,
    totalSamples
  };
}

module.exports = { RISK_LEVELS, resolveAuditRisk, calculateSampleSize };
