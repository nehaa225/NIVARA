const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeExternalGrant, deduplicateGrantRecords } = require('./externalFundingService');

test('normalizes external grant payloads into Grant-friendly fields', () => {
  const normalized = normalizeExternalGrant({
    title: 'Climate Action Grant',
    organization: 'Global Impact Fund',
    grantType: 'Foundation',
    category: 'Environment',
    state: 'National',
    minAmount: '500000',
    maxAmount: '2000000',
    deadline: '2026-12-31',
    eligibilityCriteria: 'NGOs working on climate resilience',
    documentsRequired: ['Registration Certificate', 'Audit Report'],
    link: 'https://example.org/apply'
  }, 'https://example.org/api');

  assert.equal(normalized.name, 'Climate Action Grant');
  assert.equal(normalized.provider, 'Global Impact Fund');
  assert.equal(normalized.type, 'Foundation');
  assert.equal(normalized.sector, 'Environment');
  assert.equal(normalized.state, 'National');
  assert.equal(normalized.minimumFunding, 500000);
  assert.equal(normalized.maximumFunding, 2000000);
  assert.equal(normalized.deadline, '2026-12-31');
  assert.match(normalized.eligibility, /climate resilience/);
  assert.equal(normalized.requiredDocuments, 'Registration Certificate, Audit Report');
  assert.equal(normalized.applyUrl, 'https://example.org/apply');
});

test('deduplicates grant records by provider and name', () => {
  const duplicates = deduplicateGrantRecords([
    {
      name: 'Education Grant',
      provider: 'Example Fund',
      sector: 'Education',
      state: 'National',
      minimumFunding: 100000,
      maximumFunding: 500000,
      deadline: '2026-10-31',
      eligibility: 'NGOs in education',
      requiredDocuments: 'Registration Certificate',
      description: 'Education support',
      applyUrl: 'https://example.org/apply'
    },
    {
      name: 'Education Grant',
      provider: 'Example Fund',
      sector: 'Education',
      state: 'National',
      minimumFunding: 100000,
      maximumFunding: 500000,
      deadline: '2026-10-31',
      eligibility: 'NGOs in education',
      requiredDocuments: 'Registration Certificate',
      description: 'Education support',
      applyUrl: 'https://example.org/apply'
    }
  ]);

  assert.equal(duplicates.length, 1);
});
