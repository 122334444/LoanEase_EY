import { z } from "zod";

// Customer data stored in mock CRM
export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  age: number;
  city: string;
  address: string;
  panNumber: string;
  aadharNumber: string;
  employmentType: "salaried" | "self-employed";
  monthlyIncome: number;
  employer?: string;
  existingLoans: ExistingLoan[];
  preApprovedLimit: number;
  creditScore: number;
  kycVerified: boolean;
}

export interface ExistingLoan {
  type: string;
  amount: number;
  emi: number;
  remainingTenure: number;
}

// Loan offer from offer mart
export interface LoanOffer {
  id: string;
  customerId: string;
  amount: number;
  interestRate: number;
  tenure: number;
  emi: number;
  processingFee: number;
  preApproved: boolean;
}

// Chat message in conversation
export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  agentType?: "master" | "sales" | "verification" | "underwriting" | "sanction";
  timestamp: Date;
  metadata?: {
    loanAmount?: number;
    tenure?: number;
    interestRate?: number;
    status?: "pending" | "approved" | "rejected";
    documentRequired?: boolean;
  };
}

// Loan application state
export interface LoanApplication {
  id: string;
  customerId: string;
  customerName: string;
  requestedAmount: number;
  approvedAmount?: number;
  tenure: number;
  interestRate: number;
  emi: number;
  status: "initiated" | "verification" | "underwriting" | "approved" | "rejected" | "sanctioned";
  kycStatus: "pending" | "verified" | "failed";
  creditScore?: number;
  salarySlipUploaded: boolean;
  salarySlipVerified: boolean;
  rejectionReason?: string;
  sanctionLetterUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Conversation session
export interface ConversationSession {
  id: string;
  customerId?: string;
  messages: ChatMessage[];
  application?: LoanApplication;
  currentStep: "greeting" | "identification" | "needs_assessment" | "offer_presentation" | "verification" | "underwriting" | "decision" | "sanction" | "closed";
  startedAt: Date;
  lastActivityAt: Date;
}

// API request/response types
export const sendMessageSchema = z.object({
  sessionId: z.string(),
  message: z.string(),
  customerId: z.string().optional(),
});

export type SendMessageRequest = z.infer<typeof sendMessageSchema>;

export const uploadSalarySlipSchema = z.object({
  sessionId: z.string(),
  applicationId: z.string(),
  fileName: z.string(),
  fileSize: z.number(),
});

export type UploadSalarySlipRequest = z.infer<typeof uploadSalarySlipSchema>;

export interface ChatResponse {
  message: ChatMessage;
  application?: LoanApplication;
  currentStep: ConversationSession["currentStep"];
  suggestedResponses?: string[];
}

// Credit bureau response
export interface CreditBureauResponse {
  customerId: string;
  creditScore: number;
  creditHistory: string;
  activeLoans: number;
  defaultHistory: boolean;
}

// Sanction letter data
export interface SanctionLetter {
  applicationId: string;
  customerName: string;
  loanAmount: number;
  interestRate: number;
  tenure: number;
  emi: number;
  processingFee: number;
  disbursementDate: string;
  sanctionDate: string;
  termsAndConditions: string[];
}

// Agent types for display
export const agentTypeLabels: Record<string, string> = {
  master: "LoanEase AI",
  sales: "Sales Agent",
  verification: "Verification Agent",
  underwriting: "Underwriting Agent",
  sanction: "Sanction Agent",
};

export const agentTypeColors: Record<string, string> = {
  master: "bg-primary",
  sales: "bg-chart-2",
  verification: "bg-chart-3",
  underwriting: "bg-chart-4",
  sanction: "bg-chart-5",
};

// Application steps for progress tracker
export const applicationSteps = [
  { id: "greeting", label: "Welcome", description: "Initial conversation" },
  { id: "identification", label: "Identification", description: "Customer verification" },
  { id: "needs_assessment", label: "Assessment", description: "Understanding your needs" },
  { id: "offer_presentation", label: "Offer", description: "Personalized loan offer" },
  { id: "verification", label: "KYC", description: "Document verification" },
  { id: "underwriting", label: "Credit Check", description: "Eligibility assessment" },
  { id: "decision", label: "Decision", description: "Loan approval" },
  { id: "sanction", label: "Sanction", description: "Letter generation" },
] as const;
