/**
 * API service for backend communication
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiService {
  /**
   * Get auth token from localStorage
   */
  static getAuthToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  /**
   * Get default headers
   */
  static getHeaders(includeAuth = true, contentType = 'application/json') {
    const headers = {};
    if (contentType) headers['Content-Type'] = contentType;
    if (includeAuth) {
      const token = this.getAuthToken();
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  /**
   * Handle API response
   */
  static async handleResponse(response) {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || `HTTP Error: ${response.status}`);
    }
    return data;
  }

  /**
   * GET request
   */
  static async get(endpoint) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }

  /**
   * POST request
   */
  static async post(endpoint, body) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(true, 'application/json'),
      body: JSON.stringify(body)
    });
    return this.handleResponse(response);
  }

  /**
   * POST with FormData (for file uploads)
   */
  static async postFormData(endpoint, formData) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(true, null), // Don't set Content-Type for FormData
      body: formData
    });
    return this.handleResponse(response);
  }

  /**
   * PUT request
   */
  static async put(endpoint, body) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(true, 'application/json'),
      body: JSON.stringify(body)
    });
    return this.handleResponse(response);
  }

  /**
   * DELETE request
   */
  static async delete(endpoint) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }
}

module.exports = ApiService;
