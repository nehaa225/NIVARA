# NIVARA Refactoring Phase 2 - Implementation Checklist

## Critical Code Duplication to Remove

### Backend Duplicates

#### 1. Lyzr API Call Logic (2 instances)
**Location 1:** `backend/src/services/lyzrService.js` (CORRECT VERSION - KEEP THIS)
**Location 2:** `backend/src/routes/agents.js` (DUPLICATE - REMOVE)

**Action:** Remove Lyzr call logic from agents.js and import lyzrService instead
```javascript
// In agents.js, replace:
const callLyzrAgent = async (message, userId) => { ... }

// With:
const lyzrService = require('../services/lyzrService');
// Then use: lyzrService.callLyzrAgent(message, userId, ngo);
```

#### 2. JWT Authentication Logic (2 instances)
**Location 1:** `backend/src/middleware/auth.js` (CORRECT - KEEP THIS)
**Location 2:** `backend/src/routes/agents.js` (DUPLICATE - REMOVE)

**Action:** Remove auth logic from agents.js and use middleware
```javascript
// In agents.js, replace inline auth with middleware usage
router.post('/query', authenticateToken, asyncHandler(async (req, res) => { ... }));
```

#### 3. NGO Profile Fetching (Multiple instances)
**Files:** chatController.js, agents.js, various routes
**Action:** Replace all with:
```javascript
const NGORepository = require('../repositories/NGORepository');
const ngo = await NGORepository.findByUserId(req.user.userId);
```

#### 4. Grant Matching Logic (Multiple instances)
**Files:** chatController.js, routes/funding.js
**Action:** Replace with:
```javascript
const FundingService = require('../services/fundingService');
const matched = FundingService.matchNGOWithGrants(ngo, grants);
```

---

## Phase 2 Implementation Order

### STEP 1: Backend Cleanup (2-3 hours)

#### Task 1.1: Create Service Layer Abstraction
Create `backend/src/services/authService.js`:
```javascript
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const { ValidationError, AuthenticationError } = require('../exceptions/AppError');
const Logger = require('../utils/logger');

class AuthService {
  static async login(email, password) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new ValidationError('Invalid credentials');
    
    const isValid = await bcryptjs.compare(password, user.password);
    if (!isValid) throw new ValidationError('Invalid credentials');
    
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    return { token, role: user.role, email: user.email };
  }

  static async register(userData) {
    // Implementation
  }

  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new AuthenticationError('Invalid token');
    }
  }
}

module.exports = AuthService;
```

**Then update:** `backend/src/routes/auth.js`
```javascript
const AuthService = require('../services/authService');

router.post('/login', asyncHandler(async (req, res) => {
  const result = await AuthService.login(req.body.email, req.body.password);
  res.json(result);
}));
```

#### Task 1.2: Update All Routes to Use Repositories
Files to update:
- [ ] `backend/src/routes/ngo.js` - Use NGORepository
- [ ] `backend/src/routes/funding.js` - Use GrantRepository
- [ ] `backend/src/routes/auth.js` - Use AuthService
- [ ] `backend/src/routes/agents.js` - Remove duplicates, use services
- [ ] `backend/src/routes/admin.js` - Use repositories
- [ ] `backend/src/routes/community.js` - Use repositories
- [ ] `backend/src/routes/org.js` - Use repositories

**Pattern for each file:**
```javascript
const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError, ValidationError } = require('../exceptions/AppError');
const Logger = require('../utils/logger');
const NGORepository = require('../repositories/NGORepository');

const MODULE = 'NGO_ROUTES';

router.get('/:id', asyncHandler(async (req, res) => {
  Logger.info(MODULE, `Fetching NGO: ${req.params.id}`);
  try {
    const ngo = await NGORepository.findById(req.params.id);
    res.json(ngo);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return res.status(404).json({ error: error.message });
    }
    throw error;
  }
}));
```

#### Task 1.3: Update chatController.js
Replace inline agent logic with agent modules:
```javascript
const VerificationAgent = require('../services/agents/VerificationAgent');
const FundingAgent = require('../services/agents/FundingAgent');
const ProposalAgent = require('../services/agents/ProposalAgent');
const Logger = require('../utils/logger');

const MODULE = 'CHAT_CONTROLLER';

const handleChat = async (req, res) => {
  const { message, routingType } = req.body;
  const ngo = await NGORepository.findByUserId(req.user.userId);
  
  Logger.info(MODULE, `Chat received: ${routingType}`);
  
  try {
    switch (routingType) {
      case 'VERIFICATION':
        const verification = await VerificationAgent.processVerification(ngo, []);
        return res.json(verification);
      
      case 'FUNDING':
        const funding = await FundingAgent.findMatchedGrants(ngo);
        return res.json(funding);
      
      case 'PROPOSAL':
        // Handle proposal
        break;
    }
  } catch (error) {
    Logger.error(MODULE, `Error in chat: ${routingType}`, error);
    throw error;
  }
};

module.exports = { handleChat };
```

