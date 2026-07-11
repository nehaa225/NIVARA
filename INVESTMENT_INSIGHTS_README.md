# Investment Insights Module Documentation

## Overview

The **Investment Insights** module is an independent, educational module that integrates with the **MFAPI** (Mutual Fund API) to provide NGOs, organizations, and citizens with real-time information about mutual funds. This module is completely separate from the NGO Grant Matching system and serves purely educational purposes.

**⚠️ Disclaimer:** This module is for informational and educational purposes only. It does not constitute investment advice. Past performance does not guarantee future results. Mutual fund investments are subject to market risks.

---

## Architecture

### Module Independence
- **Completely Isolated:** No dependencies on FundingService, Grant Matching, AI Agents, or Lyzr AI
- **Separate Database Tables:** MutualFund and NAVHistory tables
- **Dedicated API Routes:** `/api/mutual-funds` endpoints
- **Independent Frontend:** New "Investment Insights" dashboard page

### Technology Stack
- **Backend:** Node.js, Express, Prisma ORM, SQLite
- **Frontend:** Next.js 16, React, CSS Modules
- **External API:** MFAPI (https://api.mfapi.in)
- **Caching:** In-database caching with expiry tracking

---

## Database Schema

### MutualFund Table
```sql
model MutualFund {
  id                    String (Primary Key)
  schemeCode            String (Unique) -- Identifier from MFAPI
  schemeName            String         -- Official fund name
  category              String         -- Equity, Debt, Hybrid, etc.
  subcategory           String         -- Large Cap, Mid Cap, etc.
  fundHouse             String         -- AMC/Fund House Name
  launchDate            String
  status                String         -- Active, Closed, Inactive
  exitLoad              String
  expenseRatio          String
  benchmark             String
  riskProfile           String         -- Low, Moderate, High
  nav                   Decimal        -- Latest NAV
  returnOneYear         String         -- Performance data
  returnThreeYear       String
  returnFiveYear        String
  returnSinceInception  String
  lastSyncedAt          DateTime       -- Last update time
  cacheExpiredAt        DateTime       -- Cache expiry tracking
  navHistory            NAVHistory[]   -- Historical data
  createdAt             DateTime
  updatedAt             DateTime
}

model NAVHistory {
  id                String (Primary Key)
  mutualFundId      String (Foreign Key)
  navDate           String         -- Date of NAV entry
  nav               Decimal        -- NAV value
  createdAt         DateTime
  updatedAt         DateTime
  
  Unique: [mutualFundId, navDate]
}
```

---

## API Endpoints

### 1. List All Mutual Funds
**GET** `/api/mutual-funds`

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20, max: 100)
- `category`: Filter by category
- `fundHouse`: Filter by fund house
- `status`: Filter by status
- `riskProfile`: Filter by risk profile

**Response:**
```json
{
  "funds": [...],
  "total": 150,
  "page": 1,
  "pages": 8
}
```

### 2. Search Mutual Funds
**GET** `/api/mutual-funds/search?q=query`

**Query Parameters:**
- `q`: Search query (min 2 characters)

**Response:**
```json
{
  "results": [...]
}
```

### 3. Get Fund Details & NAV History
**GET** `/api/mutual-funds/:schemeCode`

**Response:**
```json
{
  "fund": {
    "id": "...",
    "schemeCode": "INF174K01DF8",
    "schemeName": "...",
    "category": "Equity",
    "nav": 125.45,
    "lastSyncedAt": "2026-07-11T...",
    "navHistory": [...]
  }
}
```

### 4. Get NAV History
**GET** `/api/mutual-funds/:schemeCode/nav-history?limit=30`

**Query Parameters:**
- `limit`: Number of historical records (default: 30, max: 365)

**Response:**
```json
{
  "schemeCode": "INF174K01DF8",
  "history": [
    {
      "id": "...",
      "navDate": "2026-07-11",
      "nav": "125.45"
    },
    ...
  ],
  "count": 30
}
```

### 5. Get Available Categories
**GET** `/api/mutual-funds/categories`

**Response:**
```json
{
  "categories": ["Equity", "Debt", "Hybrid", ...]
}
```

### 6. Get Available Fund Houses
**GET** `/api/mutual-funds/fund-houses`

**Response:**
```json
{
  "fundHouses": ["HDFC", "ICICI", "SBI", ...]
}
```

### 7. Compare Funds
**GET** `/api/mutual-funds/compare?codes=CODE1,CODE2,CODE3`

