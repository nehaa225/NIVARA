const FundingService = require('../fundingService');
const Logger = require('../../utils/logger');

const MODULE = 'FUNDING_AGENT';

/**
 * Funding Discovery Agent - Match NGO with grant opportunities
 */
class FundingAgent {
  /**
   * Find matched grants for NGO
   */
  static async findMatchedGrants(ngo, filters = {}) {
    try {
      Logger.info(MODULE, `Finding matched grants for NGO: ${ngo.id}`);

      const grants = await FundingService.getAllFundingGrants();
      const matched = FundingService.matchNGOWithGrants(ngo, grants);

      // Apply filters
      let filtered = [...matched];

      if (filters.type && filters.type !== 'All') {
        filtered = filtered.filter(g => g.type.toLowerCase() === filters.type.toLowerCase());
      }

      if (filters.sector && filters.sector !== 'All') {
        filtered = filtered.filter(g => g.sector.toLowerCase() === filters.sector.toLowerCase());
      }

      if (filters.state && filters.state !== 'All') {
        filtered = filtered.filter(g => 
          g.state.toLowerCase() === 'national' || g.state.toLowerCase() === filters.state.toLowerCase()
        );
      }

      if (filters.maxFunding) {
        const budgetLimit = Number(filters.maxFunding);
        if (!isNaN(budgetLimit)) {
          filtered = filtered.filter(g => g.minimumFunding <= budgetLimit);
        }
      }

      // Sort by match percentage
      filtered.sort((a, b) => b.matchPercentage - a.matchPercentage);

      Logger.info(MODULE, `Found ${filtered.length} matched grants for NGO ${ngo.id}`);

      return {
        opportunities: filtered,
        totalMatches: filtered.length,
        topMatch: filtered[0] || null
      };
    } catch (error) {
      Logger.error(MODULE, 'Error finding matched grants', error);
      throw error;
    }
  }
}

module.exports = FundingAgent;
