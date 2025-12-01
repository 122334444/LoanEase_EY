# Design Guidelines: LoanEase - AI Loan Sales Assistant

## Design Approach
**Hybrid Approach**: Drawing from modern fintech applications (Stripe, Razorpay) for trust and professionalism, combined with contemporary chat interfaces (Intercom, Linear) for conversational flow. Material Design principles guide form elements and data display.

**Core Principle**: Build confidence through clarity - every interaction should reinforce trust in the financial process while maintaining conversational warmth.

---

## Typography System

**Font Stack**: 
- Primary: Inter (via Google Fonts CDN)
- Monospace: 'Roboto Mono' for numerical data (loan amounts, credit scores)

**Hierarchy**:
- Hero/Page Titles: text-4xl/text-5xl, font-semibold
- Section Headers: text-2xl/text-3xl, font-semibold  
- Chat Messages: text-base, font-normal (user) / font-medium (AI agent)
- Form Labels: text-sm, font-medium
- Data Values: text-lg, font-semibold (for amounts, scores)
- Helper Text: text-sm, font-normal
- Button Text: text-sm, font-medium

---

## Layout System

**Spacing Units**: Tailwind units of **2, 4, 6, 8, 12, 16** for consistent rhythm
- Component padding: p-4 to p-8
- Section spacing: py-12 to py-16
- Card spacing: p-6
- Chat message spacing: gap-4

**Container Strategy**:
- Chat interface: max-w-4xl centered
- Form sections: max-w-2xl
- Full-width dashboard: w-full with max-w-7xl inner container

---

## Component Library

### Navigation
- Fixed top header with company branding (left), progress indicator (center), help/logout (right)
- Height: h-16
- Border bottom for separation
- Sticky positioning during chat flow

### Chat Interface (Primary Component)
**Layout**:
- Two-column desktop layout (md:grid-cols-3): Sidebar (1 col) + Chat (2 cols)
- Mobile: Stack vertically

**Chat Container**:
- Messages area: flex-1 with overflow-y-auto, max-h-[calc(100vh-200px)]
- Message bubbles: max-w-md, rounded-2xl, p-4
- User messages: ml-auto (right-aligned)
- AI agent messages: mr-auto (left-aligned) with agent avatar
- Typing indicator: animated dots for AI responses
- Input area: fixed bottom, h-20, with rounded-full input field

**Sidebar Components**:
- Loan summary card showing: Amount requested, tenure, estimated EMI
- Application status tracker with step indicators
- Quick actions: Upload documents, view offers

### Forms & Data Entry
- Input fields: h-12, rounded-lg, border with focus states
- File upload: Drag-and-drop zone (min-h-32) with icon, dashed border
- Radio/checkbox groups: gap-3 spacing
- Validation messages: text-sm below inputs

### Data Display Cards
**Loan Offer Card**:
- Prominent amount display (text-3xl, font-bold)
- Interest rate, tenure in grid (grid-cols-2)
- EMI breakdown table
- CTA button at bottom

**Status Cards** (Approval/Rejection):
- Icon at top (checkmark/warning) - size-16
- Status text (text-2xl, font-semibold)
- Details in list format
- Next steps or reasoning clearly stated

**Document Preview**:
- Thumbnail view for uploaded salary slips
- PDF preview modal overlay
- Download/remove actions

### Progress Tracking
- Stepper component: horizontal on desktop, vertical on mobile
- Steps: Initial Chat → Verification → Credit Check → Approval → Sanction Letter
- Active step highlighted, completed steps with checkmarks
- Located in header or sidebar

### Overlays & Modals
- Document upload modal: centered, max-w-lg, rounded-xl
- Confirmation dialogs: max-w-md
- Sanction letter preview: max-w-4xl, with download CTA
- Backdrop: backdrop-blur-sm

### Buttons
**Primary CTA**: 
- Rounded-lg, h-12, px-8
- Used for: Submit application, Download sanction letter, Accept offer

**Secondary**: 
- Outlined variant
- Used for: Cancel, Go back, View details

**Icon Buttons**: 
- size-10, rounded-full
- Used for: Close, Menu, Help

---

## Icons
**Library**: Heroicons (via CDN)
- Chat: ChatBubbleLeftRightIcon, PaperAirplaneIcon
- Status: CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon
- Documents: DocumentIcon, CloudArrowUpIcon, DocumentCheckIcon
- Navigation: Bars3Icon, XMarkIcon, ChevronRightIcon
- User: UserCircleIcon

---

## Images

**Hero Section**: Not applicable - this is a chat-first application interface

**Agent Avatars**:
- Description: Professional, friendly AI assistant avatar icons (abstract geometric or simple illustrated style)
- Placement: Left side of each AI message bubble (size-8 to size-10)
- Multiple avatars for different agents (Sales, Verification, Underwriting, Sanction)

**Empty States**:
- Description: Light illustration of chat conversation or document processing
- Placement: Center of chat area before conversation begins

**Success/Approval Imagery**:
- Description: Celebratory checkmark or success badge illustration
- Placement: Center of approval status card

**Background Patterns** (Subtle):
- Description: Minimal grid pattern or subtle gradient mesh
- Placement: Behind chat container for depth (very low opacity)

---

## Animation Guidelines
**Minimal & Purposeful Only**:
- Message bubble entry: Gentle fade-in + slide (100ms)
- Typing indicator: Pulsing dots animation
- Step completion: Checkmark scale-in (200ms)
- Modal entry/exit: Fade + scale (150ms)
- **No scroll animations, no hover morphs, no decorative motion**

---

## Key UX Patterns

**Conversational Flow**:
- AI initiates with warm greeting
- Questions asked one at a time with clear options
- User responses appear immediately
- AI acknowledgment before next question
- Progress visible at all times

**Trust Signals**:
- Bank branding prominent in header
- Security badges/SSL indicators
- Clear data usage messaging
- Transparent eligibility criteria shown upfront

**Error Handling**:
- Validation errors inline with helpful suggestions
- Failed credit check shows clear reasoning
- Option to retry or contact support always visible

**Document Handling**:
- Clear file size/format requirements
- Upload progress indicators
- Immediate preview after upload
- Ability to replace before submission

This design creates a professional, trustworthy loan application experience that balances efficiency with the personalized feel of conversational AI.