import { useState, useMemo, useEffect } from 'react'
import MapSelector from './components/MapSelector'
import InputForm from './components/InputForm'
import RiskDashboard from './components/RiskDashboard'
import ResultsPanel from './components/ResultsPanel'
import Charts from './components/Charts'
import HazardPieChart from './components/HazardPieChart'
import LanguageSplash from './components/LanguageSplash'
import Header from './components/Header'
import Footer from './components/Footer'
import StepBadges from './components/StepBadges'
import { useNavigate } from 'react-router-dom'
import InsuranceAnalysis from './components/InsuranceAnalysis'
import { calculateAll, buildCityDataFromLocal } from './utils/calculator'
import Icon from './components/Icon'
import { useLanguage } from './i18n/LanguageContext'

const DEFAULT_INPUTS = {
  ownershipType: 'owner',
  homeValue: 0,
  income: 0,
  carValue: 0,
  insuranceProvider: '',
  homeInsuranceCoverage: 0,
  carInsuranceCoverage: 0,
  exposureFactor: 0.50,
  vulnerabilityFactor: 0.45,
}

localStorage.removeItem('ds_zipdata')
localStorage.removeItem('ds_inputs')
sessionStorage.removeItem('ds_appState')

export default function App({ embedded = false }) {
  const navigate = useNavigate()
  const { lang, setLang, t, dir, flag, countryCode } = useLanguage()

  const saved = JSON.parse(sessionStorage.getItem('ds_appState') || 'null')
  const [zipData, setZipData] = useState(saved?.zipData ?? null)
  const [mapCenter, setMapCenter] = useState(saved?.mapCenter ?? [37.8, -96])
  const [mapZoom, setMapZoom] = useState(saved?.mapZoom ?? 4)
  const [inputs, setInputs] = useState(saved?.inputs ?? DEFAULT_INPUTS)
  const [resultsVisible, setResultsVisible] = useState(saved?.resultsVisible ?? false)
  const [selectedHazardCode, setSelectedHazardCode] = useState(saved?.selectedHazardCode ?? null)
  const [selectedSeverityRating, setSelectedSeverityRating] = useState(saved?.selectedSeverityRating ?? null)

  useEffect(() => {
    sessionStorage.setItem('ds_appState', JSON.stringify({
      zipData, mapCenter, mapZoom, inputs, resultsVisible, selectedHazardCode, selectedSeverityRating,
    }))
  }, [zipData, mapCenter, mapZoom, inputs, resultsVisible, selectedHazardCode, selectedSeverityRating])

  const cityData = useMemo(() => buildCityDataFromLocal(zipData), [zipData])

  const selectedHazard = useMemo(
    () => (selectedHazardCode ? (zipData?.hazards?.find(h => h.code === selectedHazardCode) ?? null) : null),
    [selectedHazardCode, zipData]
  )

  const effectiveHazard = useMemo(() => {
    if (!selectedHazard) return null
    if (!selectedSeverityRating) return selectedHazard
    return { ...selectedHazard, rating: selectedSeverityRating, severity: null }
  }, [selectedHazard, selectedSeverityRating])

  const results = useMemo(
    () => (cityData && inputs.homeValue > 0 ? calculateAll(cityData, inputs, effectiveHazard) : null),
    [cityData, inputs, effectiveHazard]
  )

  // Show splash if no language selected (after all hooks)
  // Note: lang is never null since LanguageContext defaults to 'en', but guard kept for safety
  if (!lang && !embedded) return <LanguageSplash onSelect={setLang} />

  function handleZipResult(entry) {
    setZipData(entry)
    setMapCenter([entry.lat, entry.lng])
    setMapZoom(12)
    setResultsVisible(false)
    setSelectedHazardCode(null)
    setSelectedSeverityRating(null)
    if (entry.defaultHomeValue) {
      setInputs((prev) => ({ ...prev, homeValue: entry.defaultHomeValue }))
    }
  }

  function handleZipClear() {
    setZipData(null)
    setMapCenter([37.8, -96])
    setMapZoom(4)
    setResultsVisible(false)
    setSelectedHazardCode(null)
    setSelectedSeverityRating(null)
  }

  function handleHazardSelect(code) {
    if (code !== selectedHazardCode) setSelectedSeverityRating(null)
    setSelectedHazardCode(code)
  }

  const canShowResults = !!results && !!cityData
  const step1Done = !!zipData
  const step2Done = !!zipData && inputs.homeValue > 0
  const step3Active = resultsVisible && canShowResults
  const showResults = resultsVisible && canShowResults

  const mainContent = (
    <main className="dg-main">
        <StepBadges
          step1Done={step1Done}
          step2Done={step2Done}
          step3Active={step3Active}
        />

        <div className="dg-map-section">
          <MapSelector
            center={mapCenter}
            zoom={mapZoom}
            zipMarker={zipData ? [zipData.lat, zipData.lng] : null}
            onZipResult={handleZipResult}
            onZipClear={handleZipClear}
          />
        </div>

        <div className="dg-form-section">
          <InputForm
            inputs={inputs}
            onChange={setInputs}
            zip={zipData?.zip}
            defaultAddress={zipData?.defaultAddress}
            propertyDetails={zipData?.propertyDetails}
            defaultHomeValue={zipData?.defaultHomeValue}
            canShowResults={canShowResults}
            onShowResults={() => setResultsVisible(true)}
          />
        </div>

        {zipData?.hazards?.length > 0 && (
          <HazardPieChart
            key={zipData.zip}
            hazards={zipData.hazards}
            countyName={zipData.countyName}
            selectedCode={selectedHazardCode}
            onHazardSelect={handleHazardSelect}
            selectedSeverityRating={selectedSeverityRating}
            onSeverityChange={setSelectedSeverityRating}
          />
        )}

        {showResults ? (
          <>
            <div className="space-y-6">
              <RiskDashboard countyName={cityData.countyName} cityData={cityData} results={results} selectedHazard={effectiveHazard} />
              <Charts results={results} inputs={inputs} />
              <ResultsPanel results={results} inputs={inputs} />
            </div>
            <div className="mt-6">
              <InsuranceAnalysis
                zipData={zipData}
                inputs={inputs}
                results={results}
                effectiveHazard={effectiveHazard}
              />
            </div>
            <div className="mt-6">
              <button
                onClick={() => navigate('/claims')}
                className="w-full rounded-xl overflow-hidden text-left transition-all hover:shadow-lg"
                style={{
                  backgroundColor: 'var(--ds-surface)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 6px 20px rgba(0,0,0,0.06)',
                  border: '1px solid var(--ds-border)',
                }}
              >
                <div className="px-6 py-5 flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                    style={{ background: 'linear-gradient(135deg, #059669, #047857)' }}
                  >
                    <Icon name="camera" size={24} style={{ color: '#fff' }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold" style={{ color: 'var(--ds-text-primary)' }}>
                      {t('claims.buttonTitle')}
                    </h3>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--ds-text-muted)' }}>
                      {t('claims.buttonSubtitle')}
                    </p>
                  </div>
                  <Icon name="arrowRight" size={20} style={{ color: '#059669' }} />
                </div>
              </button>
            </div>
          </>
        ) : (
          <div className="dg-empty-state">
            <div className="dg-empty-icon"><Icon name="map" size={48} /></div>
            <p className="dg-empty-title">
              {!zipData
                ? t('app.intro.title.noZip')
                : !inputs.homeValue
                  ? t('app.intro.title.noHome')
                  : t('app.intro.title.computing')}
            </p>
            <p className="text-sm mt-2" style={{ color: 'var(--ds-text-secondary)' }}>
              {!zipData
                ? t('app.intro.sub.noZip')
                : t('app.intro.sub.noHome')}
            </p>
          </div>
        )}
      </main>
  )

  if (embedded) {
    return <div dir={dir}>{mainContent}</div>
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(160deg, #EFF6FF 0%, #F8FAFF 50%, #EBF4FF 100%)' }} dir={dir}>
      <Header
        zipData={zipData}
        cityData={cityData}
        countryCode={countryCode}
        flag={flag}
        onLanguageSwitch={() => setLang(null)}
      />
      {mainContent}
      <Footer />
    </div>
  )
}
