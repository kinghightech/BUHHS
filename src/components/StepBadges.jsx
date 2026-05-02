import { useLanguage } from '../i18n/LanguageContext'
import Icon from './Icon'

export default function StepBadges({ step1Done, step2Done, step3Active }) {
    const { t } = useLanguage()

    function getStepClass(stepNum) {
        if (stepNum === 1) {
            return step1Done ? 'done' : 'active'
        } else if (stepNum === 2) {
            return step1Done ? (step2Done ? 'done' : 'active') : 'inactive'
        } else {
            return step3Active ? 'active' : 'inactive'
        }
    }

    function getStepIcon(stepNum) {
        if (stepNum === 1 && step1Done) return <Icon name="check" size={14} />
        if (stepNum === 2 && step2Done) return <Icon name="check" size={14} />
        return stepNum
    }

    return (
        <div className="dg-steps">
            <div className={`dg-step-badge ${getStepClass(1)}`}>
                <div className="dg-step-badge-icon">
                    {getStepIcon(1)}
                </div>
                <span className="dg-step-label">{t('app.step1')}</span>
            </div>

            <span className="dg-step-sep">›</span>

            <div className={`dg-step-badge ${getStepClass(2)}`}>
                <div className="dg-step-badge-icon">
                    {getStepIcon(2)}
                </div>
                <span className="dg-step-label">{t('app.step2')}</span>
            </div>

            <span className="dg-step-sep">›</span>

            <div className={`dg-step-badge ${getStepClass(3)}`}>
                <div className="dg-step-badge-icon">
                    3
                </div>
                <span className="dg-step-label">{t('app.step3')}</span>
            </div>
        </div>
    )
}
