const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'nivara_super_secret_key_123_change_this_in_production';

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
}).fields([
  { name: 'regCert', maxCount: 1 },
  { name: 'panDoc', maxCount: 1 },
  { name: 'trustCert', maxCount: 1 },
  { name: 'annualReport', maxCount: 1 },
  { name: 'financialReport', maxCount: 1 },
  { name: 'ngoPhotos', maxCount: 5 }
]);

// 1. POST /api/auth/register (NGO signup)
router.post('/register', (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error('File upload error:', err);
      return res.status(400).json({ error: 'File upload failed: ' + err.message });
    }

    try {
      const {
        // Auth details
        email,
        password,
        
        // Org details
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
        
        // Contact details
        founderName,
        mobile,
        
        // Funding details
        annualBudget,
        currentFunding,
        fundingNeeded
      } = req.body;

      // Basic validations
      if (!email || !password || !name || !regNumber || !regType || !category || !yearEstablished || !address || !state || !district || !pinCode || !founderName || !mobile || !annualBudget || !currentFunding || !fundingNeeded) {
        return res.status(400).json({ error: 'Please fill in all required fields.' });
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'Email is already registered.' });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Save user & NGO in a single database transaction
      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email,
            passwordHash,
            role: 'NGO'
          }
        });

        const ngo = await tx.nGO.create({
          data: {
            userId: user.id,
            name,
            regNumber,
            regType,
            category,
            yearEstablished: parseInt(yearEstablished, 10),
            website: website || null,
            address,
            state,
            district,
            pinCode,
            founderName,
            email,
            mobile,
            annualBudget,
            currentFunding,
            fundingNeeded,
            status: 'PENDING'
          }
        });

        // Store upload file documents
        const documentsData = [];
        const docFields = ['regCert', 'panDoc', 'trustCert', 'annualReport', 'financialReport'];
        
        docFields.forEach(field => {
          if (req.files && req.files[field] && req.files[field][0]) {
            const file = req.files[field][0];
            documentsData.push({
              ngoId: ngo.id,
              name: file.originalname,
              type: field.toUpperCase(),
              url: `/uploads/${file.filename}`
            });
          }
        });

        if (req.files && req.files['ngoPhotos']) {
          req.files['ngoPhotos'].forEach(file => {
            documentsData.push({
              ngoId: ngo.id,
              name: file.originalname,
              type: 'PHOTO',
              url: `/uploads/${file.filename}`
            });
          });
        }

        if (documentsData.length > 0) {
          await tx.document.createMany({
            data: documentsData
          });
        }

        return { user, ngo };
      });

      // Generate JWT Token
      const token = jwt.sign(
        { id: result.user.id, email: result.user.email, role: result.user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'NGO registered successfully and is pending verification.',
        token,
        user: { id: result.user.id, email: result.user.email, role: result.user.role },
        ngo: result.ngo
      });

    } catch (dbErr) {
      console.error('Registration Transaction Error:', dbErr);
      res.status(500).json({ error: 'Internal database error during registration.' });
    }
  });
});

// 2. POST /api/auth/register-citizen (Citizen signup)
router.post('/register-citizen', async (req, res) => {
  const { name, phone, email, password } = req.body;

  if (!name || !phone || !email || !password) {
    return res.status(400).json({ error: 'Please fill in all fields.' });
  }

  try {
    // Check if email or phone already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered.' });
    }

    const existingCitizen = await prisma.citizen.findUnique({ where: { phone } });
    if (existingCitizen) {
      return res.status(400).json({ error: 'Phone number is already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          role: 'CITIZEN'
        }
      });

      const citizen = await tx.citizen.create({
        data: {
          userId: user.id,
          name,
          phone
        }
      });

      return { user, citizen };
    });

    const token = jwt.sign(
      { id: result.user.id, email: result.user.email, role: result.user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Citizen registered successfully.',
      token,
      user: { id: result.user.id, email: result.user.email, role: result.user.role },
      citizen: result.citizen
    });
  } catch (err) {
    console.error('Citizen registration error:', err);
    res.status(500).json({ error: 'Internal server error during citizen registration.' });
  }
});

