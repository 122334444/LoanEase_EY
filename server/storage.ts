import type { 
  Customer, 
  LoanApplication, 
  ConversationSession,
  ChatMessage 
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Session management
  getSession(id: string): Promise<ConversationSession | undefined>;
  createSession(session: ConversationSession): Promise<ConversationSession>;
  updateSession(id: string, session: Partial<ConversationSession>): Promise<ConversationSession | undefined>;

  // Application management
  getApplication(id: string): Promise<LoanApplication | undefined>;
  createApplication(application: LoanApplication): Promise<LoanApplication>;
  updateApplication(id: string, application: Partial<LoanApplication>): Promise<LoanApplication | undefined>;
  getApplicationsByCustomer(customerId: string): Promise<LoanApplication[]>;
}

export class MemStorage implements IStorage {
  private sessions: Map<string, ConversationSession>;
  private applications: Map<string, LoanApplication>;

  constructor() {
    this.sessions = new Map();
    this.applications = new Map();
  }

  async getSession(id: string): Promise<ConversationSession | undefined> {
    return this.sessions.get(id);
  }

  async createSession(session: ConversationSession): Promise<ConversationSession> {
    this.sessions.set(session.id, session);
    return session;
  }

  async updateSession(id: string, updates: Partial<ConversationSession>): Promise<ConversationSession | undefined> {
    const session = this.sessions.get(id);
    if (!session) return undefined;
    
    const updated = { ...session, ...updates };
    this.sessions.set(id, updated);
    return updated;
  }

  async getApplication(id: string): Promise<LoanApplication | undefined> {
    return this.applications.get(id);
  }

  async createApplication(application: LoanApplication): Promise<LoanApplication> {
    this.applications.set(application.id, application);
    return application;
  }

  async updateApplication(id: string, updates: Partial<LoanApplication>): Promise<LoanApplication | undefined> {
    const application = this.applications.get(id);
    if (!application) return undefined;
    
    const updated = { ...application, ...updates, updatedAt: new Date() };
    this.applications.set(id, updated);
    return updated;
  }

  async getApplicationsByCustomer(customerId: string): Promise<LoanApplication[]> {
    return Array.from(this.applications.values())
      .filter(app => app.customerId === customerId);
  }
}

export const storage = new MemStorage();