**Query Parameters:**
- `codes`: Comma-separated scheme codes

**Response:**
```json
{
  "comparison": [
    {
      "schemeCode": "CODE1",
      "schemeName": "...",
      "nav": 125.45,
      ...
    },
    ...
  ]
}
```

### 8. Check Service Health
**GET** `/api/mutual-funds/health`

**Response (Healthy):**
```json
{
  "status": "healthy",
  "apiAvailable": true,
  "timestamp": "2026-07-11T..."
}
```

**Response (Degraded - API Down):**
```json
{
  "status": "degraded",
  "apiAvailable": false,
  "message": "MFAPI unavailable, using cached data",
  "timestamp": "2026-07-11T..."
}
```

### 9. Manual Sync (Admin Only)
**POST** `/api/mutual-funds/sync`

**Response:**
```json
{
  "message": "Synchronization completed",
  "synced": 1500,
  "failed": 5,
  "total": 1505
}
```

---

## Frontend Components

### Page: `/investment-insights`
Main dashboard page with three tabs:

#### Tab 1: Browse Funds
- Display funds with pagination
- Filter by category, fund house, status, risk profile
- View fund cards with key metrics
- Click to see detailed view

#### Tab 2: Search Funds
- Search by name, code, or fund house
- Real-time search results
- View matching funds

#### Tab 3: Information
- Educational content about mutual funds
- Types of funds
- Understanding NAV
- Disclaimer

### Components:
- **FundsList.js** - Grid display of fund cards
- **FundSearch.js** - Search interface
- **FundFilters.js** - Filter options
- **FundDetailsModal.js** - Detailed fund view with NAV history chart

---

## Data Flow

### 1. Initial Data Load
```
MFAPI → MutualFundService.syncAllSchemesToDatabase()
    ↓
MutualFundRepository.upsert() → SQLite (MutualFund table)
```

### 2. User Browsing Funds
```
Frontend: /api/mutual-funds?page=1&limit=20
    ↓
MutualFundService.listMutualFunds()
    ↓
MutualFundRepository.findAll()
    ↓
SQLite Query → JSON Response → Frontend
```

### 3. Viewing Fund Details
```
Frontend: /api/mutual-funds/:schemeCode
    ↓
MutualFundService.getMutualFundDetails()
    ↓
Try API first (MFAPI) → Update DB
Fallback to DB cache if API fails
    ↓
MutualFundRepository.findBySchemeCode(includeHistory=true)
    ↓
Return fund with 30-day NAV history
```

### 4. API Fallback & Caching
```
API Call Fails
    ↓
Retry 3 times (2s delay between retries)
    ↓
If all retries fail:
    - Return cached data from database
    - Log warning to system
    - Return health status "degraded"
```

---

## Features

### ✅ Real-time Data
- Live NAV from MFAPI
- Automatic sync every 60 minutes
- Latest fund performance data

### ✅ Intelligent Caching
- Database caching for offline access
- Cache expiry tracking (60-minute default)
- Automatic fallback when API unavailable

### ✅ Retry Logic
- 3 automatic retries on API failure
- 2-second delay between retries
- Exponential backoff support

### ✅ Comprehensive Logging
- All operations logged with timestamps
- Error tracking and reporting
- Module-based categorization

### ✅ Search & Filter
- Full-text search by name/code/house
- Multiple filter options
- Pagination support

### ✅ Performance Data
- 1-year, 3-year, 5-year returns
- Since inception returns
- NAV history tracking

### ✅ Responsive Design
- Mobile-friendly interface
- Touch-optimized
- Fast load times

---

## Error Handling

### API Errors
```javascript
// MFAPI unavailable
Status: 503
Message: "MFAPI unavailable, using cached data"
Action: Fallback to database, return cached data
```

### Validation Errors
```javascript
// Invalid search query
Status: 400
Message: "Search query must be at least 2 characters"
```

### Not Found Errors
```javascript
// Scheme code not found
Status: 404
Message: "Mutual Fund with ID ABC123 not found"
```

---

## Configuration

### Environment Variables
```env
# Database (SQLite)
DATABASE_URL="file:./prisma/dev.db"

# Port
PORT=5000

# API Configuration is in MutualFundService
MFAPI_BASE_URL="https://api.mfapi.in"
RETRY_ATTEMPTS=3
RETRY_DELAY_MS=2000
SYNC_CACHE_MINUTES=60
```

### Service Constants
Located in `backend/src/constants/mutualFundConstants.js`:
- Fund categories
- Fund statuses
- Risk profiles
- NAV history limits
- MFAPI configuration

