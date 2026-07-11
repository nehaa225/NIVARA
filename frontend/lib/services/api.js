import ApiService from './ApiService';

/**
 * NGO API service
 */
export const ngoApi = {
  // Profile
  getProfile: () => ApiService.get('/ngo/profile'),
  updateProfile: (data) => ApiService.post('/ngo/update', data),
  getStatus: () => ApiService.get('/ngo/status'),

  // Documents & Upload
  uploadDocuments: (formData) => ApiService.postFormData('/ngo/upload', formData),

  // Applications
  getApplications: () => ApiService.get('/ngo/applications'),
};

/**
 * Grants API service
 */
export const grantsApi = {
  getMatches: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return ApiService.get(`/funding/matches?${params}`);
  },
  getAIRank: (grantId) => ApiService.post('/funding/ai-rank', { grantId }),
  generateProposal: (grantId) => ApiService.post('/funding/generate-proposal', { grantId }),
};

/**
 * Chat/AI Agent API service
 */
export const chatApi = {
  submitQuery: (message, language = 'en-US') => 
    ApiService.post('/chat', { message, language }),
  saveProposal: (title, subject, body) => 
    ApiService.post('/agents/proposals/save', { title, subject, body }),
};

/**
 * Auth API service
 */
export const authApi = {
  login: (email, password) => ApiService.post('/auth/login', { email, password }),
  register: (formData) => ApiService.postFormData('/auth/register', formData),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
  }
};

/**
 * Mutual Funds API service - Investment Insights Module
 */
export const mutualFundsApi = {
  // List all mutual funds with pagination
  listFunds: (page = 1, limit = 20, filters = {}) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    }).toString();
    return ApiService.get(`/mutual-funds?${params}`);
  },

  // Get details of a specific fund including NAV history
  getFundDetails: (schemeCode) => 
    ApiService.get(`/mutual-funds/${schemeCode}`),

  // Get NAV history for a fund
  getNavHistory: (schemeCode, limit = 30) => 
    ApiService.get(`/mutual-funds/${schemeCode}/nav-history?limit=${limit}`),

  // Search funds by name, code, or fund house
  searchFunds: (query) => 
    ApiService.get(`/mutual-funds/search?q=${encodeURIComponent(query)}`),

  // Get all available categories
  getCategories: () => 
    ApiService.get('/mutual-funds/categories'),

  // Get all available fund houses
  getFundHouses: () => 
    ApiService.get('/mutual-funds/fund-houses'),

  // Compare multiple funds
  compareFunds: (schemeCodes) => {
    const codes = Array.isArray(schemeCodes) ? schemeCodes.join(',') : schemeCodes;
    return ApiService.get(`/mutual-funds/compare?codes=${codes}`);
  },

  // Check service health and API availability
  healthCheck: () => 
    ApiService.get('/mutual-funds/health'),

  // Sync all schemes from MFAPI (admin only)
  syncSchemes: () => 
    ApiService.post('/mutual-funds/sync', {})
};
