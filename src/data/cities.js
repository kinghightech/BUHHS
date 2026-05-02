/**
 * Predefined risk data for five high-risk US cities.
 * These are kept as grey reference markers on the map.
 * riskValue scale: Low=1, Medium=2, High=3
 */
export const CITIES = {
  'San Diego, CA': {
    disaster: 'Wildfire',
    riskValue: 3,
    coordinates: [32.7157, -117.1611],
    color: '#ef4444',
    description: 'High wildfire risk driven by dry climate and seasonal Santa Ana winds.',
  },
  'Fort Lauderdale, FL': {
    disaster: 'Hurricane',
    riskValue: 3,
    coordinates: [26.1224, -80.1373],
    color: '#3b82f6',
    description: 'High hurricane risk during the Atlantic season (June – November).',
  },
  'New Orleans, LA': {
    disaster: 'Flood',
    riskValue: 3,
    coordinates: [29.9511, -90.0715],
    color: '#06b6d4',
    description: 'Extreme flood risk due to below-sea-level elevation and Gulf proximity.',
  },
  'Oklahoma City, OK': {
    disaster: 'Tornado',
    riskValue: 3,
    coordinates: [35.4676, -97.5164],
    color: '#8b5cf6',
    description: 'Located in Tornado Alley with the highest tornado frequency in the US.',
  },
  'San Francisco, CA': {
    disaster: 'Earthquake',
    riskValue: 3,
    coordinates: [37.7749, -122.4194],
    color: '#f59e0b',
    description: 'High seismic risk from the San Andreas and Hayward fault systems.',
  },
}

export const DISASTER_ICONS = {
  Wildfire: 'flame',
  Hurricane: 'hurricane',
  Flood: 'waves',
  Tornado: 'tornado',
  Earthquake: 'zap',
}

/**
 * Maps FEMA NRI hazard codes to human-readable names and emojis.
 * Used to display top hazards from live FEMA data.
 */
export const FEMA_HAZARD_MAP = {
  WFIR: { name: 'Wildfire', icon: 'flame' },
  HRCN: { name: 'Hurricane', icon: 'hurricane' },
  RFLD: { name: 'Riverine Flooding', icon: 'waves' },
  CFLD: { name: 'Coastal Flooding', icon: 'waves' },
  TRND: { name: 'Tornado', icon: 'tornado' },
  ERQK: { name: 'Earthquake', icon: 'zap' },
  DRGT: { name: 'Drought', icon: 'sun' },
  HWAV: { name: 'Heat Wave', icon: 'thermometer' },
  HAIL: { name: 'Hail', icon: 'hail' },
  LTNG: { name: 'Lightning', icon: 'zap' },
  AVLN: { name: 'Avalanche', icon: 'mountain' },
  CWAV: { name: 'Cold Wave', icon: 'snowflake' },
  ISTM: { name: 'Ice Storm', icon: 'snowflake' },
  LNDS: { name: 'Landslide', icon: 'mountain' },
  VLCN: { name: 'Volcanic Activity', icon: 'flame' },
  TSUN: { name: 'Tsunami', icon: 'waves' },
  SWND: { name: 'Strong Wind', icon: 'wind' },
  WNTW: { name: 'Winter Weather', icon: 'snowflake' },
}
