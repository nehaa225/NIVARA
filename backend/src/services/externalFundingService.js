const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const DEFAULT_TIMEOUT_MS = 5000;
const EXTERNAL_API_URLS = (process.env.EXTERNAL_FUNDING_API_URLS || '')
  .split(',')
  .map(url => url.trim())
  .filter(Boolean);

function normalizeExternalGrant(rawGrant, sourceUrl) {
  const title = rawGrant?.title || rawGrant?.name || rawGrant?.opportunityName || 'Untitled Grant';
  const provider = rawGrant?.provider || rawGrant?.organization || rawGrant?.fundingBody || rawGrant?.issuer || 'Unknown Provider';
  const grantType = rawGrant?.type || rawGrant?.grantType || rawGrant?.programType || 'Unknown';
  const sector = rawGrant?.sector || rawGrant?.category || rawGrant?.focusArea || 'General';
  const state = rawGrant?.state || rawGrant?.location || rawGrant?.geography || 'National';
  const minimumFunding = Number(rawGrant?.minimumFunding ?? rawGrant?.minAmount ?? rawGrant?.minAmountInr ?? 0);
  const maximumFunding = Number(rawGrant?.maximumFunding ?? rawGrant?.maxAmount ?? rawGrant?.maxAmountInr ?? 0);
  const deadline = rawGrant?.deadline || rawGrant?.lastDate || rawGrant?.closingDate || 'TBD';
  const eligibility = rawGrant?.eligibility || rawGrant?.eligibilityCriteria || rawGrant?.description || 'Eligibility details not provided.';
  const description = rawGrant?.description || rawGrant?.summary || `${title} opportunity from ${provider}`;
  const requiredDocumentsValue = Array.isArray(rawGrant?.requiredDocuments)
    ? rawGrant.requiredDocuments
    : Array.isArray(rawGrant?.documentsRequired)
      ? rawGrant.documentsRequired
      : rawGrant?.requiredDocuments || rawGrant?.documentsRequired;
  const requiredDocuments = Array.isArray(requiredDocumentsValue)
    ? requiredDocumentsValue.join(', ')
    : requiredDocumentsValue || 'Registration Certificate';
  const applyUrl = rawGrant?.applyUrl || rawGrant?.url || rawGrant?.link || null;

  return {
    name: title,
    provider,
    type: grantType,
    sector,
    state,
    minimumFunding: Number.isFinite(minimumFunding) ? minimumFunding : 0,
    maximumFunding: Number.isFinite(maximumFunding) ? maximumFunding : 0,
    deadline,
    eligibility,
    requiredDocuments,
    description,
    applyUrl,
    sourceUrl
  };
}

function deduplicateGrantRecords(grants) {
  const seen = new Set();
  return grants.filter(grant => {
    const key = `${(grant.provider || '').toLowerCase().trim()}::${(grant.name || '').toLowerCase().trim()}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function buildExternalApiConfigs() {
  return EXTERNAL_API_URLS.map((url, index) => ({
    id: `external-${index + 1}`,
    url
  }));
}

async function fetchExternalGrants() {
  const configs = buildExternalApiConfigs();
  if (configs.length === 0) {
    return [];
  }

  const allResults = [];

  for (const config of configs) {
    try {
      const response = await fetch(config.url, {
        method: 'GET',
        headers: {
          Accept: 'application/json'
        },
        signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS)
      });

      if (!response.ok) {
        throw new Error(`External funding API responded with ${response.status}`);
      }

      const payload = await response.json();
      const items = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.grants)
          ? payload.grants
          : Array.isArray(payload?.opportunities)
            ? payload.opportunities
            : [];

      const normalized = items
        .map(item => normalizeExternalGrant(item, config.url))
        .filter(Boolean);

      allResults.push(...normalized);
    } catch (error) {
      console.warn(`[EXTERNAL_FUNDING] Failed to fetch grants from ${config.url}: ${error.message}`);
    }
  }

  return deduplicateGrantRecords(allResults);
}

async function syncExternalGrants() {
  const externalGrants = await fetchExternalGrants();
  if (externalGrants.length === 0) {
    return [];
  }

  const upserts = [];

  for (const grant of externalGrants) {
    const existing = await prisma.grant.findFirst({
      where: {
        OR: [
          { name: grant.name, provider: grant.provider },
          { applyUrl: grant.applyUrl }
        ]
      }
    });

    if (existing) {
      upserts.push(prisma.grant.update({
        where: { id: existing.id },
        data: {
          name: grant.name,
          provider: grant.provider,
          type: grant.type,
          sector: grant.sector,
          state: grant.state,
          minimumFunding: grant.minimumFunding,
          maximumFunding: grant.maximumFunding,
          deadline: grant.deadline,
          eligibility: grant.eligibility,
          requiredDocuments: grant.requiredDocuments,
          description: grant.description,
          applyUrl: grant.applyUrl
        }
      }));
    } else {
      upserts.push(prisma.grant.create({
        data: {
          name: grant.name,
          provider: grant.provider,
          type: grant.type,
          sector: grant.sector,
          state: grant.state,
          minimumFunding: grant.minimumFunding,
          maximumFunding: grant.maximumFunding,
          deadline: grant.deadline,
          eligibility: grant.eligibility,
          requiredDocuments: grant.requiredDocuments,
          description: grant.description,
          applyUrl: grant.applyUrl
        }
      }));
    }
  }

  await Promise.all(upserts);
  return externalGrants;
}

async function getFundingOpportunities() {
  try {
    const externalGrants = await syncExternalGrants();
    const localGrants = await prisma.grant.findMany();
    return deduplicateGrantRecords([...localGrants, ...externalGrants]);
  } catch (error) {
    console.error('[EXTERNAL_FUNDING] Unexpected error while syncing funding opportunities:', error);
    return prisma.grant.findMany();
  }
}

module.exports = {
  normalizeExternalGrant,
  deduplicateGrantRecords,
  fetchExternalGrants,
  syncExternalGrants,
  getFundingOpportunities
};