#### Task 1.4: Verify Backend Builds
```bash
cd backend
npm install --legacy-peer-deps
npm run prisma:generate
# If successful, verify routes:
npm test
# Or manually test with:
npm start
```

---

### STEP 2: Frontend Dashboard Refactoring (4-6 hours)

#### Task 2.1: Extract Component - AIAgentStudio
**Create:** `frontend/components/dashboard/AIAgentStudio.js`

```javascript
'use client';
import { useState, useEffect } from 'react';
import { useApi } from '@/lib/hooks';
import { chatApi } from '@/lib/services/api';

export default function AIAgentStudio({ ngoDetails }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const { execute: submitQuery, loading } = useApi(chatApi.submitQuery);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Get AI response
    try {
      const response = await submitQuery(input);
      const aiMessage = { role: 'assistant', content: response };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Query failed:', error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">AI Agent Studio</h2>
      
      <div className="border rounded-lg p-4 mb-4 h-96 overflow-y-auto">
        {messages.map((msg, i) => (
          <div key={i} className={`mb-2 p-2 rounded ${msg.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'}`}>
            {msg.content}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about grants, proposals, or compliance..."
          className="flex-1 p-2 border rounded"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}
```

#### Task 2.2: Extract Component - GrantsDiscovery
**Create:** `frontend/components/dashboard/GrantsDiscovery.js`

```javascript
'use client';
import { useState, useEffect } from 'react';
import { useApi } from '@/lib/hooks';
import { grantsApi } from '@/lib/services/api';

