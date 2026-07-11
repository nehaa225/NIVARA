const lyzrService = require('../../services/lyzrService');
const Logger = require('../../utils/logger');

const MODULE = 'PROPOSAL_AGENT';

/**
 * Proposal Writer Agent - Generate grant proposals
 */
class ProposalAgent {
  /**
   * Generate proposal for grant
   */
  static async generateProposal(ngo, grant) {
    try {
      Logger.info(MODULE, `Generating proposal for NGO ${ngo.id} and grant ${grant.id}`);

      const prompt = `Generate a professional grant proposal for the NGO:

NGO Details:
- Name: ${ngo.name}
- Category: ${ngo.category}
- Mission: ${ngo.mission || 'To improve community livelihoods'}
- Annual Budget: ${ngo.annualBudget}
- State: ${ngo.state}

Grant Details:
- Name: ${grant.name}
- Provider: ${grant.provider}
- Funding: ₹${grant.minimumFunding.toLocaleString()} to ₹${grant.maximumFunding.toLocaleString()}

Create a structured proposal with Executive Summary, Organization Profile, Problem Statement, Objectives, Activities, Timeline, Budget, M&E, and Sustainability Plan.`;

      let proposalBody = '';

      try {
        proposalBody = await lyzrService.callLyzrAgent(prompt, ngo.userId, ngo);
      } catch (error) {
        Logger.warn(MODULE, 'Lyzr AI call failed for proposal generation, using template', error.message);
        proposalBody = ProposalAgent.getDefaultProposalTemplate(ngo, grant);
      }

      return {
        title: `${grant.name} - Proposal by ${ngo.name}`,
        subject: `Grant Application for ${grant.name}`,
        body: proposalBody
      };
    } catch (error) {
      Logger.error(MODULE, 'Error generating proposal', error);
      throw error;
    }
  }

  /**
   * Default proposal template when AI fails
   */
  static getDefaultProposalTemplate(ngo, grant) {
    return `
### Executive Summary
This proposal is submitted by ${ngo.name} for the ${grant.name} opportunity.

### Organization Profile
${ngo.name} is a registered NGO working in the ${ngo.category} sector in ${ngo.state} since ${ngo.yearEstablished}.

### Problem Statement
The organization addresses critical gaps in ${ngo.category} services in the communities we serve.

### Objectives
- Improve access to ${ngo.category} services
- Build local capacity and sustainability
- Create measurable impact for ${ngo.category}

### Activities
- Community engagement and assessment
- Service delivery and implementation
- Monitoring and evaluation

### Timeline
Implementation planned over 12-18 months with quarterly milestones.

### Budget
Requested funding: ₹${grant.minimumFunding.toLocaleString()} to ₹${grant.maximumFunding.toLocaleString()}

### Monitoring & Evaluation
Robust M&E framework with quarterly assessments and annual reports.

### Sustainability Plan
Long-term sustainability through local capacity building and resource mobilization.
`;
  }
}

module.exports = ProposalAgent;
