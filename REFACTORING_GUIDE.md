# NIVARA Project Refactoring Guide

## Phase 1 Completion Summary (TODAY)

### What Was Created

#### Backend Architecture Foundation
**Error Handling System**
- Custom error classes for all scenarios (AppError, ValidationError, AuthenticationError, etc.)
- Consistent error responses across all routes
- Location: `backend/src/exceptions/AppError.js`

**Logging System**
- Centralized structured logging with levels (ERROR, WARN, INFO, DEBUG)
- Used throughout all services and utilities
- Location: `backend/src/utils/logger.js`

**Async Error Handler**
- Middleware wrapper for async route handlers
- Prevents unhandled promise rejections
- Location: `backend/src/utils/asyncHandler.js`

**Data Access Layer (Repository Pattern)**
```
NGORepository     - All NGO database operations
GrantRepository   - All Grant database operations  
ApplicationRepository - All Application database operations
```
Benefits: 
- Centralized data access
- Easy to test
- Decoupled from routes
- Easy to add caching later

**AI Agent Modules**
```
VerificationAgent - Document verification (30% complete)
FundingAgent      - Grant matching (30% complete)
ProposalAgent     - Proposal generation (30% complete)
```
Still needed: BudgetAgent, ReviewerAgent, DonationAgent, CareerAgent, ImpactAgent, LearningAgent, TrackingAgent

#### Frontend Architecture Foundation
**API Service Layer**
- `ApiService.js` - Base HTTP client with auth token handling
- `api.js` - Business services (ngo, grants, chat, auth)
- All API calls now go through services, not scattered in components

**Custom React Hooks**
- `useApi()` - Generic API call wrapper with loading/error states
- `useAuth()` - Authentication state management
- `useFormState()` - Form state and validation

**Utilities**
- `pdfExport.js` - PDF generation for proposals and reports
- Markdown parsing for AI-generated content
- Reusable across all pages

### Folder Structure
```
backend/
├── src/
│   ├── services/agents/          (NEW) AI agent modules
│   ├── repositories/             (NEW) Data access layer
│   ├── utils/                    (NEW) Utilities
│   ├── config/                   (NEW) Configuration
│   ├── constants/                (NEW) Constants
│   ├── exceptions/               (NEW) Error classes
│   ├── controllers/              (EXISTING)
│   ├── middleware/               (EXISTING)
│   ├── routes/                   (EXISTING)
│   └── services/                 (EXISTING)

frontend/
├── lib/                          (NEW) Reusable code
│   ├── hooks/                    (NEW) Custom React hooks
│   ├── services/                 (NEW) API services
│   └── utils/                    (NEW) Utilities
├── components/
│   ├── dashboard/                (NEW) Dashboard sub-components
│   ├── agents/                   (NEW) Agent UI components
│   ├── grants/                   (NEW) Grants components
│   └── common/                   (NEW) Shared components
└── app/                          (EXISTING) Next.js pages
```

---

## Phase 2 Action Items (Next)

### Backend Integration (Highest Priority)

#### 1. Update Routes to Use Repositories
**File: `backend/src/routes/funding.js`**
```javascript
// Replace this:
const grants = await prisma.grant.findMany();

// With this:
const GrantRepository = require('../repositories/GrantRepository');
const grants = await GrantRepository.findAll();
```

**File: `backend/src/routes/ngo.js`** (if exists)
Use NGORepository for all NGO queries

**File: `backend/src/routes/auth.js`**
Replace direct Prisma calls with repositories

#### 2. Update Controllers to Use Error Classes
**File: `backend/src/controllers/chatController.js`**
```javascript
// Import error classes
const { ValidationError, NotFoundError, ExternalServiceError } = require('../exceptions/AppError');
const Logger = require('../utils/logger');

// Replace generic error handling with:
try {
  // ... code
  throw new ValidationError('Missing required fields', { fields: missing });
} catch (error) {
  if (error instanceof ValidationError) {
    return res.status(400).json({ error: error.message, details: error.details });
  }
  throw error;
}
```

#### 3. Update Routes to Use asyncHandler
**File: `backend/src/routes/funding.js`**
```javascript
const asyncHandler = require('../utils/asyncHandler');

// Replace:
router.get('/matches', async (req, res) => { ... })

// With:
router.get('/matches', asyncHandler(async (req, res) => { ... }))
```

