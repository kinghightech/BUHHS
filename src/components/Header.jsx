import ShieldLogo from './ShieldLogo'
import Icon from './Icon'
import { useLanguage } from '../i18n/LanguageContext'

export default function Header({ zipData, cityData, countryCode, flag, onLanguageSwitch }) {
    const { t } = useLanguage()

    return (
        <header className="dg-header">
            <div className="dg-header-top" />
            <div className="dg-header-content">
                <div className="dg-brand">
                    <div className="dg-brand-icon">
                        <ShieldLogo size={20} />
                    </div>
                    <div className="dg-brand-text">
                        <h1>Custos</h1>
                        <p>{t('app.subtitle')}</p>
                    </div>
                </div>

                <div className="dg-header-actions">
                    {zipData && cityData && (
                        <div className="dg-location-chip">
                            <div className="dg-location-indicator" />
                            <div className="dg-location-data">
                                <div className="dg-location-zip">
                                    {t('app.zipLabel', { zip: zipData.zip })}
                                </div>
                                <div className="dg-location-city">
                                    {zipData.city}, {zipData.state}
                                </div>
                                <div className="dg-location-risk">
                                    {cityData.riskRating}
                                </div>
                            </div>
                        </div>
                    )}

                    <button className="dg-lang-btn" onClick={onLanguageSwitch} title={t('app.langSwitcher.tooltip')}>
                        {countryCode ? (
                            <img
                                src={`https://flagcdn.com/w40/${countryCode}.png`}
                                srcSet={`https://flagcdn.com/w80/${countryCode}.png 2x`}
                                alt={flag}
                            />
                        ) : (
                            <Icon name="globe" size={20} />
                        )}
                    </button>
                </div>
            </div>
        </header>
    )
}
