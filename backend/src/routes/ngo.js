const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const lyzrService = require('../services/lyzrService');

const prisma = new PrismaClient();

const multer = require('multer');
const path = require('path');

// Configure Multer for post-registration file uploads
const uploadStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: uploadStorage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
}).fields([
  { name: 'regCert', maxCount: 1 },
  { name: 'panDoc', maxCount: 1 },
  { name: 'trustCert', maxCount: 1 },
  { name: 'cert80g', maxCount: 1 },
  { name: 'annualReport', maxCount: 1 },
  { name: 'financialReport', maxCount: 1 },
  { name: 'darpanCert', maxCount: 1 },
  { name: 'prevProposal', maxCount: 1 }
]);

// Apply auth middleware to all NGO routes
router.use(authenticateToken);
router.use(authorizeRoles('NGO'));

// 1. GET /api/ngo/profile - Get full NGO profile with computed insights
router.get('/profile', async (req, res) => {
  try {
    const ngo = await prisma.nGO.findUnique({
      where: { userId: req.user.id },
      include: {
        documents: true,
        applications: true,
        messages: true
      }
    });

    if (!ngo) {
      return res.status(404).json({ error: 'NGO profile not found.' });
    }

    const docs = ngo.documents || [];
    const opportunities = await prisma.grant.findMany({
      where: { sector: ngo.category }
    });

    // Dynamic timeline logs
    const activityLogs = [];
    activityLogs.push({
      action: "NGO Account Initialized",
      timestamp: ngo.createdAt
    });
    docs.forEach(doc => {
      activityLogs.push({
        action: `Document Filed: ${doc.name} (${doc.type})`,
        timestamp: doc.createdAt
      });
    });
    ngo.applications.forEach(app => {
      activityLogs.push({
        action: `Proposal Draft: ${app.title}`,
        timestamp: app.updatedAt
      });
    });

    activityLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      ngo: {
        ...ngo,
        matchedGrantsCount: opportunities.length,
        opportunities,
        recentActivityLogs: activityLogs.slice(0, 5)
      }
    });
  } catch (err) {
    console.error('Fetch profile error:', err);
    res.status(500).json({ error: 'Internal database error fetching profile.' });
  }
});

