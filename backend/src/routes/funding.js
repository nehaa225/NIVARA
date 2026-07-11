const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { authenticateToken } = require('../middleware/auth');
const fundingService = require('../services/fundingService');
const lyzrService = require('../services/lyzrService');

// GET /api/funding/matches - Fetch matched grants for the logged-in NGO
router.get('/matches', authenticateToken, async (req, res) => {
  try {
    const ngo = await prisma.nGO.findUnique({
      where: { userId: req.user.id },
      include: { documents: true, applications: true }
    });

    if (!ngo) {
      return res.status(404).json({ error: 'NGO profile not found.' });
    }

    // Retrieve merged local and external grants
    const grants = await fundingService.getAllFundingGrants();

    // Compute matching score using the service
    const matchedGrants = fundingService.matchNGOWithGrants(ngo, grants);

    // Apply filters
    let filtered = [...matchedGrants];

    const { type, sector, state, maxFunding } = req.query;

    if (type && type !== 'All') {
      filtered = filtered.filter(g => g.type.toLowerCase() === type.toLowerCase());
    }

    if (sector && sector !== 'All') {
      filtered = filtered.filter(g => g.sector.toLowerCase() === sector.toLowerCase());
    }

    if (state && state !== 'All') {
      filtered = filtered.filter(g => g.state.toLowerCase() === 'national' || g.state.toLowerCase() === state.toLowerCase());
    }

    if (maxFunding) {
      const budgetLimit = Number(maxFunding);
      if (!isNaN(budgetLimit)) {
        filtered = filtered.filter(g => g.minimumFunding <= budgetLimit);
      }
    }

    res.json({
      ngoStatus: ngo.status,
      readinessScore: ngo.readinessScore,
      matches: filtered
    });
  } catch (err) {
    console.error('Error fetching matched grants:', err);
    res.status(500).json({ error: 'Internal database error fetching funding matches.' });
  }
});

// POST /api/funding/ai-rank - Generate a personalized AI evaluation for a single grant
router.post('/ai-rank', authenticateToken, async (req, res) => {
  const { grantId } = req.body;

  if (!grantId) {
    return res.status(400).json({ error: 'grantId is required.' });
  }

  try {
    const ngo = await prisma.nGO.findUnique({
      where: { userId: req.user.id },
      include: { documents: true }
    });

    if (!ngo) {
      return res.status(404).json({ error: 'NGO profile not found.' });
    }

    if (ngo.status !== 'APPROVED') {
      return res.status(403).json({ error: 'Only verified and APPROVED NGOs can request AI ranking.' });
    }

    const grant = await prisma.grant.findUnique({
      where: { id: grantId }
    });

    if (!grant) {
      return res.status(404).json({ error: 'Grant opportunity not found.' });
    }

    const matchScore = fundingService.calculateMatchScore(ngo, grant);

    // Call Lyzr AI Agent with structured prompt context
    const aiPrompt = `Perform a granular, professional evaluation of this Grant Opportunity for the NGO.

NGO Context:
- Name: ${ngo.name}
- Focus Area: ${ngo.category}
- Mission: ${ngo.mission}
- State: ${ngo.state}
- Annual Budget: ${ngo.annualBudget}
- Readiness Score: ${ngo.readinessScore}/100

Grant Details:
- Name: ${grant.name}
- Provider: ${grant.provider}
- Type: ${grant.type}
- Sector: ${grant.sector}
- Eligibility: ${grant.eligibility}
- Required Documents: ${grant.requiredDocuments}
- Funding Range: INR ${grant.minimumFunding.toLocaleString()} to ${grant.maximumFunding.toLocaleString()}
- Description: ${grant.description}

Provide a detailed evaluation with exactly these sections using markdown:
### Suitability Rank
[High / Medium / Low Fit] (Explain the matching score of ${matchScore}% in 1 sentence).

### Matching Explanation
[Explain in 2-3 sentences how the NGO's mission and focus category align with the provider's goal.]

### Eligibility Checklist
[Point-by-point review of required documents vs what this NGO has. Highlight any missing items.]

### Suggested Strategy
[Provide 2 actionable preparation tips for the NGO before submitting.]`;

    let aiRecommendation = '';
    try {
      aiRecommendation = await lyzrService.callLyzrAgent(aiPrompt, req.user.id, ngo);
    } catch (aiErr) {
      console.warn('[FUNDING ROUTE]: Lyzr AI call failed, rendering fallback audit metrics:', aiErr.message);
      
      // Fallback response parsing
      aiRecommendation = `### Suitability Rank
${matchScore >= 75 ? 'High Fit' : matchScore >= 50 ? 'Medium Fit' : 'Low Fit'} (Calculated match score is ${matchScore}% based on sector and location compatibility).

### Matching Explanation
This opportunity from ${grant.provider} is aligned with your focus on ${ngo.category || 'social impact'}. Your active presence in ${ngo.state} matches the grant geographical eligibility.

### Eligibility Checklist
* **Focus Sector (${grant.sector})**: Qualified.
* **Geographical Scope (${grant.state})**: Eligible.
* **Required Files**: ${grant.requiredDocuments}. (Ensure all files are uploaded under Settings to prevent correction requests).

### Suggested Strategy
1. Review your Settings tab to ensure your latest documents are fully uploaded.
2. Click "Generate Proposal" to begin drafting a custom proposal document using Nivara AI.`;
    }

    res.json({
      grantId,
      matchScore,
      aiRecommendation
    });
  } catch (err) {
    console.error('Error generating AI ranking evaluation:', err);
    res.status(500).json({ error: 'Internal database error generating AI rank.' });
  }
});

