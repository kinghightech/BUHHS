import { useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import ZipSearch from './ZipSearch'
import { useLanguage } from '../i18n/LanguageContext'
import { useTheme } from './ThemeToggle'

function MapController({ center, zoom }) {
  const map = useMap()
  useEffect(() => {
    if (center && zoom) map.setView(center, zoom, { animate: true, duration: 0.8 })
  }, [map, center, zoom])
  return null
}

export default function MapSelector({ center, zoom, zipMarker, onZipResult, onZipClear }) {
  const { t } = useLanguage()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  const tileAttribution = isDark
    ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 6px 20px rgba(0,0,0,0.06)',
        border: '1px solid rgba(0,0,0,0.08)',
      }}
    >
      <ZipSearch onResult={onZipResult} onClear={onZipClear} />

      <MapContainer
        center={center || [37.8, -96]}
        zoom={zoom || 4}
        style={{ height: '340px' }}
        scrollWheelZoom={false}
        zoomControl
      >
        <MapController center={center || [37.8, -96]} zoom={zoom || 4} />
        <TileLayer
          attribution={tileAttribution}
          url={tileUrl}
        />
        {zipMarker && (
          <CircleMarker
            center={zipMarker}
            radius={14}
            pathOptions={{ color: '#2563EB', fillColor: '#3B82F6', fillOpacity: 0.88, weight: 3 }}
          >
            <Tooltip direction="top" offset={[0, -12]} opacity={0.97}>
              <div style={{ lineHeight: '1.5' }}>
                <div style={{ fontWeight: '700', fontSize: '0.8rem', color: 'var(--ds-text-primary)' }}>{t('map.tooltipTitle')}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--ds-text-secondary)' }}>{t('map.tooltipSub')}</div>
              </div>
            </Tooltip>
          </CircleMarker>
        )}
      </MapContainer>

      {/* Legend */}
      <div
        className="px-4 py-2.5"
        style={{ backgroundColor: 'var(--ds-surface-secondary)', borderTop: '1px solid var(--ds-border)' }}
      >
        <div className="flex flex-wrap items-center gap-4 text-xs" style={{ color: 'var(--ds-text-secondary)' }}>
          {zipMarker ? (
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: '#2563EB' }} />
              {t('map.legendActive')}
            </span>
          ) : (
            <span style={{ color: 'var(--ds-text-muted)' }}>{t('map.legendEmpty')}</span>
          )}
        </div>
      </div>
    </div>
  )
}
