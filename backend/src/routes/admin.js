const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const prisma = new PrismaClient();

// Apply auth middleware to all admin routes
router.use(authenticateToken);
router.use(authorizeRoles('ADMIN'));

// 1. GET /api/admin/ngos - Fetch all registered NGOs and Organizations categorized by status
router.get('/ngos', async (req, res) => {
  try {
    const ngos = await prisma.nGO.findMany({
      include: { documents: true },
      orderBy: { createdAt: 'desc' }
    });

    const orgs = await prisma.organization.findMany({
      orderBy: { createdAt: 'desc' }
    });

    // Group NGOs by status
    const pendingNgos = ngos.filter(n => n.status === 'PENDING' || n.status === 'UNDER_REVIEW');
    const approvedNgos = ngos.filter(n => n.status === 'APPROVED');
    const rejectedNgos = ngos.filter(n => n.status === 'REJECTED');

    // Group Orgs by status
    const pendingOrgs = orgs.filter(o => o.status === 'PENDING');
    const approvedOrgs = orgs.filter(o => o.status === 'APPROVED');
    const rejectedOrgs = orgs.filter(o => o.status === 'REJECTED');

    // Simple analytics
    const analytics = {
      totalNgos: ngos.length,
      pendingNgos: pendingNgos.length,
      approvedNgos: approvedNgos.length,
      rejectedNgos: rejectedNgos.length,
      totalOrgs: orgs.length,
      pendingOrgs: pendingOrgs.length,
      approvedOrgs: approvedOrgs.length,
      rejectedOrgs: rejectedOrgs.length
    };

    res.json({
      analytics,
      ngos: {
        pending: pendingNgos,
        approved: approvedNgos,
        rejected: rejectedNgos
      },
      orgs: {
        pending: pendingOrgs,
        approved: approvedOrgs,
        rejected: rejectedOrgs
      }
    });
  } catch (err) {
    console.error('Admin fetch NGOs/Orgs error:', err);
    res.status(500).json({ error: 'Internal database error fetching profiles.' });
  }
});

// 2. POST /api/admin/verify - Approve or Reject an NGO
router.post('/verify', async (req, res) => {
  const { ngoId, action, reason } = req.body;

  if (!ngoId || !['APPROVE', 'REJECT'].includes(action)) {
    return res.status(400).json({ error: 'Valid ngoId and action (APPROVE or REJECT) are required.' });
  }

  try {
    const ngo = await prisma.nGO.findUnique({
      where: { id: ngoId }
    });

    if (!ngo) {
      return res.status(404).json({ error: 'NGO profile not found.' });
    }

    const finalStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';

    const updatedNgo = await prisma.nGO.update({
      where: { id: ngoId },
      data: {
        status: finalStatus,
        rejectionReason: action === 'REJECT' ? (reason || 'Details do not match official records.') : null
      }
    });

    // Create a system notification for the NGO user
    await prisma.notification.create({
      data: {
        userId: ngo.userId,
        title: action === 'APPROVE' ? 'NGO Verification Approved!' : 'NGO Verification Corrections Needed',
        message: action === 'APPROVE' 
          ? 'Congratulations, your organization has been verified and you now have full access to Nivara.'
          : `Your submission needs updates. Reason: ${reason || 'Details do not match official records.'}`
      }
    });

    res.json({
      message: `NGO successfully ${finalStatus.toLowerCase()}.`,
      ngo: updatedNgo
    });
  } catch (err) {
    console.error('Admin verification update error:', err);
    res.status(500).json({ error: 'Internal database error updating verification status.' });
  }
});

// 3. POST /api/admin/verify-org - Approve or Reject an Organization
router.post('/verify-org', async (req, res) => {
  const { orgId, action, reason } = req.body;

  if (!orgId || !['APPROVE', 'REJECT'].includes(action)) {
    return res.status(400).json({ error: 'Valid orgId and action (APPROVE or REJECT) are required.' });
  }

  try {
    const org = await prisma.organization.findUnique({
      where: { id: orgId }
    });

    if (!org) {
      return res.status(404).json({ error: 'Organization profile not found.' });
    }

    const finalStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';

    const updatedOrg = await prisma.organization.update({
      where: { id: orgId },
      data: {
        status: finalStatus,
        rejectionReason: action === 'REJECT' ? (reason || 'Details do not match official records.') : null
      }
    });

    // Create a system notification for the Org user
    await prisma.notification.create({
      data: {
        userId: org.userId,
        title: action === 'APPROVE' ? 'Organization Verification Approved!' : 'Organization Verification Corrections Needed',
        message: action === 'APPROVE' 
          ? 'Congratulations, your organization has been verified and you now have full access to Nivara.'
          : `Your submission needs updates. Reason: ${reason || 'Details do not match official records.'}`
      }
    });

    res.json({
      message: `Organization successfully ${finalStatus.toLowerCase()}.`,
      org: updatedOrg
    });
  } catch (err) {
    console.error('Admin org verification update error:', err);
    res.status(500).json({ error: 'Internal database error updating organization verification status.' });
  }
});

module.exports = router;
// Trigger nodemon restart check

