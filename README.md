# CivicLens

**AI-Enabled Intelligence for Transparent Civic Grievance Management**

CivicLens is a comprehensive, role-based civic complaint management system designed for ward-level governance. It provides transparent tracking of civic issues from submission to resolution, with specialized interfaces for citizens, ward managers, and ward supervisors.

---

## 🎯 Overview

CivicLens unifies complaints across channels and enforces ward-level workflow with complete transparency. The platform enables:

- **Citizens**: Submit and track civic complaints with full transparency
- **Ward Managers**: Manage and resolve complaints within their jurisdiction
- **Ward Supervisors**: Oversee ward performance and verify manager submissions

---

## ✨ Key Features

### For Citizens (Public Users)
- 🔍 **Public Complaint Dashboard**: View all complaints across all 225 wards in Bangalore
- 📝 **Complaint Submission Form**: Submit detailed complaints with location and issue description
- ✅ **Form Validation**: Minimum character requirements and real-time validation
- 🔎 **Advanced Filtering**: Filter by ward number, problem type, and status
- 📊 **Transparent Tracking**: Real-time status updates (Pending → In Progress → Resolved)
- 📍 **Location-Based**: Ward-specific complaint categorization
- 🔒 **Authentication Required**: Must be logged in as public user to submit complaints

### For Ward Managers
- 📋 **Ward-Specific Dashboard**: View and manage complaints only for assigned ward
- ⚡ **Status Management**: Update complaint status (Pending, In Progress, Resolved)
- 📄 **Report Generation**: Download PDF reports for complaints
- 📤 **Supervisor Submission**: Submit resolved complaints to supervisors for verification
- 🎯 **Smart Sorting**: Prioritize oldest unresolved complaints first
- 📈 **Analytics**: Real-time metrics for ward performance

### For Ward Supervisors
- 👁️ **Read-Only Oversight**: Monitor all complaints in assigned ward
- ✅ **Submission Verification**: Review and verify manager-submitted reports
- 📊 **Performance Analytics**: Track ward performance metrics
- 🔍 **Advanced Filtering**: Filter by problem type, status, and date

---

## 🏗️ Project Structure

```
civiclens-frontend/
├── public/
│   ├── logo.jpeg              # CivicLens logo
│   ├── home_vid.mp4          # Homepage demo video
│   └── Searching.gif         # Loading animation
│
├── src/
│   └── app/
│       ├── about/
│       │   └── page.js       # About page
│       │
│       ├── complaints/
│       │   └── page.js       # Public complaints dashboard
│       │
│       ├── login/
│       │   └── page.js       # Progressive disclosure login system
│       │
│       ├── post-complaint/
│       │   └── page.js       # Public user complaint submission form
│       │
│       ├── manager/
│       │   ├── dashboard/
│       │   │   └── page.js   # Ward Manager analytics dashboard
│       │   └── complaints/
│       │       └── page.js   # Ward Manager complaint management
│       │
│       ├── supervisor/
│       │   ├── dashboard/
│       │   │   └── page.js   # Ward Supervisor analytics dashboard
│       │   ├── complaints/
│       │   │   └── page.js   # Ward Supervisor complaint overview
│       │   └── submissions/
│       │       └── page.js   # Manager submission verification
│       │
│       ├── components/
│       │   ├── navbar/
│       │   │   └── Navbar.js # Dynamic role-based navigation
│       │   ├── footer/
│       │   │   └── Footer.js # Site footer
│       │   ├── complaintcard/
│       │   │   └── ComplaintCard.js  # Reusable complaint card component
│       │   ├── PillNav.js    # Animated navigation pills
│       │   └── PillNav.css   # Navigation styles
│       │
│       ├── context/
│       │   └── AuthContext.js # Authentication state management
│       │
│       ├── layout.js         # Root layout with providers
│       ├── page.js           # Homepage
│       ├── providers.js      # Client-side providers wrapper
│       └── globals.css       # Global styles
│
├── package.json              # Dependencies and scripts
├── next.config.mjs          # Next.js configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── postcss.config.mjs       # PostCSS configuration
├── eslint.config.mjs        # ESLint configuration
└── jsconfig.json            # JavaScript configuration
```

---

## 🔐 Authentication System

### Current Implementation (Hardcoded Credentials)

The system uses a **role-based authentication** with hardcoded credentials for demonstration:

#### Public Users (10 accounts)
- **Username**: `user1` to `user10`
- **Password**: `public123`
- **Access**: Homepage, About, Public Complaints Dashboard

#### Ward Managers (225 accounts - one per ward)
- **Username**: `ward{N}_manager` (e.g., `ward1_manager`, `ward2_manager`)
- **Password**: `manager123`
- **Access**: Manager Dashboard, Ward Complaints Management
- **Scope**: Limited to assigned ward only

