import Icon from './Icon'

const CONTENT = {
  disaster: {
    icon: 'warning',
    label: 'Educational Tool Only',
    body:
      'Risk estimates are based on FEMA NRI data and statistical models. Results are for informational purposes only and do not constitute professional financial, insurance, or emergency management advice.',
  },
  health: {
    icon: 'stethoscope',
    label: 'Not Medical Advice',
    body:
      'Health risk estimates are based on statistical population data and self-reported factors. Results do not constitute medical diagnosis or advice. Consult a licensed healthcare professional for personal health decisions.',
  },
}

export default function DisclaimerBanner({ position = 'top', type = 'disaster' }) {
  const { icon, label, body } = CONTENT[type] ?? CONTENT.disaster

  return (
    <div
      style={{
        background: 'rgba(212,160,23,0.08)',
        border: '1px solid rgba(212,160,23,0.30)',
        borderRadius: '0.5rem',
        padding: '0.75rem 1.25rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        marginBottom: position === 'top' ? '1rem' : 0,
        marginTop: position === 'bottom' ? '1rem' : 0,
      }}
    >
      <Icon name={icon} size={20} style={{ flexShrink: 0 }} />
      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--ds-text-secondary)', lineHeight: 1.6 }}>
        <strong>{label}</strong>
        {' — '}
        {body}
      </p>
    </div>
  )
}
