/**
 * Export risk results to a CSV file.
 */
export function exportToCSV(city, inputs, results) {
  const fmt = (n) => n.toLocaleString('en-US', { maximumFractionDigits: 0 })
  const insuranceOffset = Math.min(inputs.insuranceCoverage, results.damage)

  const rows = [
    ['Custos – Risk Report'],
    [],
    ['City', city],
    [],
    ['--- Financial Inputs ---'],
    ['Home Value', `$${fmt(inputs.homeValue)}`],
    ['Household Annual Income', `$${fmt(inputs.income)}`],
    ['Car Value', `$${fmt(inputs.carValue)}`],
    ['Insurance Provider', inputs.insuranceProvider || 'N/A'],
    ['Insurance Coverage', `$${fmt(inputs.insuranceCoverage)}`],
    [],
    ['--- Risk Analysis ---'],
    ['Risk Score', results.riskScore.toFixed(2)],
    ['Risk Level', results.riskLevel],
    ['Disaster Probability', `${(results.probability * 100).toFixed(1)}%`],
    ['Preparedness', `${results.preparedness.toFixed(0)}%`],
    [],
    ['--- Financial Impact ---'],
    ['Estimated Damage', `$${fmt(results.damage)}`],
    ['Insurance Offset', `$${fmt(insuranceOffset)}`],
    ['Out-of-Pocket Cost', `$${fmt(results.outOfPocket)}`],
    ['Recommended Emergency Fund', `$${fmt(results.emergencyFund)}`],
    [],
    [
      'Disclaimer: These are estimates only and do not replace professional financial or insurance advice.',
    ],
  ]

  const csvContent = rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `Custos_${city.replace(/[, ]+/g, '_')}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
