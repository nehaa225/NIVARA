const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// GET /api/directory/ngos - Public list of approved/verified NGOs
router.get('/ngos', async (req, res) => {
  try {
    const ngos = await prisma.nGO.findMany({
      where: {
        status: 'APPROVED'
      },
      select: {
        id: true,
        name: true,
        category: true,
        yearEstablished: true,
        website: true,
        address: true,
        state: true,
        district: true,
        pinCode: true,
        founderName: true,
        email: true,
        mobile: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.json({ ngos });
  } catch (err) {
    console.error('Directory fetch NGOs error:', err);
    res.status(500).json({ error: 'Internal database error fetching public directory.' });
  }
});

module.exports = router;
