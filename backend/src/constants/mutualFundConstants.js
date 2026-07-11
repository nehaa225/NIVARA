/**
 * Mutual Fund Constants
 */

const MUTUAL_FUND_CATEGORIES = {
  EQUITY: 'Equity',
  DEBT: 'Debt',
  HYBRID: 'Hybrid',
  MONEY_MARKET: 'Money Market',
  LIQUID: 'Liquid',
  GILT: 'Gilt'
};

const MUTUAL_FUND_STATUS = {
  ACTIVE: 'Active',
  CLOSED: 'Closed',
  INACTIVE: 'Inactive'
};

const RISK_PROFILES = {
  LOW: 'Low',
  MODERATE: 'Moderate',
  HIGH: 'High'
};

const NAV_HISTORY_LIMITS = {
  WEEK: 7,
  MONTH: 30,
  QUARTER: 90,
  HALF_YEAR: 180,
  YEAR: 365
};

const MFAPI_CONFIG = {
  BASE_URL: 'https://api.mfapi.in',
  ENDPOINTS: {
    ALL_SCHEMES: '/mfapi_public/v1/mfapi_public_service/all',
    SCHEME_DETAILS: '/mfapi_public/v1/mfapi_public_service/SchemeHistoricalNavDetails'
  },
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 2000,
  SYNC_CACHE_MINUTES: 60,
  TIMEOUT_MS: 10000
};

module.exports = {
  MUTUAL_FUND_CATEGORIES,
  MUTUAL_FUND_STATUS,
  RISK_PROFILES,
  NAV_HISTORY_LIMITS,
  MFAPI_CONFIG
};