#### 4. Integrate Agent Modules into Controller
**File: `backend/src/controllers/chatController.js`**
```javascript
const VerificationAgent = require('../services/agents/VerificationAgent');
const FundingAgent = require('../services/agents/FundingAgent');
const ProposalAgent = require('../services/agents/ProposalAgent');

// Replace inline agent logic with:
if (routingType === 'VERIFICATION') {
  const result = await VerificationAgent.processVerification(ngo, documents);
}
```

### Frontend Refactoring (Highest Priority)

#### 1. Split Dashboard Page
**File: `frontend/app/dashboard/page.js` (2000+ lines)**

Create new components in `frontend/components/dashboard/`:

**AIAgentStudio.js** - Chat interface
```javascript
import { useApi } from '@/lib/hooks';
import { chatApi } from '@/lib/services/api';
import { useState, useEffect } from 'react';

export default function AIAgentStudio({ ngoDetails }) {
  const { execute: submitQuery, loading } = useApi(chatApi.submitQuery);
  // Component logic here
}
```

**GrantsDiscovery.js** - Grants search/filter
```javascript
import { useApi } from '@/lib/hooks';
import { grantsApi } from '@/lib/services/api';

export default function GrantsDiscovery({ ngoId }) {
  const { execute: getMatches, data: grants, loading } = useApi(grantsApi.getMatches);
  // Component logic here
}
```

**ProposalEditor.js** - Edit proposals
```javascript
import { useApi, useFormState } from '@/lib/hooks';
import { chatApi } from '@/lib/services/api';

export default function ProposalEditor({ grantId }) {
  const { values, handleChange } = useFormState({ title: '', body: '' });
  // Component logic here
}
```

**DocumentUpload.js** - File uploads
```javascript
import { useApi } from '@/lib/hooks';
import { ngoApi } from '@/lib/services/api';

export default function DocumentUpload({ ngoId }) {
  const { execute: upload, loading } = useApi(ngoApi.uploadDocuments);
  // Component logic here
}
```

**DashboardOverview.js** - Stats/activity
```javascript
export default function DashboardOverview({ ngoDetails, applications }) {
  // Stats and overview here
}
```

**Updated dashboard/page.js**
```javascript
'use client';
import { useAuth } from '@/lib/hooks';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AIAgentStudio from '@/components/dashboard/AIAgentStudio';
import GrantsDiscovery from '@/components/dashboard/GrantsDiscovery';
import ProposalEditor from '@/components/dashboard/ProposalEditor';
import DocumentUpload from '@/components/dashboard/DocumentUpload';
import DashboardOverview from '@/components/dashboard/DashboardOverview';

export default function Dashboard() {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    checkAuth();
    if (!isAuthenticated) router.push('/login');
  }, []);

  return (
    <div>
      {/* Tab navigation */}
      {activeTab === 'overview' && <DashboardOverview />}
      {activeTab === 'agents' && <AIAgentStudio />}
      {activeTab === 'grants' && <GrantsDiscovery />}
      {activeTab === 'proposal' && <ProposalEditor />}
      {activeTab === 'upload' && <DocumentUpload />}
    </div>
  );
}
```

#### 2. Update Login Page
**File: `frontend/app/login/page.js`**
```javascript
'use client';
import { authApi } from '@/lib/services/api';
import { useAuth, useFormState } from '@/lib/hooks';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const { values, handleChange } = useFormState({ email: '', password: '' });
  
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const result = await authApi.login(values.email, values.password);
      localStorage.setItem('token', result.token);
      localStorage.setItem('role', result.role);
      router.push('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
  
  return (
    // Login form using values and handleChange
  );
}
```

---

## How to Apply These Changes

### Step 1: Run Install (Fix Prisma)
```bash
cd backend
npm install --legacy-peer-deps
npm run prisma:generate
```

### Step 2: Update Backend Routes (One at a Time)
Start with `backend/src/routes/funding.js`:
1. Add imports for repositories and error classes
2. Wrap route handlers with asyncHandler
3. Replace Prisma calls with repository methods
4. Test: `npm test` or manually with Postman