// 3. POST /api/auth/register-org (Organization signup)
router.post('/register-org', async (req, res) => {
  const { name, email, password, sector, regid } = req.body;

  if (!name || !email || !password || !sector || !regid) {
    return res.status(400).json({ error: 'Please fill in all fields.' });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered.' });
    }

    const existingOrg = await prisma.organization.findUnique({ where: { regid } });
    if (existingOrg) {
      return res.status(400).json({ error: 'Registration ID is already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          role: 'ORG'
        }
      });

      const organization = await tx.organization.create({
        data: {
          userId: user.id,
          name,
          sector,
          regid,
          status: 'PENDING'
        }
      });

      return { user, organization };
    });

    const token = jwt.sign(
      { id: result.user.id, email: result.user.email, role: result.user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Organization registered successfully and is pending verification.',
      token,
      user: { id: result.user.id, email: result.user.email, role: result.user.role },
      organization: result.organization
    });
  } catch (err) {
    console.error('Organization registration error:', err);
    res.status(500).json({ error: 'Internal server error during organization registration.' });
  }
});

// 4. POST /api/auth/login (NGO and User Login)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please enter email and password.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { 
        ngo: true,
        citizen: true,
        organization: true
      }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    // Block organization login if not verified (APPROVED)
    if (user.role === 'ORG' && user.organization && user.organization.status !== 'APPROVED') {
      return res.status(403).json({ error: 'Login Disabled: Your Organization profile has not been approved by the admin yet.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role },
      ngo: user.ngo || null,
      citizen: user.citizen || null,
      organization: user.organization || null
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// 5. POST /api/auth/admin-login
router.post('/admin-login', async (req, res) => {
  const { passcode } = req.body;

  if (!passcode) {
    return res.status(400).json({ error: 'Admin passcode is required.' });
  }

  const ADMIN_PASSCODE = 'NIVARA-ADMIN';

  if (passcode !== ADMIN_PASSCODE) {
    return res.status(401).json({ error: 'Incorrect admin passcode.' });
  }

  // Create a mock admin user token
  const token = jwt.sign(
    { id: 'admin-id', email: 'admin@nivara.org', role: 'ADMIN' },
    JWT_SECRET,
    { expiresIn: '2h' }
  );

  res.json({
    token,
    user: { id: 'admin-id', email: 'admin@nivara.org', role: 'ADMIN' }
  });
});

// In-memory store for reset codes: email -> { code, expires }
const resetCodes = new Map();

// 6. POST /api/auth/forgot-password - Generate password reset token
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email address is required.' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'No account found with this email address.' });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

    resetCodes.set(email, { code, expires });

    console.log(`[PASSWORD RESET] Generated reset code for ${email}: ${code}`);

    res.json({
      message: 'Password reset code generated successfully.',
      code // Returned directly in response for offline/mock visual testing
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Internal server error processing password reset.' });
  }
});

// 7. POST /api/auth/reset-password - Verify code and set new password
router.post('/reset-password', async (req, res) => {
  const { email, code, newPassword } = req.body;

  if (!email || !code || !newPassword) {
    return res.status(400).json({ error: 'Email, code, and new password are required.' });
  }

  try {
    const record = resetCodes.get(email);

    if (!record) {
      return res.status(400).json({ error: 'No active password reset request found for this email.' });
    }

    if (record.code !== code) {
      return res.status(400).json({ error: 'Invalid verification code.' });
    }

    if (Date.now() > record.expires) {
      resetCodes.delete(email);
      return res.status(400).json({ error: 'Verification code has expired. Please request a new one.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email },
      data: { passwordHash }
    });

    resetCodes.delete(email);

    res.json({ message: 'Password has been reset successfully. You can now log in.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Internal server error resetting password.' });
  }
});

module.exports = router;