export default function GrantsDiscovery({ ngoId, ngoDetails }) {
  const [filters, setFilters] = useState({});
  const { execute: getMatches, data: grants = [], loading } = useApi(grantsApi.getMatches);

  useEffect(() => {
    getMatches(filters);
  }, [filters]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Matched Grants</h2>
      
      <div className="mb-6 grid grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Search..."
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          className="p-2 border rounded"
        />
        <select onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))} className="p-2 border rounded">
          <option value="">All Types</option>
          <option value="Government">Government</option>
          <option value="CSR">CSR</option>
          <option value="Foundation">Foundation</option>
        </select>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <p>Loading grants...</p>
        ) : grants.length === 0 ? (
          <p>No matching grants found</p>
        ) : (
          grants.map(grant => (
            <div key={grant.id} className="border p-4 rounded hover:shadow-lg">
              <h3 className="font-bold text-lg">{grant.name}</h3>
              <p className="text-gray-600">Provider: {grant.provider}</p>
              <p className="text-gray-600">Amount: ₹{grant.minimumFunding} - ₹{grant.maximumFunding}</p>
              <div className="mt-2 flex gap-2">
                <button className="px-3 py-1 bg-green-600 text-white rounded text-sm">
                  View Details
                </button>
                <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
                  Apply Now
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
```

#### Task 2.3: Extract Component - DocumentUpload
**Create:** `frontend/components/dashboard/DocumentUpload.js`

```javascript
'use client';
import { useState } from 'react';
import { useApi } from '@/lib/hooks';
import { ngoApi } from '@/lib/services/api';

export default function DocumentUpload({ ngoId }) {
  const [files, setFiles] = useState([]);
  const { execute: upload, loading } = useApi(ngoApi.uploadDocuments);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach((file, i) => {
      formData.append(`documents`, file);
    });

    try {
      const result = await upload(formData);
      alert('Documents uploaded successfully!');
      setFiles([]);
    } catch (error) {
      alert('Upload failed: ' + error.message);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Upload Documents</h2>
      
      <form onSubmit={handleUpload} className="border-2 border-dashed p-6 rounded">
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          className="mb-4"
          disabled={loading}
        />
        
        {files.length > 0 && (
          <div className="mb-4">
            <h3 className="font-semibold">Selected Files:</h3>
            <ul>
              {files.map(file => <li key={file.name}>{file.name}</li>)}
            </ul>
          </div>
        )}
        
        <button
          type="submit"
          disabled={files.length === 0 || loading}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          {loading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
    </div>
  );
}
```

#### Task 2.4: Extract Component - DashboardOverview
**Create:** `frontend/components/dashboard/DashboardOverview.js`

```javascript
'use client';

export default function DashboardOverview({ ngoDetails, statistics }) {
  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6">Dashboard</h2>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded">
          <h3 className="text-gray-600">Total Applications</h3>
          <p className="text-3xl font-bold">{statistics?.totalApplications || 0}</p>
        </div>
        <div className="bg-green-50 p-4 rounded">
          <h3 className="text-gray-600">Approved Grants</h3>
          <p className="text-3xl font-bold">{statistics?.approvedGrants || 0}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded">
          <h3 className="text-gray-600">Total Funding Received</h3>
          <p className="text-3xl font-bold">₹{statistics?.totalFunding || 0}</p>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-bold mb-2">Organization Profile</h3>
        <div className="bg-gray-50 p-4 rounded">
          <p><strong>Name:</strong> {ngoDetails?.name}</p>
          <p><strong>Category:</strong> {ngoDetails?.category}</p>
          <p><strong>State:</strong> {ngoDetails?.state}</p>
          <p><strong>Status:</strong> <span className={`px-2 py-1 rounded text-sm ${ngoDetails?.status === 'APPROVED' ? 'bg-green-200' : 'bg-yellow-200'}`}>{ngoDetails?.status}</span></p>
        </div>
      </div>
    </div>
  );
}
```

#### Task 2.5: Refactor dashboard/page.js
**Update:** `frontend/app/dashboard/page.js`

Replace entire file with:
```javascript
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useApi } from '@/lib/hooks';
import { ngoApi } from '@/lib/services/api';
import Navbar from '@/components/Navbar';
import DashboardOverview from '@/components/dashboard/DashboardOverview';
import AIAgentStudio from '@/components/dashboard/AIAgentStudio';
import GrantsDiscovery from '@/components/dashboard/GrantsDiscovery';
import DocumentUpload from '@/components/dashboard/DocumentUpload';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [ngoDetails, setNgoDetails] = useState(null);
  
  const { execute: getProfile, loading } = useApi(ngoApi.getProfile);

  useEffect(() => {
    checkAuth();
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    const loadProfile = async () => {
      try {
        const profile = await getProfile();
        setNgoDetails(profile);
      } catch (error) {
        console.error('Failed to load profile:', error);
      }
    };
    
    loadProfile();
  }, [isAuthenticated]);

  if (!isAuthenticated || loading) return <div>Loading...</div>;

  const tabs = ['overview', 'agents', 'grants', 'documents'];

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-gray-100">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">{ngoDetails?.name}</h2>
            <nav className="space-y-2">
              {tabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`w-full text-left p-3 rounded capitalize ${
                    activeTab === tab 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {tab === 'agents' ? 'AI Studio' : tab}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1">
          {activeTab === 'overview' && <DashboardOverview ngoDetails={ngoDetails} />}
          {activeTab === 'agents' && <AIAgentStudio ngoDetails={ngoDetails} />}
          {activeTab === 'grants' && <GrantsDiscovery ngoDetails={ngoDetails} />}
          {activeTab === 'documents' && <DocumentUpload ngoId={ngoDetails?.id} />}
        </div>
      </div>
    </>
  );
}
```

#### Task 2.6: Verify Frontend Builds
```bash
cd frontend
npm run build
```

---

## Testing Checklist

### Backend Testing
- [ ] `POST /api/auth/login` returns token
- [ ] `GET /api/ngo/profile` returns NGO data
- [ ] `GET /api/funding/matches` returns matched grants
- [ ] `POST /api/chat` returns AI response
- [ ] `POST /api/ngo/upload` handles file uploads
- [ ] All error responses use custom error format
- [ ] Logger outputs to console

### Frontend Testing  
- [ ] Login page works and redirects to dashboard
- [ ] Dashboard loads without errors
- [ ] AI Studio tab sends queries and receives responses
- [ ] Grants Discovery tab shows matched grants
- [ ] Document Upload tab accepts files
- [ ] All hooks (useApi, useAuth) work correctly
- [ ] API services correctly send auth tokens
- [ ] No JavaScript errors in console

### Integration Testing
- [ ] User can login → view dashboard → send AI query
- [ ] User can login → view matched grants → apply
- [ ] User can upload documents → see verification score
- [ ] Error messages display correctly on API failures

---

## Time Estimates
- Backend Cleanup: 2-3 hours
- Frontend Dashboard: 4-6 hours
- Testing & Fixes: 1-2 hours
- **Total Phase 2: ~8-11 hours**

## Support
Refer to REFACTORING_GUIDE.md for patterns and examples.