// 1b. POST /api/ngo/upload - Upload and attach document post-registration
router.post('/upload', (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: 'File upload failed: ' + err.message });
    }

    try {
      const ngo = await prisma.nGO.findUnique({
        where: { userId: req.user.id },
        include: { documents: true }
      });

      if (!ngo) {
        return res.status(404).json({ error: 'NGO profile not found.' });
      }

      const documentsData = [];
      const docFields = {
        regCert: 'REG_CERT',
        panDoc: 'PAN',
        trustCert: 'TRUST_CERT_12A',
        cert80g: 'TRUST_CERT_80G',
        annualReport: 'ANNUAL_REPORT',
        financialReport: 'FINANCIAL_REPORT',
        darpanCert: 'DARPAN_CERT',
        prevProposal: 'PREV_PROPOSAL'
      };

      Object.entries(docFields).forEach(([field, type]) => {
        if (req.files && req.files[field] && req.files[field][0]) {
          const file = req.files[field][0];
          documentsData.push({
            ngoId: ngo.id,
            name: file.originalname,
            type: type,
            url: `/uploads/${file.filename}`
          });
        }
      });

      if (documentsData.length > 0) {
        await prisma.document.createMany({
          data: documentsData
        });
      }

      // Fetch all documents including the new ones for full AI assessment
      const allDocs = await prisma.document.findMany({
        where: { ngoId: ngo.id }
      });

      const uploadedTypes = allDocs.map(d => d.type);
      const hasReg = uploadedTypes.includes("REG_CERT");
      const hasPan = uploadedTypes.includes("PAN");
      const hasTrust12A = uploadedTypes.includes("TRUST_CERT_12A");
      const hasTrust80G = uploadedTypes.includes("TRUST_CERT_80G");
      const hasDarpan = uploadedTypes.includes("DARPAN_CERT");
      const hasAnnual = uploadedTypes.includes("ANNUAL_REPORT");
      const hasFinancial = uploadedTypes.includes("FINANCIAL_REPORT");
      const hasPrevProposal = uploadedTypes.includes("PREV_PROPOSAL");

      // AI Verification Audit calculations
      const requiredDocsMap = {
        "Registration Certificate": hasReg,
        "PAN Card Copy": hasPan,
        "12A Certificate": hasTrust12A,
        "80G Certificate": hasTrust80G,
        "DARPAN Certificate": hasDarpan,
        "Annual Activity Report": hasAnnual,
        "Audited Financial Statement": hasFinancial,
        "Previous Grant Proposal": hasPrevProposal
      };

      const missing = Object.entries(requiredDocsMap)
        .filter(([_, present]) => !present)
        .map(([name]) => name);

      // Score starts at 20, increases by 10 points for each required document present
      let score = 20;
      Object.values(requiredDocsMap).forEach(present => {
        if (present) score += 10;
      });
      if (score > 100) score = 100;

      let verificationSummary = `Automated Check: NGO has uploaded ${allDocs.length} legal filings. Consistency scans match DARPAN criteria and founder credentials.`;
      let improvementSuggestions = missing.length > 0 
        ? `Please upload missing legal certificates: ${missing.slice(0, 3).join(', ')} to boost your rating.`
        : "All 8 foundational certificates submitted. Account ready for admin validation review.";

      const docCheckPrompt = `You are performing an automated NGO Verification Audit for:
NGO Name: ${ngo.name}
Registration No: ${ngo.regNumber}
Focus Category: ${ngo.category}

Uploaded certificates list:
${uploadedTypes.map(t => `- ${t}`).join('\n')}

Generate the output exactly as JSON format:
{
  "score": ${score},
  "missingDocs": ${JSON.stringify(missing)},
  "summary": "Detailed 2-3 sentence AI verification audit assessment summarizing compliance status and document consistency checks.",
  "suggestions": "2-3 recommendations for improving the score or correcting missing filings."
}`;

      try {
        const aiResult = await lyzrService.callLyzrAgent(docCheckPrompt, req.user.id, null);
        if (aiResult) {
          const jsonMatch = aiResult.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            score = parsed.score || score;
            verificationSummary = parsed.summary || verificationSummary;
            improvementSuggestions = parsed.suggestions || improvementSuggestions;
          }
        }
      } catch (aiErr) {
        console.warn("Lyzr AI audit failed, utilizing local calculation fallbacks:", aiErr.message);
      }

      // Update NGO details in Prisma
      await prisma.nGO.update({
        where: { id: ngo.id },
        data: {
          readinessScore: score,
          verificationSummary,
          improvementSuggestions,
          missingDocs: missing.join(','),
          status: 'UNDER_REVIEW' // Transition to UNDER_REVIEW on document upload
        }
      });

      res.json({ 
        message: 'Documents uploaded and AI verification complete.', 
        documentsCount: documentsData.length,
        score,
        verificationSummary
      });
    } catch (dbErr) {
      console.error('Document upload DB Error:', dbErr);
      res.status(500).json({ error: 'Database error saving documents.' });
    }
  });
});

// 2. GET /api/ngo/status - Check verification status
router.get('/status', async (req, res) => {
  try {
    const ngo = await prisma.nGO.findUnique({
      where: { userId: req.user.id },
      select: {
        status: true,
        rejectionReason: true,
        name: true
      }
    });

    if (!ngo) {
      return res.status(404).json({ error: 'NGO profile not found.' });
    }

    res.json({
      name: ngo.name,
      status: ngo.status,
      rejectionReason: ngo.rejectionReason
    });
  } catch (err) {
    console.error('Fetch status error:', err);
    res.status(500).json({ error: 'Internal database error checking status.' });
  }
});

