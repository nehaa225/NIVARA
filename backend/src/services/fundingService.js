const { PrismaClient } = require('@prisma/client');
const externalFundingService = require('./externalFundingService');
const prisma = new PrismaClient();

/**
 * Calculates a match score (0-100) between an NGO profile and a grant opportunity.
 * Criteria and weighting:
 * 1. NGO Category vs Grant Sector (30%)
 * 2. NGO State vs Grant State (25%)
 * 3. NGO Mission keywords vs Grant Description/Eligibility (20%)
 * 4. NGO Annual Budget vs Grant Funding Limits (15%)
 * 5. NGO Funding Readiness Score (10%)
 */
function calculateMatchScore(ngo, grant) {
  let score = 0;

  // 1. NGO Category Match (Weight: 30)
  const ngoCat = (ngo.category || '').trim().toLowerCase();
  const grantSec = (grant.sector || '').trim().toLowerCase();
  if (ngoCat === grantSec) {
    score += 30;
  } else if (ngoCat && (ngoCat.includes(grantSec) || grantSec.includes(ngoCat))) {
    score += 15;
  }

  // 2. State Match (Weight: 25)
  const ngoState = (ngo.state || '').trim().toLowerCase();
  const grantState = (grant.state || '').trim().toLowerCase();
  if (grantState === 'national' || (ngoState && ngoState === grantState)) {
    score += 25;
  } else if (ngoState && grantState && (ngoState.includes(grantState) || grantState.includes(ngoState))) {
    score += 12;
  }

  // 3. Mission Keyword Match (Weight: 20)
  const ngoMission = (ngo.mission || '').trim().toLowerCase();
  const grantDesc = (grant.description || '').trim().toLowerCase();
  const grantElig = (grant.eligibility || '').trim().toLowerCase();
  
  // Extract words longer than 3 letters, filtering out common stop words
  const stopWords = ['with', 'that', 'this', 'from', 'their', 'they', 'them', 'have', 'were', 'been', 'would', 'should', 'about', 'other', 'organization', 'social', 'development', 'community', 'services', 'support', 'program'];
  const missionKeywords = ngoMission
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopWords.includes(w));
  
  let keywordMatches = 0;
  if (missionKeywords.length > 0) {
    missionKeywords.forEach(keyword => {
      if (grantDesc.includes(keyword) || grantElig.includes(keyword)) {
        keywordMatches++;
      }
    });
    // Scale matching keywords up to 20 points
    const overlapRatio = Math.min(keywordMatches / 2, 1); // 2 or more matches yield maximum points
    score += Math.round(overlapRatio * 20);
  }

  // 4. Annual Budget Match (Weight: 15)
  const cleanNGOBudget = (ngo.annualBudget || '').replace(/[^0-9]/g, '');
  const ngoBudget = Number(cleanNGOBudget) || 1000000;
  const grantMax = Number(grant.maximumFunding) || 0;
  
  if (grantMax > 0) {
    if (grantMax <= ngoBudget * 2) {
      score += 15;
    } else if (grantMax <= ngoBudget * 5) {
      score += 8;
    } else {
      score += 4;
    }
  } else {
    score += 10;
  }

  // 5. Funding Readiness Score (Weight: 10)
  const readiness = Number(ngo.readinessScore) || 0;
  score += Math.round((readiness / 100) * 10);

  return Math.min(Math.max(score, 0), 100);
}

/**
 * Fetches the logged-in NGO profile, matches all grants in the database,
 * and returns the top 10 matches.
 * @param {string} userId - User identifier linked to the NGO record.
 */
async function getAllFundingGrants() {
  try {
    return await externalFundingService.getFundingOpportunities();
  } catch (error) {
    console.error('[FUNDING SERVICE] Failed to sync external funding opportunities, falling back to local grants:', error);
    return prisma.grant.findMany();
  }
}

async function getTopMatchingGrants(userId) {
  const ngo = await prisma.nGO.findUnique({
    where: { userId: userId },
    include: {
      documents: true
    }
  });

  if (!ngo) {
    throw new Error(`NGO profile with userId ${userId} not found.`);
  }

  const grants = await getAllFundingGrants();

  const matched = grants.map(grant => {
    const matchPercentage = calculateMatchScore(ngo, grant);
    return {
      ...grant,
      matchPercentage
    };
  });

  // Sort descending by match percentage and take top 10
  return matched
    .sort((a, b) => b.matchPercentage - a.matchPercentage)
    .slice(0, 10);
}

/**
 * Matches a specific NGO with all grants and calculates the match score for each.
 */
function matchNGOWithGrants(ngo, grants) {
  return grants.map(grant => {
    const matchPercentage = calculateMatchScore(ngo, grant);
    return {
      ...grant,
      matchPercentage
    };
  });
}

module.exports = {
  calculateMatchScore,
  getAllFundingGrants,
  getTopMatchingGrants,
  matchNGOWithGrants
};
