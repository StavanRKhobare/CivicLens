# CivicLens 🏛️

**AI-Powered Civic Complaint Management System for Ward-Level Governance**

A full-stack Next.js application enabling transparent tracking of civic issues from submission through resolution, with specialized interfaces for citizens, ward managers, and ward supervisors.

---

## 🌟 Features

### For Citizens
- **Submit Complaints**: Report civic issues with detailed descriptions
- **Track Status**: Real-time updates on complaint resolution
- **Full Transparency**: View all complaints across 225 wards
- **My Complaints**: Personal dashboard showing only your submitted issues
- **Filter & Search**: Find complaints by ward, type, and status

### For Ward Managers
- **Ward Dashboard**: Analytics and metrics for assigned ward
- **Complaint Management**: Update status and add resolution remarks
- **PDF Reports**: Generate professional resolution reports
- **Submit to Supervisor**: One-time submission with verification tracking
- **Status Display**: See pending/verified status from supervisor

### For Ward Supervisors  
- **Ward Oversight**: Monitor all complaints in assigned ward
- **Submissions Review**: Verify manager-submitted reports with PDF preview
- **Analytics Dashboard**: Track ward performance metrics
- **Verification Workflow**: Approve or reject manager submissions

---

## 🏗️ Architecture

### Project Structure
```
civiclens/
├── civiclens-frontend/          # Next.js 16.1.1 frontend
│   ├── src/app/
│   │   ├── complaints/          # Global complaints view
│   │   ├── my-complaints/       # User-specific complaints
│   │   ├── post-complaint/      # Complaint submission form
│   │   ├── manager/             # Manager dashboard & complaints
│   │   ├── supervisor/          # Supervisor dashboard, complaints & submissions  
│   │   ├── components/
│   │   │   ├── navbar/          # Dynamic role-based navigation
│   │   │   ├── complaintcard/   # Reusable complaint display
│   │   │   └── footer/          
│   │   └── context/
│   │       └── AuthContext.js   # Authentication state management
│   └── public/
│       ├── logo.jpeg            # CivicLens branding
│       └── ...
│
└── civiclens-backend/           # Next.js 16.1.3 API backend
    ├── app/api/
    │   ├── complaints/          # CRUD operations for complaints
    │   ├── my-complaints/       # User-specific complaints endpoint
    │   ├── reports/             
    │   │   ├── submit/          # PDF generation & storage
    │   │   ├── download/[id]/   # PDF download
    │   │   └── submissions/     # Supervisor submissions list
    │   ├── supervisor-verify/   # Verification status updates
    │   ├── analytics/           # Dashboard metrics
    │   └── remarks/             # Manager remarks management
    └── lib/
        └── supabase.js          # Database client
```

### Technology Stack

**Frontend (Port 3000)**
- Next.js 16.1.1 (App Router)
- React 19 with Server Components
- Tailwind CSS 4 for styling
- Lucide React icons
- React Hot Toast for notifications

**Backend (Port 3001)**  
- Next.js 16.1.3 API Routes
- Supabase (PostgreSQL database + Storage)
- PDF-lib for report generation
- Crypto for file hashing

---

## 🗄️ Database Schema

### Tables

#### `ComplaintTable`
Raw user submissions before processing.
```sql
- id (bigint, PK)
- raw_text (text)
- submitted_by (text) - username
- created_at (timestamp)
```

#### `SummaryTable`  
Processed complaints with ward assignment and classification.
```sql
- summaryId (bigint, PK)
- ward_no (integer)
- ward_name (text)
- summary (text) - AI-generated summary
- problem_type (text) - classified category
- manager_workflow_status (text) - Pending|In Progress|Resolved
- managerRemarks (text)
- pdfPath (text) - Supabase storage URL
- pdfHash (text)
- supervisor_verified (boolean)
- supervisor_verified_at (timestamp)
- complaint_count (integer) - merged complaints
- created_at (timestamp)
```

#### `SummaryComplaintMap`
Junction table linking raw complaints to processed summaries.
```sql
- summary_id (bigint, FK -> SummaryTable.summaryId)
- complaint_id (bigint, FK -> ComplaintTable.id)
- PRIMARY KEY (summary_id, complaint_id)
```

---

## 🔐 Authentication

### Hardcoded Credentials (Development)

**Public Users (10 accounts)**
- Username: `user1` through `user10`  
- Password: `public123`
- Access: Submit complaints, view all complaints, my complaints

**Ward Managers (225 accounts)**
- Username: `ward{N}_manager` (e.g. `ward1_manager`)
- Password: `manager123`  
- Ward assignment: Based on username (ward1-ward225)
- Access: Ward-specific dashboard and complaint management