### Step 3: Update Controllers
Update `backend/src/controllers/chatController.js`:
1. Add imports for repositories, error classes, and agent modules
2. Replace inline agent logic with agent module calls
3. Use Logger for debugging

### Step 4: Refactor Frontend Dashboard
This is the biggest change:
1. Create component files one by one
2. Move state logic from dashboard/page.js to components
3. Use hooks for shared state (useApi, useAuth, useFormState)
4. Import API services from lib/services/api.js
5. Test each component independently

### Step 5: Verify & Test
- Backend: Run all routes with Postman
- Frontend: Test dashboard, login, grants discovery
- Check browser console for errors
- Verify all functionality still works

---

## Files Already Created

### Backend
✅ `backend/src/exceptions/AppError.js`
✅ `backend/src/utils/logger.js`
✅ `backend/src/utils/asyncHandler.js`
✅ `backend/src/constants/documentTypes.js`
✅ `backend/src/constants/ngoStatus.js`
✅ `backend/src/repositories/NGORepository.js`
✅ `backend/src/repositories/GrantRepository.js`
✅ `backend/src/repositories/ApplicationRepository.js`
✅ `backend/src/services/agents/VerificationAgent.js`
✅ `backend/src/services/agents/FundingAgent.js`
✅ `backend/src/services/agents/ProposalAgent.js`

### Frontend
✅ `frontend/lib/services/ApiService.js`
✅ `frontend/lib/services/api.js`
✅ `frontend/lib/hooks/index.js`
✅ `frontend/lib/utils/pdfExport.js`
✅ Folder structure for `frontend/components/dashboard/`, `agents/`, `grants/`, `common/`

---

## Common Patterns to Follow

### Error Handling Pattern
```javascript
const { ValidationError, NotFoundError } = require('../exceptions/AppError');

try {
  const user = await UserRepository.findById(id);
  if (!user) throw new NotFoundError('User', id);
  return res.json(user);
} catch (error) {
  if (error instanceof NotFoundError) {
    return res.status(error.statusCode).json({ error: error.message });
  }
  throw error;
}
```

### Logging Pattern
```javascript
const Logger = require('../utils/logger');
const MODULE = 'MY_MODULE';

Logger.info(MODULE, 'Operation started', { data: value });
Logger.error(MODULE, 'Operation failed', error);
```

### Repository Usage Pattern
```javascript
const NGORepository = require('../repositories/NGORepository');

const ngo = await NGORepository.findByUserId(userId);
const updated = await NGORepository.update(ngoId, data);
```

### Frontend API Service Pattern
```javascript
import { useApi } from '@/lib/hooks';
import { ngoApi } from '@/lib/services/api';

const { execute: getProfile, data, loading, error } = useApi(ngoApi.getProfile);

useEffect(() => {
  getProfile();
}, []);
```

---

## Production Checklist

- [ ] All repositories integrated into routes
- [ ] All error handling using custom error classes
- [ ] All async routes wrapped with asyncHandler
- [ ] All logging using Logger module
- [ ] Agent modules imported into controller
- [ ] Dashboard split into components
- [ ] All API calls use services layer
- [ ] Authentication verified
- [ ] No console.log statements (use Logger)
- [ ] Error boundaries added to components
- [ ] TypeScript or JSDoc annotations added
- [ ] Performance optimized (no unnecessary re-renders)
- [ ] Tests written for critical functions
- [ ] Build passes without errors
- [ ] All features work end-to-end

---

## Quick Reference

**Base URLs for Import:**
- Repositories: `const Repo = require('../repositories/XxxRepository');`
- Error classes: `const { ValidationError } = require('../exceptions/AppError');`
- Logger: `const Logger = require('../utils/logger');`
- asyncHandler: `const asyncHandler = require('../utils/asyncHandler');`
- Hooks: `import { useApi, useAuth } from '@/lib/hooks';`
- API Services: `import { ngoApi, grantsApi } from '@/lib/services/api';`
- Utilities: `import { exportProposalPDF } from '@/lib/utils/pdfExport';`

---

## Support

If you encounter issues:
1. Check syntax with `get_errors` tool
2. Verify imports are correct
3. Check console logs for runtime errors
4. Review this guide for patterns
5. Test one component at a time