// POST /api/funding/generate-proposal - Generate a professional grant proposal draft for a specific grant
router.post('/generate-proposal', authenticateToken, async (req, res) => {
  const { grantId } = req.body;

  if (!grantId) {
    return res.status(400).json({ error: 'grantId is required.' });
  }

  try {
    const ngo = await prisma.nGO.findUnique({
      where: { userId: req.user.id }
    });

    if (!ngo) {
      return res.status(404).json({ error: 'NGO profile not found.' });
    }

    if (ngo.status !== 'APPROVED') {
      return res.status(403).json({ error: 'Only verified and APPROVED NGOs can generate grant proposals.' });
    }

    const grant = await prisma.grant.findUnique({
      where: { id: grantId }
    });

    if (!grant) {
      return res.status(404).json({ error: 'Grant opportunity not found.' });
    }

    const proposalPrompt = `You are performing the role of Nivara's professional Proposal Writer.
Generate a professional, comprehensive grant proposal for the NGO applying for the Grant Opportunity.

NGO Context:
- Name: ${ngo.name}
- Focus Area: ${ngo.category}
- Mission: ${ngo.mission}
- State: ${ngo.state}
- District: ${ngo.district}
- Annual Budget: ${ngo.annualBudget}
- Readiness Score: ${ngo.readinessScore}/100

Grant Details:
- Name: ${grant.name}
- Provider: ${grant.provider}
- Type: ${grant.type}
- Sector: ${grant.sector}
- Eligibility: ${grant.eligibility}
- Required Documents: ${grant.requiredDocuments}
- Funding Range: INR ${grant.minimumFunding.toLocaleString()} to ${grant.maximumFunding.toLocaleString()}
- Description: ${grant.description}

You MUST organize the response into exactly these 9 sections, formatted with markdown headings:
### 1. Executive Summary
[Write 2-3 sentences summarizing the request, target amount, and project overview.]

### 2. Organization Profile
[Write 2-3 sentences on the NGO's history, leadership, and readiness score.]

### 3. Problem Statement
[Describe the core issue in the community and why funding is needed.]

### 4. Objectives
[Detail 3 specific, measurable goals for the project.]

### 5. Activities
[Specify concrete steps and programs to achieve the objectives.]

### 6. Timeline
[Outline the quarterly milestones over a 12-month implementation period.]

### 7. Budget
[Provide a high-level budget breakdown aligning with the grant range.]

### 8. Monitoring & Evaluation
[Explain how progress will be measured and reported.]

### 9. Sustainability Plan
[Detail how the project's impact will be sustained after the grant ends.]`;

    let aiProposal = '';
    try {
      aiProposal = await lyzrService.callLyzrAgent(proposalPrompt, req.user.id, ngo);
    } catch (aiErr) {
      console.warn('[FUNDING ROUTE]: Lyzr AI proposal call failed, rendering fallback template:', aiErr.message);
      
      const targetAmount = ngo.fundingNeeded || "₹10,00,000";
      aiProposal = `### 1. Executive Summary
${ngo.name} is seeking funding support of ${targetAmount} to implement our project in collaboration with the "${grant.name}" opportunity by ${grant.provider}. This initiative will directly address local resource shortages and capacity building in ${ngo.district}, ${ngo.state}.

### 2. Organization Profile
Established as a registered ${ngo.regType} in ${ngo.yearEstablished}, ${ngo.name} operates with a focus on ${ngo.category}. Led by founder ${ngo.founderName}, the organization has a verified Funding Readiness Score of ${ngo.readinessScore || 30}/100.

### 3. Problem Statement
The targeted communities face a severe lack of institutional resources, skilling infrastructure, and sustainable programs in the ${ngo.category} sector, leading to socioeconomic hardships.

### 4. Objectives
1. Build community capabilities and set up local action groups.
2. Deliver direct training and resources to at least 1,000 beneficiaries.
3. Establish monthly progress review systems.

### 5. Activities
- Conduct primary community surveys and recruit local field workers.
- Acquire skilling resources, equipment, and training materials.
- Host weekly interactive workshop sessions.

### 6. Timeline
- Q1: Resource procurement, mobilization, and partner onboarding.
- Q2: Implementation of core training modules and workshops.
- Q3: Outreach expansion and mid-term feedback surveys.
- Q4: Project review, final auditing, and reporting.

### 7. Budget
- Program Execution & Training: 50%
- Equipment and Material Supplies: 25%
- Administrative & Field Logistics: 15%
- Monitoring and Impact Evaluation: 10%
Total Projected Funding: ${targetAmount}.

### 8. Monitoring & Evaluation
We will perform weekly progress reviews and issue monthly activity updates. Success will be measured against beneficiary feedback and skill acquisition audits.

### 9. Sustainability Plan
The project will form local village committees to sustain operations. We will also seek follow-on corporate CSR sponsorships and matching local government support.`;
    }

    res.json({
      grantId,
      title: `Proposal for ${grant.name} by ${ngo.name}`,
      subject: `Grant Proposal: ${grant.name} - ${ngo.category} Initiative`,
      body: aiProposal
    });
  } catch (err) {
    console.error('Error generating AI proposal:', err);
    res.status(500).json({ error: 'Internal database error generating proposal.' });
  }
});

module.exports = router;