**Ward Supervisors (225 accounts)**
- Username: `ward{N}_supervisor` (e.g. `ward1_supervisor`)
- Password: `supervisor123`
- Ward assignment: Based on username  
- Access: Ward oversight and submission verification

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (for database and storage)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd civiclens
```

2. **Install dependencies**

Frontend:
```bash
cd civiclens-frontend
npm install
```

Backend:
```bash
cd ../civiclens-backend
npm install
```

3. **Configure environment variables**

Frontend `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Backend `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

4. **Run development servers**

Backend (Terminal 1):
```bash
cd civiclens-backend
npm run dev
# Runs on http://localhost:3001
```

Frontend (Terminal 2):
```bash
cd civiclens-frontend  
npm run dev
# Runs on http://localhost:3000
```

5. **Access the application**
```
http://localhost:3000
```

---

## 📡 API Endpoints

### Complaints
- `GET /api/complaints` - List all complaints (with filters)
- `GET /api/complaints?user_id={username}` - User-specific (deprecated, use /my-complaints)
- `POST /api/complaints` - Submit new complaint
- `PATCH /api/complaints/[id]/status` - Update status (manager only)

### My Complaints  
- `GET /api/my-complaints?user_id={username}` - User's processed complaints via SummaryComplaintMap

### Reports
- `POST /api/reports/submit` - Generate PDF and submit to supervisor
- `GET /api/reports/download/[id]` - Download PDF report
- `GET /api/reports/submissions?ward={wardNo}` - Supervisor submissions list

### Supervisor
- `PATCH /api/supervisor-verify` - Update verification status

### Analytics
- `GET /api/analytics?ward_no={wardNo}` - Ward dashboard metrics

---

## ✨ Key Features Implemented

### Complaint Workflow
1. **Submission**: Public user submits via form → saved to `ComplaintTable`
2. **Processing**: Backend groups/processes → creates `SummaryTable` entry
3. **Assignment**: Ward classification and problem type tagging
4. **Management**: Manager updates status and adds remarks
5. **Resolution**: Manager generates PDF report
6. **Submission**: One-time submit to supervisor via `POST /api/reports/submit`
7. **Verification**: Supervisor reviews and verifies/rejects

### Smart Features
- **Complaint Merging**: Multiple similar complaints grouped (shown via `complaint_count`)
- **Single Submission**: "Generate & Submit" works only once, then shows "Download" + verification status
- **PDF Generation**: Professional reports with logo, complaint details, and resolution remarks
- **Supabase Storage**: Secure PDF hosting with public URLs
- **Real-time Status**: Dynamic UI based on complaint state
- **User Tracking**: `submitted_by` field tracks complaint ownership

---

## 🎨 Design System

### Colors
- **Primary**: Green-900 (#14532d) - Government theme
- **Status Indicators**:
  - Pending: Amber  
  - In Progress: Blue
  - Resolved: Green
  - Verified: Green with checkmark
  - Pending Verification: Amber with clock

### Components
- **ComplaintCard**: Reusable card with conditional rendering based on user role
- **Navbar**: Dynamic menu items based on authentication state
- **Status Badges**: Color-coded status indicators

---

## 🔒 Security Notes

**Current Implementation (Development)**
- ⚠️ Hardcoded credentials for demo purposes
- ⚠️ Client-side authentication (not production-secure)
- ⚠️ LocalStorage for session management

**Production Requirements**
- [ ] Implement JWT/OAuth authentication
- [ ] Server-side session management  
- [ ] HTTPS/TLS encryption
- [ ] CSRF protection
- [ ] Rate limiting on APIs
- [ ] Input sanitization and validation
- [ ] Environment-based secrets management

---

## 📝 Production Deployment

### Build Commands
```bash
# Frontend
cd civiclens-frontend
npm run build
npm start

# Backend  
cd civiclens-backend
npm run build
npm start
```

### Environment Variables (Production)
Update `.env.local` with production values:
- `NEXT_PUBLIC_API_URL` → Your production backend URL
- `NEXT_PUBLIC_SUPABASE_URL` → Production Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Production anon key

---

## 🧪 Testing

### Manual Test Flow

**Public User**
1. Login as `user1` / `public123`
2. Submit complaint via "Post Complaint"
3. View in "My Complaints" (user-specific)
4. View in "View Complaints" (global)

**Manager**
1. Login as `ward1_manager` / `manager123`
2. View dashboard analytics
3. Update complaint status to "In Progress"
4. Add resolution remarks and mark "Resolved"
5. Click "Generate & Submit Report to Supervisor"
6. Verify button changes to "Download Report" + verification status

**Supervisor**
1. Login as `ward1_supervisor` / `supervisor123`
2. View dashboard metrics
3. Navigate to "Submissions"
4. Click "View Report" on a submission
5. Mark as "Verified" or "Unverify"

---

## 📊 Analytics Dashboard

### Manager Metrics
- Total Complaints
- Pending Count
- In Progress Count  
- Resolved Count

### Supervisor Metrics
- Total Submissions
- Pending Review Count
- Verified Count

---

## �� Known Limitations

1. **Authentication**: Hardcoded credentials, not production-ready
2. **AI Processing**: Backend requires integration for automatic ward classification
3. **Real-time Updates**: No WebSocket implementation
4. **File Upload**: No image attachments for complaints
5. **Search**: No full-text search functionality

---

## 🛣️ Roadmap

- [ ] JWT-based authentication
- [ ] AI-powered complaint classification
- [ ] Image upload for complaints
- [ ] Real-time notifications (WebSocket)
- [ ] Advanced search and filtering
- [ ] Export to CSV/Excel
- [ ] Multi-language support
- [ ] Mobile responsive optimization
- [ ] Progressive Web App (PWA)

---

## 📄 License

This project is for **Research & Academic Use Only**.

---

## 👥 Contributors

Built with ❤️ for transparent civic governance.

---

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Supabase for database and storage
- Tailwind CSS for rapid UI development
- The open-source community

---

**Version**: 1.0.0  
**Last Updated**: January 2026