#### Ward Supervisors (225 accounts - one per ward)
- **Username**: `ward{N}_supervisor` (e.g., `ward1_supervisor`)
- **Password**: `supervisor123`
- **Access**: Supervisor Dashboard, Ward Complaints Overview, Submissions
- **Scope**: Read-only access to assigned ward

### Progressive Disclosure Login Flow
1. **User Type Selection**: Public or Government
2. **Government Role Selection**: Manager or Supervisor (if government)
3. **Ward Number Selection**: 1-225 (if government)
4. **Credentials Entry**: Username and password

---

## 🔌 Backend Integration Requirements

### Required API Endpoints

The frontend is **backend-ready** and expects the following REST API endpoints:

#### 1. Complaints API

##### `GET /api/complaints`
Fetch all public complaints with filtering and pagination.

**Query Parameters:**
- `page` (number): Page number for pagination
- `sort` (string): `newest` | `oldest`
- `ward` (number, optional): Filter by ward number (1-225)
- `problemType` (string, optional): Filter by problem type
- `status` (string, optional): Filter by status

**Response:**
```json
{
  "complaints": [
    {
      "id": "string",
      "ward_no": 123,
      "problem_type": "Roads & Traffic Infrastructure",
      "summary": "Pothole on Main Street",
      "address": "123 Main St, Ward 123",
      "status": "Pending",
      "created_at": "2026-01-15T10:30:00Z",
      "updated_at": "2026-01-15T10:30:00Z",
      "complaint_seq": 1,
      "remarks": "Optional resolution remarks"
    }
  ],
  "total": 100,
  "page": 1,
  "totalPages": 10
}
```

##### `GET /api/complaints/ward/{wardNo}`
Fetch complaints for a specific ward (Manager/Supervisor access).

**Query Parameters:**
- `sort` (string): `newest` | `oldest` | `oldest_unresolved`
- `problemType` (string, optional)
- `status` (string, optional)

**Response:** Same as above

##### `POST /api/complaints`
Create a new complaint (Public users only).

**Request Body:**
```json
{
  "raw_text": "Full complaint description with location details",
  "address_text": "Extracted or provided address",
  "city": "Bangalore",
  "submitted_by": "user1",
  "created_at": "2026-01-17T00:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "complaint": {
    "id": "string",
    "ward_no": 123,
    "problem_type": "Roads & Traffic Infrastructure",
    "summary": "AI-generated summary",
    "address": "Extracted address",
    "status": "Pending",
    "created_at": "2026-01-17T00:00:00Z",
    "updated_at": "2026-01-17T00:00:00Z",
    "complaint_seq": 1,
    "submitted_by": "user1"
  }
}
```

**Note:** Backend should:
- Extract ward number from address using geocoding/NLP
- Categorize problem type using AI classification
- Generate concise summary from raw_text
- Assign sequential complaint number per ward

##### `PATCH /api/complaints/{complaintId}/status`
Update complaint status (Manager only).

**Request Body:**
```json
{
  "status": "Pending" | "In Progress" | "Resolved",
  "remarks": "Optional resolution remarks (required for Resolved)"
}
```

**Response:**
```json
{
  "success": true,
  "complaint": { /* updated complaint object */ }
}
```

#### 2. Reports API

##### `GET /api/reports/download/{complaintId}`
Download PDF report for a complaint (Manager only).

**Response:** PDF file blob

##### `POST /api/reports/submit`
Submit complaint report to supervisor (Manager only).

**Request Body:**
```json
{
  "complaintId": "string"
}
```

**Response:**
```json
{
  "success": true,
  "submissionId": "string"
}
```

#### 3. Analytics API (Future)

##### `GET /api/analytics/ward/{wardNo}`
Fetch analytics data for ward dashboard.

**Response:**
```json
{
  "totalComplaints": 150,
  "pending": 45,
  "inProgress": 30,
  "resolved": 75,
  "avgResolutionTime": 5.2,
  "problemTypeBreakdown": {
    "Roads & Traffic Infrastructure": 40,
    "Water & Sewerage": 30,
    "Garbage & Waste": 25,
    "Building & Property Violations": 20,
    "Electricity & Streetlights": 20,
    "Public Safety": 15
  }
}
```

### Data Schema

