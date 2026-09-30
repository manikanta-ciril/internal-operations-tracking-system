# CIRIL Internal Operations Tracking System (IOTS)
## Chapter 7: Enterprise UI/UX Design System & Dashboard Blueprints

> **Document Code:** `IOTS-DOC-07`  
> **Target Audience:** Frontend Architects, UI/UX Product Designers, Full-Stack Engineers, and QA Teams  
> **Context:** Design Principles, 12-Column Desktop Grid, Unified Application Shell, Common Login Specifications, and Screen Blueprints for all 11 Roles

---

## 1. Executive Summary: "Complex Underneath, Simple on Top"

Enterprise operational software must cater to two demanding groups of stakeholders:
1. **Senior Executives (Chairman, General Manager):** Need to grasp organizational health, risks, and financial milestones within 5 to 10 seconds without wading through operational minutiae.
2. **Operational Specialists (Managers, Executives, Designers, BDEs):** Need dense, fast, and keyboard-friendly controls to execute work, track time, upload files, and collaborate without clicking through ten separate menus.

The **IOTS Design System** resolves this through **progressive disclosure** and a restrained, functional design language. It deliberately rejects consumer SaaS gimmicks (no floating 3D gradients, no bouncing animated mascots, no oversized empty cards) in favor of a clean, high-density, and trustworthy operational cockpit.

---

## 2. Core Design Principles & Enterprise Tokens

### 2.1 The 5 Visual Rules
1. **Calm, High-Information Density:** Screen space is precious. Containers use crisp 1px borders (`border-slate-700/50`) and subtle backgrounds (`bg-slate-900/40`), ensuring the user’s eye focuses on data, not decoration.
2. **Never Convey Status by Color Alone:** Every status badge pairs a distinct semantic color with an unambiguous text label and icon (e.g., `🔴 Blocked`, `🟡 Waiting for Review`, `🟢 Completed`).
3. **Desktop-First (1440px Standard):** Tailored for widescreen desktop displays using a rigid 12-column CSS grid, while gracefully stacking for tablet and mobile viewport sizes.
4. **Contextual Drawers Over Page Jumps:** Inspecting task history, viewing audit logs, or checking an employee profile opens a smooth right-hand slide-out drawer (`w-[480px]`), keeping the user anchored in their active workflow.
5. **Two-Step Confirmation for High-Impact Decisions:** Reassigning a task, revoking a session, or extending a deadline triggers a focused modal requiring recorded business justification.

---

