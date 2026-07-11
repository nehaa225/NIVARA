const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const prisma = new PrismaClient();

// Helper: Normalize location/area strings into unique word tokens
function normalizeWords(s) {
  return (s || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2);
}

// Helper: Nearest-NGO word-based match algorithm
function findNearestNgo(locationText, ngoList) {
  const locWords = new Set(normalizeWords(locationText));
  if (!locWords.size) return null;

  let bestNgo = null;
  let bestScore = 0;

  for (const ngo of ngoList) {
    const areaWords = normalizeWords(ngo.area);
    let score = 0;
    for (const w of areaWords) {
      if (locWords.has(w)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestNgo = ngo;
    }
  }

  return bestScore > 0 ? bestNgo : null;
}

// ==========================================
// 1. DONATIONS
// ==========================================

// POST /api/community/donations - Citizen or Org posts a donation item
router.post('/donations', async (req, res) => {
  const { category, title, pickupLocation, postedBy } = req.body;

  if (!category || !title || !pickupLocation || !postedBy) {
    return res.status(400).json({ error: 'Please provide all details: category, title, pickupLocation, postedBy.' });
  }

  try {
    // Load all approved/verified NGOs
    const approvedNgos = await prisma.nGO.findMany({
      where: { status: 'APPROVED' }
    });

    // Run nearest NGO word matching
    const match = findNearestNgo(pickupLocation, approvedNgos);
    const matchedNgoId = match ? match.id : null;

    // Create the donation record
    const donation = await prisma.donation.create({
      data: {
        category,
        title,
        pickupLocation,
        postedBy,
        matchedNgoId,
        status: 'PENDING'
      }
    });

    // If matched, issue system notification to that NGO
    if (match) {
      await prisma.notification.create({
        data: {
          userId: match.userId,
          title: 'Nearby Donation Match!',
          message: `A new donation item "${title}" has been posted in your area (${pickupLocation}) by ${postedBy}.`
        }
      });
    }

    res.status(201).json({
      message: match 
        ? `Donation posted. Matches near NGO "${match.name}".`
        : 'Donation posted. No matching NGO in that area yet.',
      donation,
      matchedNgoName: match ? match.name : null
    });

  } catch (err) {
    console.error('Post donation error:', err);
    res.status(500).json({ error: 'Internal database error posting donation.' });
  }
});

// GET /api/community/donations - Get all donations (optional filter by category)
router.get('/donations', async (req, res) => {
  const { category } = req.query;

  try {
    const filter = {};
    if (category && category !== 'all') {
      filter.category = category;
    }

    const donations = await prisma.donation.findMany({
      where: filter,
      include: {
        matchedNgo: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ donations });
  } catch (err) {
    console.error('Fetch donations error:', err);
    res.status(500).json({ error: 'Internal database error fetching donations.' });
  }
});

// POST /api/community/donations/claim - NGO claims a donation
router.post('/donations/claim', authenticateToken, async (req, res) => {
  const { donationId } = req.body;

  if (!donationId) {
    return res.status(400).json({ error: 'Donation ID is required.' });
  }

  try {
    const ngo = await prisma.nGO.findUnique({
      where: { userId: req.user.id }
    });

    if (!ngo || ngo.status !== 'APPROVED') {
      return res.status(403).json({ error: 'Only verified NGOs can claim donations.' });
    }

    const donation = await prisma.donation.findUnique({
      where: { id: donationId }
    });

    if (!donation) {
      return res.status(404).json({ error: 'Donation not found.' });
    }

    if (donation.status === 'CLAIMED') {
      return res.status(400).json({ error: 'Donation has already been claimed.' });
    }

    const updated = await prisma.donation.update({
      where: { id: donationId },
      data: {
        status: 'CLAIMED',
        matchedNgoId: ngo.id
      }
    });

    res.json({
      message: 'Donation claimed successfully.',
      donation: updated
    });
  } catch (err) {
    console.error('Claim donation error:', err);
    res.status(500).json({ error: 'Internal database error claiming donation.' });
  }
});

// ==========================================
// 2. EVENTS
// ==========================================

// POST /api/community/events - Organization posts an event inviting NGOs
router.post('/events', async (req, res) => {
  const { title, date, location, description, hostOrgName, invitedNgoIds } = req.body;

  if (!title || !location || !hostOrgName) {
    return res.status(400).json({ error: 'Title, location, and hostOrgName are required.' });
  }

  try {
    // invitedNgoIds can be array of NGO IDs, save as comma-separated string
    const ngoString = Array.isArray(invitedNgoIds) ? invitedNgoIds.join(',') : '';

    const event = await prisma.event.create({
      data: {
        title,
        date: date || null,
        location,
        description,
        hostOrgName,
        invitedNgos: ngoString,
        confirmedNgos: ''
      }
    });

    // Notify each invited NGO
    if (Array.isArray(invitedNgoIds)) {
      const invitedNgos = await prisma.nGO.findMany({
        where: { id: { in: invitedNgoIds } }
      });

      for (const ngo of invitedNgos) {
        await prisma.notification.create({
          data: {
            userId: ngo.userId,
            title: 'New Collaboration Invitation',
            message: `Organization "${hostOrgName}" invited your NGO to collaborate on the event "${title}".`
          }
        });
      }
    }

    res.status(201).json({
      message: 'Event posted successfully.',
      event
    });
  } catch (err) {
    console.error('Post event error:', err);
    res.status(500).json({ error: 'Internal database error posting event.' });
  }
});

// GET /api/community/events - List all events
router.get('/events', async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ events });
  } catch (err) {
    console.error('Fetch events error:', err);
    res.status(500).json({ error: 'Internal database error fetching events.' });
  }
});