---

## Usage Examples

### Example 1: Browsing Equity Funds
```bash
GET /api/mutual-funds?category=Equity&limit=20&page=1
```

### Example 2: Searching for a Specific Fund
```bash
GET /api/mutual-funds/search?q=HDFC
```

### Example 3: Getting NAV History for Comparison
```bash
GET /api/mutual-funds/INF174K01DF8/nav-history?limit=90
```

### Example 4: Comparing Multiple Funds
```bash
GET /api/mutual-funds/compare?codes=INF174K01DF8,INF740K01321,INF209K01DF1
```

---

## Maintenance & Operations

### Regular Tasks

#### Daily
- Monitor API health via `/api/mutual-funds/health`
- Check database size
- Review error logs

#### Weekly
- Manual data sync: `POST /api/mutual-funds/sync`
- Verify cache effectiveness
- Update fund information

#### Monthly
- Archive old NAV history (>365 days)
- Database optimization
- Performance analysis

### Database Cleanup
```sql
-- Remove NAV history older than 1 year
DELETE FROM NAVHistory 
WHERE navDate < datetime('now', '-365 days');

-- Vacuum database
VACUUM;
```

### Monitoring Queries
```sql
-- Total funds in database
SELECT COUNT(*) FROM MutualFund;

-- Recently updated funds
SELECT * FROM MutualFund 
ORDER BY lastSyncedAt DESC LIMIT 10;

-- Cache expiry status
SELECT COUNT(*) as expired_count 
FROM MutualFund 
WHERE cacheExpiredAt < datetime('now');

-- NAV history size
SELECT COUNT(*) FROM NAVHistory;
```

---

## Performance Optimization

### Frontend
- Pagination (20 items per page)
- Lazy loading of NAV history
- Request caching
- Memoization of components

### Backend
- Database indexing on frequently searched fields
- Efficient query optimization
- Connection pooling
- Response compression

### Caching
- 60-minute cache expiry
- Automatic refresh on demand
- Fallback to cached data
- Cache invalidation strategies

---

## Security Considerations

### API Security
- ✅ Input validation on all endpoints
- ✅ Rate limiting (recommended for production)
- ✅ Error messages don't expose system details
- ✅ CORS properly configured

### Data Protection
- ✅ No sensitive personal data stored
- ✅ Public market data only
- ✅ HTTPS recommended for production
- ✅ SQL injection protection via ORM

### Logging
- ✅ No API keys in logs
- ✅ No sensitive data logged
- ✅ Module-based categorization
- ✅ Timestamp tracking

---

## Troubleshooting

### Problem: "MFAPI unavailable, using cached data"
**Solution:** 
- Check internet connectivity
- Verify MFAPI service status
- Check firewall/proxy settings
- Review error logs

### Problem: Slow search results
**Solution:**
- Add database indexes on frequently searched fields
- Implement search query pagination
- Consider full-text search engine (Elasticsearch)

### Problem: Old NAV data
**Solution:**
- Manual sync: `POST /api/mutual-funds/sync`
- Check `lastSyncedAt` timestamp
- Verify MFAPI data freshness

### Problem: Database growing too large
**Solution:**
- Archive old NAV history
- Run database vacuum
- Implement auto-cleanup policy

---

## Future Enhancements

1. **Portfolio Comparison** - Compare user's portfolio with mutual funds
2. **Price Alerts** - Notify users of NAV changes
3. **Performance Charts** - Interactive NAV charts
4. **Recommendation Engine** - AI-based fund recommendations
5. **Risk Calculator** - Calculate portfolio risk
6. **Tax Calculator** - Capital gains calculation
7. **Mobile App** - Native mobile application
8. **Advanced Analytics** - Detailed fund analysis

---

## Support & Contact

For issues or questions:
1. Check error logs in console
2. Review this documentation
3. Check MFAPI status
4. Contact system administrator

---

## Disclaimer

This module is provided for **educational purposes only** and should not be considered as financial or investment advice. 

Users should:
- Conduct their own research
- Consult with financial advisors
- Understand market risks
- Verify information before investing
- Not rely solely on this platform for investment decisions

Past performance is not indicative of future results.

---

## License & Attribution

- MFAPI: https://api.mfapi.in
- Mutual Fund data is sourced from official AMC/SEBI data
- All trademarks and logos remain with their respective owners

---

**Last Updated:** July 11, 2026  
**Module Version:** 1.0.0  
**Status:** Production Ready
