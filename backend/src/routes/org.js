const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const prisma = new PrismaClient();

// Apply auth middleware to all Organization routes
router.use(authenticateToken);
router.use(authorizeRoles('ORG'));

// 1. GET /api/org/profile - Get Organization profile
router.get('/profile', async (req, res) => {
  try {
    const org = await prisma.organization.findUnique({
      where: { userId: req.user.id }
    });

    if (!org) {
      return res.status(404).json({ error: 'Organization profile not found.' });
    }

    res.json({ org });
  } catch (err) {
    console.error('Fetch org profile error:', err);
    res.status(500).json({ error: 'Internal database error fetching org profile.' });
  }
});

// 2. POST /api/org/update - Update Org profile/resubmit details
router.post('/update', async (req, res) => {
  try {
    const { name, sector, regid } = req.body;

    const org = await prisma.organization.findUnique({
      where: { userId: req.user.id }
    });

    if (!org) {
      return res.status(404).json({ error: 'Organization profile not found.' });
    }

    const updateData = {
      name: name || org.name,
      sector: sector || org.sector,
      regid: regid || org.regid
    };

    // Reset status to PENDING if previously REJECTED
    if (org.status === 'REJECTED') {
      updateData.status = 'PENDING';
      updateData.rejectionReason = null;
    }

    const updatedOrg = await prisma.organization.update({
      where: { id: org.id },
      data: updateData
    });

    res.json({
      message: 'Organization profile updated successfully.',
      org: updatedOrg
    });
  } catch (err) {
    console.error('Update org profile error:', err);
    res.status(500).json({ error: 'Internal database error updating org profile.' });
  }
});

module.exports = router;