// POST /api/community/events/confirm - NGO confirms collaboration on an event
router.post('/events/confirm', authenticateToken, async (req, res) => {
  const { eventId } = req.body;

  if (!eventId) {
    return res.status(400).json({ error: 'Event ID is required.' });
  }

  try {
    const ngo = await prisma.nGO.findUnique({
      where: { userId: req.user.id }
    });

    if (!ngo || ngo.status !== 'APPROVED') {
      return res.status(403).json({ error: 'Only verified NGOs can confirm collaboration.' });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    let confirmedList = event.confirmedNgos ? event.confirmedNgos.split(',') : [];
    if (confirmedList.includes(ngo.id)) {
      return res.status(400).json({ error: 'NGO already confirmed collaboration.' });
    }

    confirmedList.push(ngo.id);

    const updated = await prisma.event.update({
      where: { id: eventId },
      data: {
        confirmedNgos: confirmedList.join(',')
      }
    });

    res.json({
      message: 'Collaboration confirmed successfully.',
      event: updated
    });
  } catch (err) {
    console.error('Confirm collaboration error:', err);
    res.status(500).json({ error: 'Internal database error confirming collaboration.' });
  }
});

// ==========================================
// 3. JOBS
// ==========================================

// POST /api/community/jobs - NGO or Org posts a job opening
router.post('/jobs', async (req, res) => {
  const { title, type, description, postedBy } = req.body;

  if (!title || !type || !postedBy) {
    return res.status(400).json({ error: 'Title, type, and postedBy name are required.' });
  }

  try {
    const job = await prisma.job.create({
      data: {
        title,
        type,
        description,
        postedBy
      }
    });

    res.status(201).json({
      message: 'Job posting created.',
      job
    });
  } catch (err) {
    console.error('Post job error:', err);
    res.status(500).json({ error: 'Internal database error posting job.' });
  }
});

// GET /api/community/jobs - List all job openings
router.get('/jobs', async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      include: {
        applications: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ jobs });
  } catch (err) {
    console.error('Fetch jobs error:', err);
    res.status(500).json({ error: 'Internal database error fetching jobs.' });
  }
});

// POST /api/community/jobs/apply - Citizen applies for a job
router.post('/jobs/apply', async (req, res) => {
  const { jobId, applicantName, applicantPhone } = req.body;

  if (!jobId || !applicantName || !applicantPhone) {
    return res.status(400).json({ error: 'Job ID, applicantName, and applicantPhone are required.' });
  }

  try {
    const application = await prisma.jobApplication.create({
      data: {
        jobId,
        applicantName,
        applicantPhone
      }
    });

    res.status(201).json({
      message: 'Application submitted successfully.',
      application
    });
  } catch (err) {
    console.error('Job apply error:', err);
    res.status(500).json({ error: 'Internal database error submitting job application.' });
  }
});

module.exports = router;