#### Complaint Object
```typescript
{
  id: string;                    // Unique complaint ID
  ward_no: number;              // Ward number (1-225)
  problem_type: string;         // Problem category
  summary: string;              // Brief description
  address: string;              // Location details
  status: "Pending" | "In Progress" | "Resolved";
  created_at: string;           // ISO 8601 timestamp
  updated_at: string;           // ISO 8601 timestamp
  complaint_seq: number;        // Sequential number for display ID
  remarks?: string;             // Resolution remarks (optional)
  submitted_by?: string;        // User who submitted
  assigned_to?: string;         // Manager assigned
}
```

#### Problem Types (Standardized)
- `Roads & Traffic Infrastructure`
- `Water & Sewerage`
- `Garbage & Waste`
- `Building & Property Violations`
- `Electricity & Streetlights`
- `Public Safety`

#### Status Values
- `Pending`: Complaint submitted, awaiting action
- `In Progress`: Manager actively working on resolution
- `Resolved`: Complaint resolved with remarks

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd civiclens-frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Run development server**
```bash
npm run dev
```

4. **Open in browser**
```
http://localhost:3000
```

### Build for Production

```bash
npm run build
npm start
```

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 16.1.1](https://nextjs.org/) (App Router)
- **UI Library**: React 19.2.3
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Component Library**: [HeroUI](https://www.heroui.com/)
- **Animations**: 
  - [Framer Motion](https://www.framer.com/motion/) - React animations
  - [GSAP](https://greensock.com/gsap/) - Advanced animations
  - [Lenis](https://lenis.studiofreight.com/) - Smooth scrolling
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: React Context API
- **Routing**: Next.js App Router with client-side navigation

---

## 📋 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

---

## 🎨 Design System

### Color Palette
- **Primary**: Green-900 (`#14532d`) - Government theme
- **Secondary**: Teal-50 to Teal-100 - Backgrounds
- **Status Colors**:
  - Pending: Amber (`#f59e0b`)
  - In Progress: Blue (`#3b82f6`)
  - Resolved: Green (`#10b981`)

### Typography
- **Font**: System fonts with Tailwind defaults
- **Headings**: Bold, Slate-900
- **Body**: Regular, Slate-700

---

## 🔒 Security Considerations

### Current State (Development)
- ⚠️ **Hardcoded credentials** - For demonstration only
- ⚠️ **Client-side authentication** - Not production-ready
- ⚠️ **No encryption** - LocalStorage used for session

### Production Requirements
- [ ] Implement JWT-based authentication
- [ ] Add backend session management
- [ ] Implement HTTPS/TLS
- [ ] Add CSRF protection
- [ ] Implement rate limiting
- [ ] Add input validation and sanitization
- [ ] Implement role-based access control (RBAC) on backend

---

## 🧪 Testing

### Manual Testing Checklist

#### Public User Flow
1. Navigate to `/login`
2. Select "Public User"
3. Enter `user1` / `public123`
4. Verify redirect to homepage
5. Navigate to `/complaints`
6. Test filtering by ward, problem type, status
7. Verify pagination works

#### Ward Manager Flow
1. Navigate to `/login`
2. Select "Government User" → "Ward Manager"
3. Select ward number (e.g., 1)
4. Enter `ward1_manager` / `manager123`
5. Verify redirect to `/manager/dashboard`
6. Navigate to "My Ward Complaints"
7. Test status updates
8. Test report download
9. Test submit to supervisor

#### Ward Supervisor Flow
1. Navigate to `/login`
2. Select "Government User" → "Ward Supervisor"
3. Select ward number (e.g., 1)
4. Enter `ward1_supervisor` / `supervisor123`
5. Verify redirect to `/supervisor/dashboard`
6. Navigate to "Ward Complaints"
7. Verify read-only access
8. Navigate to "Submissions"
9. Verify submission review interface

---

## 🚧 Current Limitations

1. **No Backend Integration**: All API calls are currently commented out
2. **Hardcoded Authentication**: Production requires proper auth system
3. **No Real Data**: Complaints state is empty until backend is connected
4. **No File Upload**: Complaint submission UI not yet implemented
5. **No Real-Time Updates**: Requires WebSocket integration for live updates
6. **No Analytics**: Dashboard metrics are placeholders

---

## 📝 Future Enhancements

- [ ] Connect to backend REST API
- [ ] Implement real authentication with JWT
- [ ] Add complaint submission form for public users
- [ ] Implement file upload for complaint images
- [ ] Add real-time notifications (WebSocket)
- [ ] Implement analytics dashboards with charts
- [ ] Add export functionality (CSV, Excel)
- [ ] Implement search functionality
- [ ] Add multi-language support
- [ ] Mobile app version (React Native)

---

## 📄 License

This project is for **Research & Academic Use Only**.

---

## 👥 Support

For questions or issues, please contact the development team.

---

## 🙏 Acknowledgments

Built with modern web technologies to promote transparent civic governance and accountability.
