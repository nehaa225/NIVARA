const lyzrService = require('../../services/lyzrService');
const Logger = require('../../utils/logger');

const MODULE = 'VERIFICATION_AGENT';

/**
 * Verification/Audit Agent - AI verification and document compliance
 */
class VerificationAgent {
  /**
   * Process verification request
   */
  static async processVerification(ngo, documents) {
    try {
      Logger.info(MODULE, `Processing verification for NGO: ${ngo.id}`);

      const requiredDocs = ['REG_CERT', 'PAN', 'TRUST_CERT_12A'];
      const uploadedDocTypes = documents.map(d => d.type);
      const missing = requiredDocs.filter(doc => !uploadedDocTypes.includes(doc));

      let score = 30; // Base readiness score

      if (documents.length >= 3) score += 20;
      if (documents.length >= 5) score += 15;
      if (documents.length === requiredDocs.length) score += 25;
      if (ngo.annualBudget) score += 10;

      const prompt = `
Perform a granular, professional verification audit of this NGO's compliance and readiness:

NGO Profile:
- Name: ${ngo.name}
- Category: ${ngo.category}
- State: ${ngo.state}
- Status: ${ngo.status}
- Documents Uploaded: ${documents.length}
- Missing Documents: ${missing.join(', ') || 'None'}

Provide a brief verification summary (2-3 sentences) on compliance status.
Also list any documents still needed for full compliance.
`;

      let verificationSummary = '';
      let improvementSuggestions = '';

      try {
        verificationSummary = await lyzrService.callLyzrAgent(prompt, ngo.userId, ngo);
      } catch (error) {
        Logger.warn(MODULE, 'Lyzr AI call failed for verification, using default', error.message);
        verificationSummary = `Document compliance check in progress. Current readiness: ${score}/100.`;
        improvementSuggestions = missing.length > 0 
          ? `Upload missing documents: ${missing.join(', ')}`
          : 'All foundational certificates verified. Proceed to grant discovery.';
      }

      return {
        score: Math.min(score, 100),
        verificationSummary,
        missingDocs: missing.join(','),
        improvementSuggestions
      };
    } catch (error) {
      Logger.error(MODULE, 'Error in verification processing', error);
      throw error;
    }
  }
}

module.exports = VerificationAgent;
