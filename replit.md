# LoanEase - AI Loan Sales Assistant

## Overview

LoanEase is an AI-powered personal loan sales assistant built for Tata Capital. The application simulates a digital loan officer through a conversational chat interface, guiding customers from initial inquiry through verification, credit evaluation, and loan sanction. The system uses an agentic AI architecture where a Master Agent orchestrates multiple specialized Worker Agents to handle the complete loan application lifecycle.

**Core Purpose**: Increase loan conversion rates by providing personalized, AI-driven loan sales conversations that handle end-to-end processing—from initial chat engagement to generating sanction letters.

**Key Features**:
- Conversational AI chatbot interface for loan applications
- Multi-agent orchestration (Master, Sales, Verification, Underwriting, Sanction)
- Real-time credit evaluation and eligibility checking
- Automated KYC verification
- Dynamic loan offer generation
- PDF sanction letter generation
- Progress tracking throughout the application journey

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript, built using Vite for fast development and optimized production builds.

**UI Component System**: Built on shadcn/ui components with Radix UI primitives, providing accessible and customizable components. The design follows the "New York" style variant with neutral base colors.

**Styling Approach**: Tailwind CSS with custom design tokens defined in CSS variables. The system uses a HSL-based color scheme that supports light/dark modes. Typography uses Inter for general text and Roboto Mono for numerical displays (loan amounts, credit scores).

**State Management**: 
- TanStack Query (React Query) for server state management and API caching
- Local React state for UI interactions and real-time chat updates
- Custom hooks for mobile responsiveness and toast notifications

**Routing**: Wouter for lightweight client-side routing (currently single-page application focused on chat interface)

**Animation**: Framer Motion for smooth transitions and micro-interactions in chat messages, cards, and modal dialogs

**Design Philosophy**: Hybrid approach combining modern fintech aesthetics (Stripe, Razorpay) with conversational chat interfaces (Intercom, Linear). Emphasizes trust through clarity while maintaining conversational warmth.

### Backend Architecture

**Framework**: Express.js with TypeScript running on Node.js

**API Design**: RESTful endpoints for chat operations, file uploads, and application management
- `/api/chat/init` - Initialize new conversation session
- `/api/chat/send` - Process user messages and return AI responses
- `/api/chat/upload` - Handle salary slip document uploads
- `/api/application/:id` - Retrieve application details
- Mock endpoints for customer data, credit bureau, and offer mart

**Agentic AI System**: Multi-agent orchestration pattern
- **Master Agent**: Coordinates conversation flow and delegates to worker agents
- **Sales Agent**: Handles loan term negotiations and offer presentation
- **Verification Agent**: Validates KYC details from mock CRM
- **Underwriting Agent**: Evaluates creditworthiness using mock credit bureau API
- **Sanction Agent**: Generates PDF sanction letters for approved applications

**AI Integration**: Google Gemini API for natural language understanding and generation. Each agent has specialized prompts and context management.

**Session Management**: In-memory session storage (MemStorage class) for conversation state and application data. Sessions track:
- Conversation messages and history
- Current application step/stage
- Customer identification
- Loan application details
- Agent handoffs and workflow state

**File Handling**: Multer middleware for salary slip uploads with in-memory storage (5MB limit)

### Data Storage Solutions

**Current Implementation**: In-memory storage using Map-based data structures
- ConversationSession storage for active chat sessions
- LoanApplication storage for application state
- Synthetic customer data preloaded in memory (12 sample customers)

**Database Schema Definition**: Drizzle ORM with PostgreSQL schema defined in `shared/schema.ts`
- Prepared for migration to persistent storage
- Schema includes Customer, LoanApplication, ConversationSession, ChatMessage entities
- Uses Neon Database serverless connector for PostgreSQL

**Data Models**:
- **Customer**: Contains KYC details, employment info, existing loans, pre-approved limits, credit scores
- **LoanApplication**: Tracks loan amount, tenure, EMI, status, verification state
- **ConversationSession**: Maintains chat history, current step, customer association
- **LoanOffer**: Stores offer details, interest rates, processing fees

**Rationale**: In-memory storage chosen for prototype/demonstration phase. Schema is production-ready for PostgreSQL migration when persistence is required.

### Authentication and Authorization

**Current State**: No authentication implemented. Session identification uses randomly generated session IDs.

**Design Considerations**: 
- Sessions identified by client-generated UUIDs
- Customer lookup via phone/email during conversation
- No user accounts or login required for demo/prototype phase

**Future Considerations**: Production deployment would require:
- Customer authentication (OTP-based or credentials)
- Secure session management
- Data privacy compliance for financial information

### External Dependencies

**AI Services**:
- **Google Gemini API**: Primary AI model for conversational intelligence and agent responses. Used for natural language understanding, intent detection, and contextual response generation.

**Database**:
- **Neon Database**: Serverless PostgreSQL provider (configured but not actively used in current implementation)
- **Drizzle ORM**: Type-safe database ORM for schema definition and migrations

**Development Tools**:
- **Replit Vite Plugins**: Runtime error overlay, cartographer, and dev banner for Replit environment
- **ESBuild**: Server bundling for production deployment

**Mock/Synthetic Data**:
- Mock credit bureau API (simulated within application)
- Mock CRM server (in-memory customer database)
- Mock offer mart (loan offer generation logic)
- Synthetic customer dataset (12 customers with varied profiles)

**Third-Party UI Libraries**:
- **Radix UI**: Unstyled, accessible component primitives
- **Lucide React**: Icon library
- **date-fns**: Date manipulation and formatting

**File Upload**:
- **Multer**: Multipart form data handling for salary slip uploads

**Session Storage**:
- **connect-pg-simple**: PostgreSQL session store (configured for future use)
- Currently using in-memory Map-based storage

**Rationale for Dependencies**: 
- Gemini chosen for advanced conversational AI capabilities and cost-effectiveness
- Drizzle ORM provides type safety and seamless TypeScript integration
- In-memory storage allows rapid prototyping without database setup
- Mock services enable end-to-end testing without external API dependencies