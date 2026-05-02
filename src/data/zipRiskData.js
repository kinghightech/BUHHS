/**
 * Local ZIP-code risk database.
 * Each entry stores coordinates (for map zoom) and per-hazard risk share (pct),
 * where pct values represent that hazard's proportional share of total local risk
 * and all pct values for a ZIP sum to 100.
 *
 * To add a new ZIP: copy an existing entry, update the values, and add to ZIP_RISK_DATA.
 */

export const ZIP_RISK_DATA = {
  // ── Shrewsbury, MA ────────────────────────────────────────────────────────
  '01545': {
    zip: '01545',
    city: 'Shrewsbury',
    state: 'MA',
    countyName: 'Worcester County, MA',
    lat: 42.2931,
    lng: -71.7195,
    riskRating: 'Relatively Low',
    hazards: [
      { code: 'WNTW', name: 'Winter Weather', icon: 'snowflake', pct: 38, rating: 'Relatively High' },
      { code: 'RFLD', name: 'Flooding',        icon: 'waves', pct: 20, rating: 'Relatively Moderate' },
      { code: 'LTNG', name: 'Lightning',       icon: 'zap', pct: 13, rating: 'Relatively Moderate' },
      { code: 'HRCN', name: 'Hurricane',       icon: 'hurricane', pct: 11, rating: 'Relatively Low' },
      { code: 'HWAV', name: 'Heat Wave',       icon: 'thermometer', pct:  8, rating: 'Relatively Low' },
      { code: 'TRND', name: 'Tornado',         icon: 'tornado', pct:  5, rating: 'Very Low' },
      { code: 'ERQK', name: 'Earthquake',      icon: 'mountain', pct:  3, rating: 'Very Low' },
      { code: 'HAIL', name: 'Hail',            icon: 'hail', pct:  2, rating: 'Very Low' },
    ],
  },

  // ── Oakland Park / Fort Lauderdale, FL ────────────────────────────────────
  '33309': {
    zip: '33309',
    city: 'Oakland Park',
    state: 'FL',
    countyName: 'Broward County, FL',
    lat: 26.1662,
    lng: -80.1528,
    riskRating: 'Very High',
    hazards: [
      { code: 'HRCN', name: 'Hurricane',       icon: 'hurricane', pct: 35, rating: 'Very High' },
      { code: 'RFLD', name: 'Flooding',         icon: 'waves', pct: 28, rating: 'Very High' },
      { code: 'CFLD', name: 'Coastal Flooding', icon: 'waves', pct: 14, rating: 'Relatively Moderate' },
      { code: 'TRND', name: 'Tornado',          icon: 'tornado', pct:  8, rating: 'Relatively Moderate' },
      { code: 'LTNG', name: 'Lightning',        icon: 'zap', pct:  7, rating: 'Relatively Moderate' },
      { code: 'HWAV', name: 'Heat Wave',        icon: 'thermometer', pct:  4, rating: 'Relatively Low' },
      { code: 'WFIR', name: 'Wildfire',         icon: 'flame', pct:  3, rating: 'Relatively Low' },
      { code: 'DRGT', name: 'Drought',          icon: 'sun', pct:  1, rating: 'Very Low' },
    ],
  },

  // ── Fort Lauderdale, FL ───────────────────────────────────────────────────
  '33336': {
    zip: '33336',
    city: 'Fort Lauderdale',
    state: 'FL',
    countyName: 'Broward County, FL',
    lat: 26.1224,
    lng: -80.1373,
    riskRating: 'Very High',
    hazards: [
      { code: 'HRCN', name: 'Hurricane',       icon: 'hurricane', pct: 33, rating: 'Very High' },
      { code: 'RFLD', name: 'Flooding',         icon: 'waves', pct: 26, rating: 'Very High' },
      { code: 'CFLD', name: 'Coastal Flooding', icon: 'waves', pct: 18, rating: 'Relatively High' },
      { code: 'TRND', name: 'Tornado',          icon: 'tornado', pct:  8, rating: 'Relatively Moderate' },
      { code: 'LTNG', name: 'Lightning',        icon: 'zap', pct:  7, rating: 'Relatively Moderate' },
      { code: 'HWAV', name: 'Heat Wave',        icon: 'thermometer', pct:  4, rating: 'Relatively Low' },
      { code: 'WFIR', name: 'Wildfire',         icon: 'flame', pct:  3, rating: 'Relatively Low' },
      { code: 'DRGT', name: 'Drought',          icon: 'sun', pct:  1, rating: 'Very Low' },
    ],
  },

  // ── Beverly, MA ───────────────────────────────────────────────────────────
  '01915': {
    zip: '01915',
    city: 'Beverly',
    state: 'MA',
    countyName: 'Essex County, MA',
    lat: 42.5584,
    lng: -70.8800,
    riskRating: 'Relatively Moderate',
    hazards: [
      { code: 'WNTW', name: 'Winter Weather', icon: 'snowflake', pct: 35, rating: 'Relatively High' },
      { code: 'RFLD', name: 'Flooding',        icon: 'waves', pct: 22, rating: 'Relatively Moderate' },
      { code: 'HRCN', name: 'Hurricane',       icon: 'hurricane', pct: 15, rating: 'Relatively Moderate' },
      { code: 'LTNG', name: 'Lightning',       icon: 'zap', pct: 12, rating: 'Relatively Low' },
      { code: 'HWAV', name: 'Heat Wave',       icon: 'thermometer', pct:  8, rating: 'Relatively Low' },
      { code: 'TRND', name: 'Tornado',         icon: 'tornado', pct:  5, rating: 'Very Low' },
      { code: 'ERQK', name: 'Earthquake',      icon: 'mountain', pct:  2, rating: 'Very Low' },
      { code: 'HAIL', name: 'Hail',            icon: 'hail', pct:  1, rating: 'Very Low' },
    ],
  },

  // ── Marlton, NJ ──────────────────────────────────────────────────────────
  '08053': {
    zip: '08053',
    city: 'Marlton',
    state: 'NJ',
    countyName: 'Burlington County, NJ',
    lat: 39.8918,
    lng: -74.9218,
    riskRating: 'Relatively Moderate',
    hazards: [
      { code: 'RFLD', name: 'Flooding',        icon: 'waves', pct: 25, rating: 'Relatively High' },
      { code: 'WNTW', name: 'Winter Weather', icon: 'snowflake', pct: 25, rating: 'Relatively Moderate' },
      { code: 'HRCN', name: 'Hurricane',       icon: 'hurricane', pct: 18, rating: 'Relatively Moderate' },
      { code: 'LTNG', name: 'Lightning',       icon: 'zap', pct: 12, rating: 'Relatively Moderate' },
      { code: 'TRND', name: 'Tornado',         icon: 'tornado', pct: 10, rating: 'Relatively Low' },
      { code: 'HWAV', name: 'Heat Wave',       icon: 'thermometer', pct:  6, rating: 'Relatively Low' },
      { code: 'HAIL', name: 'Hail',            icon: 'hail', pct:  3, rating: 'Very Low' },
      { code: 'DRGT', name: 'Drought',         icon: 'sun', pct:  1, rating: 'Very Low' },
    ],
  },

  // ── Leominster, MA ───────────────────────────────────────────────────────
  '01453': {
    zip: '01453',
    city: 'Leominster',
    state: 'MA',
    countyName: 'Worcester County, MA',
    lat: 42.5251,
    lng: -71.7598,
    riskRating: 'Relatively Low',
    hazards: [
      { code: 'WNTW', name: 'Winter Weather', icon: 'snowflake', pct: 38, rating: 'Relatively High' },
      { code: 'RFLD', name: 'Flooding',        icon: 'waves', pct: 20, rating: 'Relatively Moderate' },
      { code: 'LTNG', name: 'Lightning',       icon: 'zap', pct: 13, rating: 'Relatively Moderate' },
      { code: 'HRCN', name: 'Hurricane',       icon: 'hurricane', pct: 11, rating: 'Relatively Low' },
      { code: 'HWAV', name: 'Heat Wave',       icon: 'thermometer', pct:  8, rating: 'Relatively Low' },
      { code: 'TRND', name: 'Tornado',         icon: 'tornado', pct:  5, rating: 'Very Low' },
      { code: 'ERQK', name: 'Earthquake',      icon: 'mountain', pct:  3, rating: 'Very Low' },
      { code: 'HAIL', name: 'Hail',            icon: 'hail', pct:  2, rating: 'Very Low' },
    ],
  },

  // ── Ballwin, MO ──────────────────────────────────────────────────────────
  '63021': {
    zip: '63021',
    city: 'Ballwin',
    state: 'MO',
    countyName: 'St. Louis County, MO',
    lat: 38.5950,
    lng: -90.5543,
    riskRating: 'Relatively Moderate',
    hazards: [
      { code: 'TRND', name: 'Tornado',         icon: 'tornado', pct: 25, rating: 'Relatively High' },
      { code: 'RFLD', name: 'Flooding',        icon: 'waves', pct: 22, rating: 'Relatively Moderate' },
      { code: 'WNTW', name: 'Winter Weather', icon: 'snowflake', pct: 20, rating: 'Relatively Moderate' },
      { code: 'HAIL', name: 'Hail',            icon: 'hail', pct: 15, rating: 'Relatively Moderate' },
      { code: 'LTNG', name: 'Lightning',       icon: 'zap', pct: 10, rating: 'Relatively Low' },
      { code: 'HWAV', name: 'Heat Wave',       icon: 'thermometer', pct:  5, rating: 'Relatively Low' },
      { code: 'DRGT', name: 'Drought',         icon: 'sun', pct:  3, rating: 'Very Low' },
    ],
  },

  // ── Wayne, NJ ────────────────────────────────────────────────────────────
  '07470': {
    zip: '07470',
    city: 'Wayne',
    state: 'NJ',
    countyName: 'Passaic County, NJ',
    lat: 40.9279,
    lng: -74.2518,
    riskRating: 'Relatively High',
    hazards: [
      { code: 'RFLD', name: 'Flooding',        icon: 'waves', pct: 30, rating: 'Relatively High' },
      { code: 'WNTW', name: 'Winter Weather', icon: 'snowflake', pct: 25, rating: 'Relatively Moderate' },
      { code: 'HRCN', name: 'Hurricane',       icon: 'hurricane', pct: 15, rating: 'Relatively Moderate' },
      { code: 'LTNG', name: 'Lightning',       icon: 'zap', pct: 12, rating: 'Relatively Moderate' },
      { code: 'TRND', name: 'Tornado',         icon: 'tornado', pct: 10, rating: 'Relatively Low' },
      { code: 'HWAV', name: 'Heat Wave',       icon: 'thermometer', pct:  5, rating: 'Relatively Low' },
      { code: 'HAIL', name: 'Hail',            icon: 'hail', pct:  3, rating: 'Very Low' },
    ],
  },

  // ── Strongsville, OH ──────────────────────────────────────────────────────
  '44149': {
    zip: '44149',
    city: 'Strongsville',
    state: 'OH',
    countyName: 'Cuyahoga County, OH',
    lat: 41.3145,
    lng: -81.8357,
    riskRating: 'Relatively Moderate',
    hazards: [
      { code: 'WNTW', name: 'Winter Weather', icon: 'snowflake', pct: 45, rating: 'Very High' },
      { code: 'RFLD', name: 'Flooding',        icon: 'waves', pct: 18, rating: 'Relatively Moderate' },
      { code: 'TRND', name: 'Tornado',         icon: 'tornado', pct: 15, rating: 'Relatively Moderate' },
      { code: 'LTNG', name: 'Lightning',       icon: 'zap', pct: 10, rating: 'Relatively Low' },
      { code: 'HAIL', name: 'Hail',            icon: 'hail', pct:  8, rating: 'Relatively Low' },
      { code: 'HWAV', name: 'Heat Wave',       icon: 'thermometer', pct:  4, rating: 'Very Low' },
    ],
  },

  // ── Trumbull, CT ─────────────────────────────────────────────────────────
  '06611': {
    zip: '06611',
    city: 'Trumbull',
    state: 'CT',
    countyName: 'Fairfield County, CT',
    lat: 41.2431,
    lng: -73.2007,
    riskRating: 'Relatively Moderate',
    hazards: [
      { code: 'WNTW', name: 'Winter Weather', icon: 'snowflake', pct: 30, rating: 'Relatively High' },
      { code: 'RFLD', name: 'Flooding',        icon: 'waves', pct: 22, rating: 'Relatively Moderate' },
      { code: 'HRCN', name: 'Hurricane',       icon: 'hurricane', pct: 18, rating: 'Relatively Moderate' },
      { code: 'LTNG', name: 'Lightning',       icon: 'zap', pct: 13, rating: 'Relatively Low' },
      { code: 'TRND', name: 'Tornado',         icon: 'tornado', pct:  8, rating: 'Relatively Low' },
      { code: 'HWAV', name: 'Heat Wave',       icon: 'thermometer', pct:  6, rating: 'Very Low' },
      { code: 'HAIL', name: 'Hail',            icon: 'hail', pct:  3, rating: 'Very Low' },
    ],
  },

  // ── Cumberland, RI ───────────────────────────────────────────────────────
  '02864': {
    zip: '02864',
    city: 'Cumberland',
    state: 'RI',
    countyName: 'Providence County, RI',
    lat: 41.9476,
    lng: -71.4306,
    riskRating: 'Relatively Low',
    hazards: [
      { code: 'WNTW', name: 'Winter Weather', icon: 'snowflake', pct: 37, rating: 'Relatively High' },
      { code: 'RFLD', name: 'Flooding',        icon: 'waves', pct: 22, rating: 'Relatively Moderate' },
      { code: 'HRCN', name: 'Hurricane',       icon: 'hurricane', pct: 16, rating: 'Relatively Moderate' },
      { code: 'LTNG', name: 'Lightning',       icon: 'zap', pct: 12, rating: 'Relatively Low' },
      { code: 'HWAV', name: 'Heat Wave',       icon: 'thermometer', pct:  7, rating: 'Relatively Low' },
      { code: 'TRND', name: 'Tornado',         icon: 'tornado', pct:  4, rating: 'Very Low' },
      { code: 'ERQK', name: 'Earthquake',      icon: 'mountain', pct:  2, rating: 'Very Low' },
    ],
  },

  // ── South Windsor, CT ────────────────────────────────────────────────────
  '06074': {
    zip: '06074',
    city: 'South Windsor',
    state: 'CT',
    countyName: 'Hartford County, CT',
    lat: 41.8387,
    lng: -72.5787,
    riskRating: 'Relatively Moderate',
    hazards: [
      { code: 'WNTW', name: 'Winter Weather', icon: 'snowflake', pct: 32, rating: 'Relatively High' },
      { code: 'RFLD', name: 'Flooding',        icon: 'waves', pct: 22, rating: 'Relatively Moderate' },
      { code: 'HRCN', name: 'Hurricane',       icon: 'hurricane', pct: 15, rating: 'Relatively Moderate' },
      { code: 'LTNG', name: 'Lightning',       icon: 'zap', pct: 14, rating: 'Relatively Low' },
      { code: 'TRND', name: 'Tornado',         icon: 'tornado', pct:  9, rating: 'Relatively Low' },
      { code: 'HWAV', name: 'Heat Wave',       icon: 'thermometer', pct:  6, rating: 'Very Low' },
      { code: 'HAIL', name: 'Hail',            icon: 'hail', pct:  2, rating: 'Very Low' },
    ],
  },

  // ── Bexley, OH ───────────────────────────────────────────────────────────
  '43209': {
    zip: '43209',
    city: 'Bexley',
    state: 'OH',
    countyName: 'Franklin County, OH',
    lat: 39.9659,
    lng: -82.9382,
    riskRating: 'Relatively Moderate',
    hazards: [
      { code: 'TRND', name: 'Tornado',         icon: 'tornado', pct: 25, rating: 'Relatively High' },
      { code: 'WNTW', name: 'Winter Weather', icon: 'snowflake', pct: 25, rating: 'Relatively Moderate' },
      { code: 'RFLD', name: 'Flooding',        icon: 'waves', pct: 20, rating: 'Relatively Moderate' },
      { code: 'LTNG', name: 'Lightning',       icon: 'zap', pct: 12, rating: 'Relatively Low' },
      { code: 'HAIL', name: 'Hail',            icon: 'hail', pct: 10, rating: 'Relatively Low' },
      { code: 'HWAV', name: 'Heat Wave',       icon: 'thermometer', pct:  5, rating: 'Very Low' },
      { code: 'DRGT', name: 'Drought',         icon: 'sun', pct:  3, rating: 'Very Low' },
    ],
  },

  // ── Rockford, IL ─────────────────────────────────────────────────────────
  '61108': {
    zip: '61108',
    city: 'Rockford',
    state: 'IL',
    countyName: 'Winnebago County, IL',
    lat: 42.2559,
    lng: -89.0440,
    riskRating: 'Relatively Moderate',
    hazards: [
      { code: 'WNTW', name: 'Winter Weather', icon: 'snowflake', pct: 30, rating: 'Relatively High' },
      { code: 'TRND', name: 'Tornado',         icon: 'tornado', pct: 25, rating: 'Relatively High' },
      { code: 'RFLD', name: 'Flooding',        icon: 'waves', pct: 20, rating: 'Relatively Moderate' },
      { code: 'HAIL', name: 'Hail',            icon: 'hail', pct: 12, rating: 'Relatively Moderate' },
      { code: 'LTNG', name: 'Lightning',       icon: 'zap', pct:  8, rating: 'Relatively Low' },
      { code: 'HWAV', name: 'Heat Wave',       icon: 'thermometer', pct:  4, rating: 'Very Low' },
      { code: 'DRGT', name: 'Drought',         icon: 'sun', pct:  1, rating: 'Very Low' },
    ],
  },

  // ── Wheaton, IL ──────────────────────────────────────────────────────────
  '60189': {
    zip: '60189',
    city: 'Wheaton',
    state: 'IL',
    countyName: 'DuPage County, IL',
    lat: 41.8661,
    lng: -88.1070,
    riskRating: 'Relatively Moderate',
    hazards: [
      { code: 'WNTW', name: 'Winter Weather', icon: 'snowflake', pct: 28, rating: 'Relatively High' },
      { code: 'TRND', name: 'Tornado',         icon: 'tornado', pct: 25, rating: 'Relatively High' },
      { code: 'RFLD', name: 'Flooding',        icon: 'waves', pct: 20, rating: 'Relatively Moderate' },
      { code: 'HAIL', name: 'Hail',            icon: 'hail', pct: 14, rating: 'Relatively Moderate' },
      { code: 'LTNG', name: 'Lightning',       icon: 'zap', pct:  8, rating: 'Relatively Low' },
      { code: 'HWAV', name: 'Heat Wave',       icon: 'thermometer', pct:  3, rating: 'Very Low' },
      { code: 'DRGT', name: 'Drought',         icon: 'sun', pct:  2, rating: 'Very Low' },
    ],
  },

  // ── Wilbraham, MA ────────────────────────────────────────────────────────
  '01095': {
    zip: '01095',
    city: 'Wilbraham',
    state: 'MA',
    countyName: 'Hampden County, MA',
    lat: 42.1259,
    lng: -72.4329,
    riskRating: 'Relatively Moderate',
    hazards: [
      { code: 'WNTW', name: 'Winter Weather', icon: 'snowflake', pct: 32, rating: 'Relatively High' },
      { code: 'RFLD', name: 'Flooding',        icon: 'waves', pct: 18, rating: 'Relatively Moderate' },
      { code: 'TRND', name: 'Tornado',         icon: 'tornado', pct: 16, rating: 'Relatively Moderate' },
      { code: 'LTNG', name: 'Lightning',       icon: 'zap', pct: 14, rating: 'Relatively Moderate' },
      { code: 'HRCN', name: 'Hurricane',       icon: 'hurricane', pct: 10, rating: 'Relatively Low' },
      { code: 'HWAV', name: 'Heat Wave',       icon: 'thermometer', pct:  6, rating: 'Relatively Low' },
      { code: 'ERQK', name: 'Earthquake',      icon: 'mountain', pct:  2, rating: 'Very Low' },
      { code: 'HAIL', name: 'Hail',            icon: 'hail', pct:  2, rating: 'Very Low' },
    ],
  },

  // ── Waukesha, WI ─────────────────────────────────────────────────────────
  '53186': {
    zip: '53186',
    city: 'Waukesha',
    state: 'WI',
    countyName: 'Waukesha County, WI',
    lat: 43.0117,
    lng: -88.2315,
    riskRating: 'Relatively Moderate',
    hazards: [
      { code: 'WNTW', name: 'Winter Weather', icon: 'snowflake', pct: 35, rating: 'Relatively High' },
      { code: 'TRND', name: 'Tornado',         icon: 'tornado', pct: 22, rating: 'Relatively Moderate' },
      { code: 'RFLD', name: 'Flooding',        icon: 'waves', pct: 18, rating: 'Relatively Moderate' },
      { code: 'HAIL', name: 'Hail',            icon: 'hail', pct: 12, rating: 'Relatively Low' },
      { code: 'LTNG', name: 'Lightning',       icon: 'zap', pct:  8, rating: 'Relatively Low' },
      { code: 'HWAV', name: 'Heat Wave',       icon: 'thermometer', pct:  3, rating: 'Very Low' },
      { code: 'DRGT', name: 'Drought',         icon: 'sun', pct:  2, rating: 'Very Low' },
    ],
  },

  // ── Manchester, NH ───────────────────────────────────────────────────────
  '03104': {
    zip: '03104',
    city: 'Manchester',
    state: 'NH',
    countyName: 'Hillsborough County, NH',
    lat: 42.9956,
    lng: -71.4548,
    riskRating: 'Relatively Low',
    hazards: [
      { code: 'WNTW', name: 'Winter Weather', icon: 'snowflake', pct: 40, rating: 'Relatively High' },
      { code: 'RFLD', name: 'Flooding',        icon: 'waves', pct: 20, rating: 'Relatively Moderate' },
      { code: 'LTNG', name: 'Lightning',       icon: 'zap', pct: 12, rating: 'Relatively Low' },
      { code: 'HRCN', name: 'Hurricane',       icon: 'hurricane', pct: 10, rating: 'Relatively Low' },
      { code: 'TRND', name: 'Tornado',         icon: 'tornado', pct:  8, rating: 'Very Low' },
      { code: 'HWAV', name: 'Heat Wave',       icon: 'thermometer', pct:  6, rating: 'Very Low' },
      { code: 'ERQK', name: 'Earthquake',      icon: 'mountain', pct:  3, rating: 'Very Low' },
      { code: 'HAIL', name: 'Hail',            icon: 'hail', pct:  1, rating: 'Very Low' },
    ],
  },

  // ── Allentown, PA ────────────────────────────────────────────────────────
  '18104': {
    zip: '18104',
    city: 'Allentown',
    state: 'PA',
    countyName: 'Lehigh County, PA',
    lat: 40.6023,
    lng: -75.5063,
    riskRating: 'Relatively Moderate',
    hazards: [
      { code: 'RFLD', name: 'Flooding',        icon: 'waves', pct: 25, rating: 'Relatively High' },
      { code: 'WNTW', name: 'Winter Weather', icon: 'snowflake', pct: 25, rating: 'Relatively Moderate' },
      { code: 'HRCN', name: 'Hurricane',       icon: 'hurricane', pct: 15, rating: 'Relatively Moderate' },
      { code: 'LTNG', name: 'Lightning',       icon: 'zap', pct: 13, rating: 'Relatively Moderate' },
      { code: 'TRND', name: 'Tornado',         icon: 'tornado', pct: 12, rating: 'Relatively Low' },
      { code: 'HWAV', name: 'Heat Wave',       icon: 'thermometer', pct:  6, rating: 'Relatively Low' },
      { code: 'HAIL', name: 'Hail',            icon: 'hail', pct:  4, rating: 'Very Low' },
    ],
  },

  // ── Toledo, OH ───────────────────────────────────────────────────────────
  '43614': {
    zip: '43614',
    city: 'Toledo',
    state: 'OH',
    countyName: 'Lucas County, OH',
    lat: 41.6318,
    lng: -83.6052,
    riskRating: 'Relatively Moderate',
    hazards: [
      { code: 'WNTW', name: 'Winter Weather', icon: 'snowflake', pct: 35, rating: 'Relatively High' },
      { code: 'TRND', name: 'Tornado',         icon: 'tornado', pct: 22, rating: 'Relatively Moderate' },
      { code: 'RFLD', name: 'Flooding',        icon: 'waves', pct: 18, rating: 'Relatively Moderate' },
      { code: 'HAIL', name: 'Hail',            icon: 'hail', pct: 12, rating: 'Relatively Low' },
      { code: 'LTNG', name: 'Lightning',       icon: 'zap', pct:  8, rating: 'Relatively Low' },
      { code: 'HWAV', name: 'Heat Wave',       icon: 'thermometer', pct:  4, rating: 'Very Low' },
      { code: 'DRGT', name: 'Drought',         icon: 'sun', pct:  1, rating: 'Very Low' },
    ],
  },

  // ── Wallingford, CT ──────────────────────────────────────────────────────
  '06492': {
    zip: '06492',
    city: 'Wallingford',
    state: 'CT',
    countyName: 'New Haven County, CT',
    lat: 41.4565,
    lng: -72.8231,
    riskRating: 'Relatively Moderate',
    hazards: [
      { code: 'WNTW', name: 'Winter Weather', icon: 'snowflake', pct: 32, rating: 'Relatively High' },
      { code: 'RFLD', name: 'Flooding',        icon: 'waves', pct: 22, rating: 'Relatively Moderate' },
      { code: 'HRCN', name: 'Hurricane',       icon: 'hurricane', pct: 15, rating: 'Relatively Moderate' },
      { code: 'LTNG', name: 'Lightning',       icon: 'zap', pct: 13, rating: 'Relatively Low' },
      { code: 'TRND', name: 'Tornado',         icon: 'tornado', pct:  9, rating: 'Relatively Low' },
      { code: 'HWAV', name: 'Heat Wave',       icon: 'thermometer', pct:  6, rating: 'Very Low' },
      { code: 'HAIL', name: 'Hail',            icon: 'hail', pct:  3, rating: 'Very Low' },
    ],
  },

  // ── Livonia, MI ──────────────────────────────────────────────────────────
  '48152': {
    zip: '48152',
    city: 'Livonia',
    state: 'MI',
    countyName: 'Wayne County, MI',
    lat: 42.3682,
    lng: -83.3527,
    riskRating: 'Relatively Moderate',
    hazards: [
      { code: 'WNTW', name: 'Winter Weather', icon: 'snowflake', pct: 35, rating: 'Relatively High' },
      { code: 'TRND', name: 'Tornado',         icon: 'tornado', pct: 20, rating: 'Relatively Moderate' },
      { code: 'RFLD', name: 'Flooding',        icon: 'waves', pct: 18, rating: 'Relatively Moderate' },
      { code: 'HAIL', name: 'Hail',            icon: 'hail', pct: 12, rating: 'Relatively Low' },
      { code: 'LTNG', name: 'Lightning',       icon: 'zap', pct:  9, rating: 'Relatively Low' },
      { code: 'HWAV', name: 'Heat Wave',       icon: 'thermometer', pct:  4, rating: 'Very Low' },
      { code: 'DRGT', name: 'Drought',         icon: 'sun', pct:  2, rating: 'Very Low' },
    ],
  },

  // ── Jefferson City, MO ───────────────────────────────────────────────────
  '65109': {
    zip: '65109',
    city: 'Jefferson City',
    state: 'MO',
    countyName: 'Cole County, MO',
    lat: 38.5767,
    lng: -92.1735,
    riskRating: 'Relatively High',
    hazards: [
      { code: 'TRND', name: 'Tornado',         icon: 'tornado', pct: 25, rating: 'Relatively High' },
      { code: 'RFLD', name: 'Flooding',        icon: 'waves', pct: 24, rating: 'Relatively High' },
      { code: 'WNTW', name: 'Winter Weather', icon: 'snowflake', pct: 18, rating: 'Relatively Moderate' },
      { code: 'HAIL', name: 'Hail',            icon: 'hail', pct: 15, rating: 'Relatively Moderate' },
      { code: 'LTNG', name: 'Lightning',       icon: 'zap', pct: 10, rating: 'Relatively Low' },
      { code: 'HWAV', name: 'Heat Wave',       icon: 'thermometer', pct:  5, rating: 'Relatively Low' },
      { code: 'DRGT', name: 'Drought',         icon: 'sun', pct:  3, rating: 'Very Low' },
    ],
  },

  // ── Boston, MA — Beacon Hill ─────────────────────────────────────────
  '02108': {
    zip: '02108', city: 'Beacon Hill', state: 'MA', countyName: 'Suffolk County, MA',
    lat: 42.3588, lng: -71.0707, riskRating: 'Relatively Moderate', neighborhood: 'Beacon Hill',
    hazards: [
      { code: 'WNTW', name: 'Winter Weather', icon: 'snowflake', pct: 26, rating: 'Relatively High' },
      { code: 'HWAV', name: 'Heat Wave',       icon: 'thermometer', pct: 20, rating: 'Relatively High' },
      { code: 'CFLD', name: 'Coastal Flooding', icon: 'waves', pct: 18, rating: 'Relatively High' },
      { code: 'RFLD', name: 'Flooding',         icon: 'waves', pct: 14, rating: 'Relatively Moderate' },
      { code: 'HRCN', name: 'Hurricane',        icon: 'hurricane', pct: 10, rating: 'Relatively Moderate' },
      { code: 'LTNG', name: 'Lightning',        icon: 'zap', pct:  6, rating: 'Relatively Low' },
      { code: 'TRND', name: 'Tornado',          icon: 'tornado', pct:  4, rating: 'Very Low' },
      { code: 'ERQK', name: 'Earthquake',       icon: 'mountain', pct:  2, rating: 'Very Low' },
    ],
  },

  // ── Boston, MA — Chinatown / South Cove (HOTTEST NEIGHBORHOOD) ──────
  '02111': {
    zip: '02111', city: 'Chinatown', state: 'MA', countyName: 'Suffolk County, MA',
    lat: 42.3505, lng: -71.0621, riskRating: 'Relatively High', neighborhood: 'Chinatown',
    hazards: [
      { code: 'HWAV', name: 'Heat Wave',       icon: 'thermometer', pct: 38, rating: 'Very High' },
      { code: 'CFLD', name: 'Coastal Flooding', icon: 'waves', pct: 17, rating: 'Relatively High' },
      { code: 'RFLD', name: 'Flooding',         icon: 'waves', pct: 14, rating: 'Relatively High' },
      { code: 'WNTW', name: 'Winter Weather',   icon: 'snowflake', pct: 12, rating: 'Relatively Moderate' },
      { code: 'HRCN', name: 'Hurricane',        icon: 'hurricane', pct:  9, rating: 'Relatively Moderate' },
      { code: 'LTNG', name: 'Lightning',        icon: 'zap', pct:  5, rating: 'Relatively Low' },
      { code: 'TRND', name: 'Tornado',          icon: 'tornado', pct:  3, rating: 'Very Low' },
      { code: 'ERQK', name: 'Earthquake',       icon: 'mountain', pct:  2, rating: 'Very Low' },
    ],
  },

  // ── Boston, MA — South End / Roxbury border ─────────────────────────
  '02118': {
    zip: '02118', city: 'South End', state: 'MA', countyName: 'Suffolk County, MA',
    lat: 42.3389, lng: -71.0759, riskRating: 'Relatively High', neighborhood: 'South End',
    hazards: [
      { code: 'HWAV', name: 'Heat Wave',       icon: 'thermometer', pct: 32, rating: 'Very High' },
      { code: 'CFLD', name: 'Coastal Flooding', icon: 'waves', pct: 17, rating: 'Relatively High' },
      { code: 'WNTW', name: 'Winter Weather',   icon: 'snowflake', pct: 16, rating: 'Relatively High' },
      { code: 'RFLD', name: 'Flooding',         icon: 'waves', pct: 13, rating: 'Relatively Moderate' },
      { code: 'HRCN', name: 'Hurricane',        icon: 'hurricane', pct: 10, rating: 'Relatively Moderate' },
      { code: 'LTNG', name: 'Lightning',        icon: 'zap', pct:  6, rating: 'Relatively Low' },
      { code: 'TRND', name: 'Tornado',          icon: 'tornado', pct:  4, rating: 'Very Low' },
      { code: 'ERQK', name: 'Earthquake',       icon: 'mountain', pct:  2, rating: 'Very Low' },
    ],
  },

  // ── Boston, MA — Roxbury (highway-adjacent, asthma) ─────────────────
  '02119': {
    zip: '02119', city: 'Roxbury', state: 'MA', countyName: 'Suffolk County, MA',
    lat: 42.3231, lng: -71.0850, riskRating: 'Relatively High', neighborhood: 'Roxbury',
    hazards: [
      { code: 'HWAV', name: 'Heat Wave',       icon: 'thermometer', pct: 35, rating: 'Very High' },
      { code: 'WNTW', name: 'Winter Weather',   icon: 'snowflake', pct: 19, rating: 'Relatively High' },
      { code: 'RFLD', name: 'Flooding',         icon: 'waves', pct: 15, rating: 'Relatively High' },
      { code: 'HRCN', name: 'Hurricane',        icon: 'hurricane', pct: 11, rating: 'Relatively Moderate' },
      { code: 'CFLD', name: 'Coastal Flooding', icon: 'waves', pct:  9, rating: 'Relatively Moderate' },
      { code: 'LTNG', name: 'Lightning',        icon: 'zap', pct:  6, rating: 'Relatively Low' },
      { code: 'TRND', name: 'Tornado',          icon: 'tornado', pct:  3, rating: 'Very Low' },
      { code: 'ERQK', name: 'Earthquake',       icon: 'mountain', pct:  2, rating: 'Very Low' },
    ],
  },

  // ── Boston, MA — Dorchester (energy-burdened housing stock) ─────────
  '02125': {
    zip: '02125', city: 'Dorchester', state: 'MA', countyName: 'Suffolk County, MA',
    lat: 42.3145, lng: -71.0582, riskRating: 'Relatively High', neighborhood: 'Dorchester',
    hazards: [
      { code: 'HWAV', name: 'Heat Wave',       icon: 'thermometer', pct: 28, rating: 'Relatively High' },
      { code: 'CFLD', name: 'Coastal Flooding', icon: 'waves', pct: 23, rating: 'Very High' },
      { code: 'WNTW', name: 'Winter Weather',   icon: 'snowflake', pct: 18, rating: 'Relatively High' },
      { code: 'RFLD', name: 'Flooding',         icon: 'waves', pct: 13, rating: 'Relatively Moderate' },
      { code: 'HRCN', name: 'Hurricane',        icon: 'hurricane', pct: 10, rating: 'Relatively Moderate' },
      { code: 'LTNG', name: 'Lightning',        icon: 'zap', pct:  4, rating: 'Relatively Low' },
      { code: 'TRND', name: 'Tornado',          icon: 'tornado', pct:  2, rating: 'Very Low' },
      { code: 'ERQK', name: 'Earthquake',       icon: 'mountain', pct:  2, rating: 'Very Low' },
    ],
  },

  // ── Boston, MA — East Boston (FLOODS FIRST + Logan AQI) ─────────────
  '02128': {
    zip: '02128', city: 'East Boston', state: 'MA', countyName: 'Suffolk County, MA',
    lat: 42.3702, lng: -71.0367, riskRating: 'Very High', neighborhood: 'East Boston',
    hazards: [
      { code: 'CFLD', name: 'Coastal Flooding', icon: 'waves', pct: 32, rating: 'Very High' },
      { code: 'HWAV', name: 'Heat Wave',       icon: 'thermometer', pct: 22, rating: 'Relatively High' },
      { code: 'RFLD', name: 'Flooding',         icon: 'waves', pct: 17, rating: 'Relatively High' },
      { code: 'HRCN', name: 'Hurricane',        icon: 'hurricane', pct: 13, rating: 'Relatively High' },
      { code: 'WNTW', name: 'Winter Weather',   icon: 'snowflake', pct:  9, rating: 'Relatively Moderate' },
      { code: 'LTNG', name: 'Lightning',        icon: 'zap', pct:  4, rating: 'Relatively Low' },
      { code: 'TRND', name: 'Tornado',          icon: 'tornado', pct:  2, rating: 'Very Low' },
      { code: 'ERQK', name: 'Earthquake',       icon: 'mountain', pct:  1, rating: 'Very Low' },
    ],
  },

  // ── Boston, MA — Jamaica Plain ───────────────────────────────────────
  '02130': {
    zip: '02130', city: 'Jamaica Plain', state: 'MA', countyName: 'Suffolk County, MA',
    lat: 42.3097, lng: -71.1151, riskRating: 'Relatively Moderate', neighborhood: 'Jamaica Plain',
    hazards: [
      { code: 'HWAV', name: 'Heat Wave',       icon: 'thermometer', pct: 26, rating: 'Relatively High' },
      { code: 'WNTW', name: 'Winter Weather',   icon: 'snowflake', pct: 22, rating: 'Relatively High' },
      { code: 'RFLD', name: 'Flooding',         icon: 'waves', pct: 17, rating: 'Relatively Moderate' },
      { code: 'HRCN', name: 'Hurricane',        icon: 'hurricane', pct: 12, rating: 'Relatively Moderate' },
      { code: 'CFLD', name: 'Coastal Flooding', icon: 'waves', pct:  9, rating: 'Relatively Moderate' },
      { code: 'LTNG', name: 'Lightning',        icon: 'zap', pct:  7, rating: 'Relatively Low' },
      { code: 'TRND', name: 'Tornado',          icon: 'tornado', pct:  4, rating: 'Very Low' },
      { code: 'ERQK', name: 'Earthquake',       icon: 'mountain', pct:  3, rating: 'Very Low' },
    ],
  },

  // ── Boston, MA — Mattapan (lowest tree canopy) ──────────────────────
  '02126': {
    zip: '02126', city: 'Mattapan', state: 'MA', countyName: 'Suffolk County, MA',
    lat: 42.2675, lng: -71.0918, riskRating: 'Relatively High', neighborhood: 'Mattapan',
    hazards: [
      { code: 'HWAV', name: 'Heat Wave',       icon: 'thermometer', pct: 36, rating: 'Very High' },
      { code: 'WNTW', name: 'Winter Weather',   icon: 'snowflake', pct: 18, rating: 'Relatively High' },
      { code: 'RFLD', name: 'Flooding',         icon: 'waves', pct: 14, rating: 'Relatively Moderate' },
      { code: 'HRCN', name: 'Hurricane',        icon: 'hurricane', pct: 11, rating: 'Relatively Moderate' },
      { code: 'CFLD', name: 'Coastal Flooding', icon: 'waves', pct:  9, rating: 'Relatively Moderate' },
      { code: 'LTNG', name: 'Lightning',        icon: 'zap', pct:  6, rating: 'Relatively Low' },
      { code: 'TRND', name: 'Tornado',          icon: 'tornado', pct:  4, rating: 'Very Low' },
      { code: 'ERQK', name: 'Earthquake',       icon: 'mountain', pct:  2, rating: 'Very Low' },
    ],
  },
}

/**
 * Look up a ZIP code in the local database.
 * Returns the entry object or null if not found.
 */
export function lookupZip(zip) {
  return ZIP_RISK_DATA[String(zip).trim()] || null
}

/** Sorted list of supported ZIP codes for display in error messages. */
export const SUPPORTED_ZIPS = Object.keys(ZIP_RISK_DATA).sort()