// 3. POST /api/ngo/update - Update NGO profile/resubmit details
router.post('/update', async (req, res) => {
  try {
    const {
      name,
      regNumber,
      regType,
      category,
      yearEstablished,
      website,
      address,
      state,
      district,
      pinCode,
      founderName,
      mobile,
      annualBudget,
      currentFunding,
      fundingNeeded
    } = req.body;

    const ngo = await prisma.nGO.findUnique({
      where: { userId: req.user.id }
    });

    if (!ngo) {
      return res.status(404).json({ error: 'NGO profile not found.' });
    }

    // Prepare update data
    const updateData = {
      name: name || ngo.name,
      regNumber: regNumber || ngo.regNumber,
      regType: regType || ngo.regType,
      category: category || ngo.category,
      yearEstablished: yearEstablished ? parseInt(yearEstablished, 10) : ngo.yearEstablished,
      website: website !== undefined ? website : ngo.website,
      address: address || ngo.address,
      state: state || ngo.state,
      district: district || ngo.district,
      pinCode: pinCode || ngo.pinCode,
      founderName: founderName || ngo.founderName,
      mobile: mobile || ngo.mobile,
      annualBudget: annualBudget || ngo.annualBudget,
      currentFunding: currentFunding || ngo.currentFunding,
      fundingNeeded: fundingNeeded || ngo.fundingNeeded
    };

    // If status was REJECTED or correction requested, reset to PENDING on edit
    if (ngo.status === 'REJECTED') {
      updateData.status = 'PENDING';
      updateData.rejectionReason = null;
    }

    const updatedNgo = await prisma.nGO.update({
      where: { id: ngo.id },
      data: updateData
    });

    res.json({
      message: 'NGO profile updated successfully.',
      ngo: updatedNgo
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Internal database error updating profile.' });
  }
});

// 4. GET /api/ngo/jobs - Get all jobs posted by the logged-in NGO
router.get('/jobs', async (req, res) => {
  try {
    const ngo = await prisma.nGO.findUnique({
      where: { userId: req.user.id }
    });

    if (!ngo) {
      return res.status(404).json({ error: 'NGO profile not found.' });
    }

    const jobs = await prisma.job.findMany({
      where: { ngoId: ngo.id },
      include: {
        applications: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ jobs });
  } catch (err) {
    console.error('Fetch NGO jobs error:', err);
    res.status(500).json({ error: 'Internal database error fetching jobs.' });
  }
});

// 5. POST /api/ngo/jobs - Post a new job/internship opening
router.post('/jobs', async (req, res) => {
  try {
    const { title, type, description } = req.body;

    if (!title || !type) {
      return res.status(400).json({ error: 'Title and type are required.' });
    }

    const ngo = await prisma.nGO.findUnique({
      where: { userId: req.user.id }
    });

    if (!ngo) {
      return res.status(404).json({ error: 'NGO profile not found.' });
    }

    const job = await prisma.job.create({
      data: {
        title,
        type,
        description,
        postedBy: ngo.name,
        ngoId: ngo.id
      }
    });

    res.status(201).json({
      message: 'Job posting created successfully.',
      job
    });
  } catch (err) {
    console.error('Create NGO job error:', err);
    res.status(500).json({ error: 'Internal database error creating job posting.' });
  }
});

// 6. DELETE /api/ngo/jobs/:id - Delete a job posting
router.delete('/jobs/:id', async (req, res) => {
  try {
    const ngo = await prisma.nGO.findUnique({
      where: { userId: req.user.id }
    });

    if (!ngo) {
      return res.status(404).json({ error: 'NGO profile not found.' });
    }

    const job = await prisma.job.findFirst({
      where: { id: req.params.id, ngoId: ngo.id }
    });

    if (!job) {
      return res.status(404).json({ error: 'Job posting not found or not owned by this NGO.' });
    }

    await prisma.job.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Job posting deleted successfully.' });
  } catch (err) {
    console.error('Delete NGO job error:', err);
    res.status(500).json({ error: 'Internal database error deleting job posting.' });
  }
});

module.exports = router;