### 2.2 Semantic Color Tokens

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  SEMANTIC STATUS COLOR SYSTEM                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│  🟢 NORMAL / ACTIVE   :  Emerald (#10B981) ➔ Standard progress, healthy SLA  │
│  🟡 PENDING / QUEUED  :  Amber   (#F59E0B) ➔ Awaiting action, review queued  │
│  🟠 REVISION NEEDED   :  Orange  (#F97316) ➔ Changes requested by manager   │
│  🔴 OVERDUE / BLOCKED :  Rose    (#F43F5E) ➔ Missed SLA, active blocker      │
│  🔵 IN PROGRESS       :  Sky     (#0EA5E9) ➔ Active execution, timer running │
│  🟣 PRIVILEGED / QA   :  Purple  (#A855F7) ➔ Managerial review, IT diagnostic│
│  ⚫ OFFLINE / ARCHIVED:  Slate   (#64748B) ➔ Inactive, signed off, sealed    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. The Unified Common Login Screen Blueprint

The login screen is the common front door for all 11 roles. **There is no public registration, and users do not pick their role on this screen.**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                                 [ CIRIL ]                                   │
│                   INTERNAL OPERATIONS TRACKING SYSTEM                       │
│                        Enterprise Operations Portal                         │
│                                                                             │
│         ┌─────────────────────────────────────────────────────────┐         │
│         │  Employee ID / Corporate Email                          │         │
│         │  [ CIRIL-2026-084                                     ] │         │
│         │                                                         │         │
│         │  Password                                               │         │
│         │  [ ••••••••••••••••••                                👁️ ] │         │
│         │                                                         │         │
│         │  [ 🔒 Sign In to Operations Workspace ]                 │         │
│         └─────────────────────────────────────────────────────────┘         │
│                                                                             │
│               Need account help? Contact System Administration              │
│            Location verification active • Authorized personnel only          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### The 8 Unified Login Interaction States
1. **Empty Login:** Clean form fields, button inactive until credentials are entered.
2. **Invalid Credentials:** Subtle inline warning: *"Invalid Employee ID or Password. Please verify your credentials."* (Locks after 5 attempts).
3. **Successful Credentials:** Lock icon animates, verifying user account.
4. **Location Verification in Progress:** Friendly spinner: *"Verifying location security context..."*
5. **Recognized Office Perimeter:** Verified within authorized office coordinates (e.g., Banjara Hills, Hyderabad). Green badge: *"Office / On-Premise"*.
6. **Remote / Off-Site Location:** Located outside office geofence. Calm amber pill: *"Session Tagged: Remote / Off-Site"*. Prompts for optional reason memo.
7. **Account Disabled / Suspended:** Informational message: *"This account has been placed on administrative hold. Please contact your General Manager."*
8. **Automated Role Routing:** System calculates effective role permissions and transitions the user into their authorized workspace.

---

## 4. The Master Application Shell

Every authenticated screen shares an identical top-level layout shell:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [🏢 CIRIL IOTS]  [📍 Hyderabad HQ]                🟢 Available (Manasa)     │
│ Active Workspace: [ 👔 Lead Manager ▼ ]    🔍 Global Search   🔔(3)  👤 User │
├──────────────┬──────────────────────────────────────────────────────────────┤
│              │ Breadcrumbs: Operations > Teams > Commercial Vertical Tasks  │
│ 📊 Dashboard │──────────────────────────────────────────────────────────────┤
│ 📋 Tasks     │                                                              │
│ 👥 Team      │                                                              │
│ ⚖️ Workload  │                    ACTIVE WORKSPACE GRID                     │
│ 📈 Targets   │                       (12 Columns)                           │
│ 🌴 Leaves    │                                                              │
│ ⚠️ Blockers  │                                                              │
│ 🔍 QA Review │                                                              │
│ 📑 Reports   │                                                              │
│ ⚙️ Settings  │                                                              │
└──────────────┴──────────────────────────────────────────────────────────────┘
```

---

## 5. Screen Blueprints for all 11 Roles

---

### 1. Chairman Dashboard Blueprint (Apex Executive Cockpit)
- **Top Row (Enterprise Health Radar):**
  - Card 1: `Enterprise Operational Health: 94.2%` (🟢 Optimal)
  - Card 2: `Active Mandates & Deals: 48 Closed | ₹1.84 Cr Royalty Generated`
  - Card 3: `Critical Escalations: 2 Pending Resolution` (🔴 Attention)
  - Card 4: `Workforce Availability: 92% Present | 8% Remote`
- **Requires Attention Panel (Executive Exceptions):**
  - List of overdue tasks $>48\text{ hours}$, repeated reassignments, and blocked deal closures.
- **Organizational Pulse (Trends):**
  - Graphs: 30-day task completion velocity, on-time SLA trend line, quarterly member alliance growth.
- **Executive Intervention Safeguard:** Any directive issued by the Chairman prompts a high-visibility modal requiring secondary confirmation to ensure strategic weight.

---

### 2. Super Admin Dashboard Blueprint (Platform Governance)
- **Navigation:** Platform Settings, RBAC & Permissions, Master Verticals, Data Compliance, Full Audit Ledger.
- **Master Metrics:** Active System Accounts (11 Roles), Geofence Perimeters (4 Cities), Data Storage Utilization, Global System Status.
- **RBAC Policy Editor:** Visual permission matrix toggling capabilities across user designations.
- **Full Immutable Audit Viewer:** Raw data table with column filters (Date, Actor, Action, Resource, IP).

---

### 3. Admin Dashboard Blueprint (Routine Administration)
- **Navigation:** User Directory, Location & Geofencing, Global Task Oversight, Announcements, Attendance Audit.
- **User Provisioning Table:** Structured multi-step user creation (Identity, Role, Department, Reporting Manager).
- **Geofence Manager:** Map view configuring office latitude, longitude, and radius buffers (100m to 200m).
- **Attendance Exception Center:** Summary of off-site logins, unexcused late arrivals, and remote justification logs.
- **Announcement Studio:** Rich-text editor with audience selectors (All Staff, Specific Roles, Specific Zones).

---

### 4. IT System Analyst Dashboard Blueprint (Technical Reliability)
- **Navigation:** System Health, API & Microservices, Security Diagnostics, Technical Incidents, Change Logs.
- **Service Uptime Monitors:** Real-time ping latency and status cards for Reverse Geocoding API, Auth Gateway, PostgreSQL Cluster, and Cloud File Buckets.
- **Authentication Anomalies Radar:** Highlights impossible travel velocities, session token mismatches, and multiple concurrent logins from different subnets.
- **One-Click Session Killer:** Allows instant revocation of compromised user sessions with mandatory incident logging.

---

### 5. General Manager Dashboard Blueprint (Ipsheeta - Operations & Governance)
- **Navigation:** Business Overview, Board Coordination, Accounts & Royalties, Legal Compliance, Expansion Pipeline.
- **Governance Center:** Board meeting agenda builder, minute tracker, and action item registry.
- **Royalty Reconciliation Ledger:** Tracks open fee invoices, 7.5% corporate royalty clearances, and overdue payments from member brokerages.
- **Legal Compliance Vault:** Master repository of executed membership agreements, NDAs, and statutory filing deadlines.
- **Expansion Pipeline:** Interactive map of prospective member brokerage firms under active negotiation.

---

### 6. Senior Manager Dashboard Blueprint (Multi-Team Operations)
- **Navigation:** Multi-Team Overview, Cross-Team Workload, SLA Delivery, Escalation Center, Senior Approvals.
- **Cross-Team Balance Radar:** Side-by-side capacity meters for Operations Team, BD Team, and Creative Team.
- **Escalation Clearinghouse:** Resolves disputes or blockers referred upwards by Lead Managers.
- **Senior Approval Queue:** Evaluates major deadline adjustments ($>3\text{ days}$) and inter-team personnel reallocations.

---

### 7. Lead Manager Dashboard Blueprint (Manasa - Team Command)
- **Navigation:** Team Command, Task Manager, Live Status, Workload, Approvals / QA, Leave Requests, Blocker Center.
- **Live Team Radar:** Table listing every team member, real-time availability (🟢 Available, 🔴 Busy, ☕ Break), active task title, and hours logged today.
- **Task Assignment Engine:** Modal to create tasks with priority, deliverables, SLA deadline, and automated bandwidth warning if the selected employee is already overloaded.
- **Overdue Intervention Center:** Action cards for every overdue task, providing 1-click options to Extend (with reason), Reassign (with context), or Escalate.
- **QA Review Workbench:** Split view showing employee deliverable files on the left and manager review controls (Approve / Request Changes) on the right.

---

### 8. Executive Dashboard Blueprint (Core Work Execution)
- **Navigation:** My Workspace, Active Tasks, Work Activity, Blockers, Requests, Attendance, My Performance.
- **Today's Focus Banner:** Highlights the single highest-priority task due today with an prominent **"Continue Work"** button.
- **Active Task Cards:** Displays assigned tasks with progress bars, due dates, and deliverables checklists.
- **Work Activity Logger:** Quick modal to increment progress slider, record work notes, log time spent, and attach evidence files.
- **Report Blocker Button:** 1-click form to pause work and alert the Lead Manager when facing external delays.

---

### 9. Business Development Executive (BDE) Dashboard Blueprint (Bhavani - Expansion)
- **Navigation:** BD Command, Outreach Quota, Prospect Database, Portals (Upturnly / 99acres), Follow-up Queue.
- **Daily Quota Progress Bar:** Visual meters tracking calls completed (e.g., 34/50), emails dispatched, and WhatsApp intros sent.
- **Prospect Database Table:** Verified contacts filtered by city, source (RERA, Google), and qualification status (Contacted, Interested, Meeting Scheduled).
- **Follow-up Calendar:** Chronological list of callbacks scheduled for today with 1-click call logging.

---

### 10. Social Media Manager Dashboard Blueprint (Harshitha - Campaigns)
- **Navigation:** Content Pipeline, Content Calendar, Campaign Hub, Report Proofreading, Creative Requests.
- **Visual Content Kanban:** 6-column pipeline tracking posts: `Brief` ➔ `Drafting` ➔ `Internal Review` ➔ `Changes Requested` ➔ `Approved` ➔ `Published`.
- **Content Calendar View:** Monthly grid displaying scheduled releases across LinkedIn, Instagram, and YouTube.
- **Report Proofreading Queue:** Dedicated reviewer workspace for validating quarterly market research text and charts.

---

### 11. Graphic Designer Dashboard Blueprint (Creative Workbench)
- **Navigation:** Creative Queue, Active Briefs, Version Asset Vault, Revision Center, Conference Collaterals.
- **Creative Queue Table:** List of incoming design requests tagged with priority, format specifications, and deadlines.
- **Version Asset Manager:** File vault displaying iterative versions (`v1.0`, `v1.1`, `v2.0`) with visual thumbnails, author notes, and download links.
- **Revision Workspace:** Side-by-side view highlighting requested changes from the Social Media Manager or Lead Manager.

---

## 6. The Reusable Task Detail Workspace Blueprint

Every user who clicks on a task across any dashboard is presented with a consistent, comprehensive workspace:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  TASK-1082: Prepare Quarterly Market Intelligence Report (Q3 2026)          │
│  Priority: 🔴 High   | State: 🔵 In Progress (Rev 2)   | Due: 02 Oct 17:00  │
│  Owner: Harshitha (Exec) | Manager: Manasa (Lead Mgr) | Vertical: Research  │
├──────────────────────────────────────┬──────────────────────────────────────┤
│  SECTION 1: DELIVERABLES & BRIEF     │  SECTION 4: ACTIVITY & TIME LOGGED   │
│  • Compile Bangalore Grade-A rents   │  • 10:15 - 1h 30m by Harshitha       │
│  • Format 12 micro-market tables     │  • 11:45 - Uploaded Draft_v2.docx    │
│  • Proofread executive summary       │  • 14:00 - Progress updated to 70%   │
│                                      │                                      │
│  SECTION 2: WORK NOTES & EVIDENCE    │  SECTION 5: SUBMISSION & QA REVIEW   │
│  Attached Files:                     │  Status: Changes Requested           │
│  📄 Bangalore_Q3_v2.docx (4.2 MB)     │  Feedback: "Please verify Whitefield │
│  📊 Absorption_Data.xlsx (1.1 MB)    │  rental jump in Table 4."            │
│                                      │                                      │
│  SECTION 3: BLOCKERS / ISSUES        │  SECTION 6: IMMUTABLE AUDIT TRAIL    │
│  🟢 Zero active blockers             │  📅 30 Sep 11:45 - Version uploaded  │
│  [ + Report Blocker ]                │  📅 30 Sep 09:00 - Priority elevated │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

---

> This concludes the comprehensive seven-chapter system documentation for the **CIRIL Internal Operations Tracking System (IOTS)**. For the high-level roadmap and sitemap, return to [**`00_IOTS_ENTERPRISE_SYSTEM_ENCYCLOPEDIA_INDEX.md`**](./00_IOTS_ENTERPRISE_SYSTEM_ENCYCLOPEDIA_INDEX.md).
