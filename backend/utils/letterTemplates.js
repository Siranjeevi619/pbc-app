const reasonLabels = {
  company_policy: 'Company policy restricts sharing',
  legal_restriction: 'Legal / regulatory restriction',
  security_concern: 'Data security / confidentiality concern',
  not_available: 'Data not available'
};

function buildMrl(items) {
  const lines = items.map((item, i) => {
    const reason = reasonLabels[item.reasonCode] || item.reasonCode;
    return `${i + 1}. ${item.name} — ${reason}. ${item.justification}`;
  });
  return (
    '...with respect to the following items requested during the audit, management represents that these could not be made available:\n\n' +
    lines.join('\n')
  );
}

function buildManagementLetter(items) {
  const lines = items.map((item, i) => {
    const reasonText = item.status === 'cannot_provide'
      ? `Reason: ${reasonLabels[item.reasonCode] || item.reasonCode}.`
      : `Reason: item rejected on review — ${item.reviewNote || 'no note provided'}.`;
    return `${i + 1}. Observation — ${item.name}\n   Could not be obtained. ${reasonText}\n   Recommendation: Review internal process for this item and address the underlying constraint before next engagement.`;
  });
  return lines.join('\n\n');
}

module.exports = { buildMrl, buildManagementLetter, reasonLabels };
