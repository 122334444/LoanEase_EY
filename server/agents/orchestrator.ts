import type { 
  ChatMessage, 
  ChatResponse, 
  LoanApplication, 
  ConversationSession,
  Customer,
  LoanOffer
} from "@shared/schema";
import { generateAgentResponse, extractLoanDetails, detectIntent, type AgentContext } from "./gemini";
import { customers, findCustomer, getCustomerById, generateLoanOffer, getCreditScore } from "../data/customers";

// In-memory session storage
const sessions = new Map<string, ConversationSession>();
const applications = new Map<string, LoanApplication>();

function createMessage(
  content: string, 
  agentType: ChatMessage["agentType"],
  metadata?: ChatMessage["metadata"]
): ChatMessage {
  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    role: "assistant",
    content,
    agentType,
    timestamp: new Date(),
    metadata,
  };
}

function getSession(sessionId: string): ConversationSession {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      id: sessionId,
      messages: [],
      currentStep: "greeting",
      startedAt: new Date(),
      lastActivityAt: new Date(),
    });
  }
  return sessions.get(sessionId)!;
}

function buildContext(session: ConversationSession, customer?: Customer): AgentContext {
  const app = session.application;
  return {
    customerName: customer?.name,
    customerId: customer?.id,
    preApprovedLimit: customer?.preApprovedLimit,
    creditScore: app?.creditScore || customer?.creditScore,
    requestedAmount: app?.requestedAmount,
    tenure: app?.tenure,
    interestRate: app?.interestRate,
    emi: app?.emi,
    status: app?.status,
    conversationHistory: session.messages.map(m => 
      `${m.role === "user" ? "Customer" : m.agentType || "AI"}: ${m.content}`
    ),
  };
}

function calculateEMI(amount: number, rate: number, tenure: number): number {
  const monthlyRate = rate / 100 / 12;
  return Math.round(amount * monthlyRate * Math.pow(1 + monthlyRate, tenure) / (Math.pow(1 + monthlyRate, tenure) - 1));
}

export async function initializeSession(sessionId: string): Promise<ChatResponse> {
  const session = getSession(sessionId);
  
  const welcomeMessage = createMessage(
    "Hello! Welcome to Tata Capital's LoanEase. I'm here to help you with a personal loan today. To get started, could you please share your registered phone number or email address?",
    "master"
  );

  session.messages.push(welcomeMessage);
  session.lastActivityAt = new Date();
  sessions.set(sessionId, session);

  return {
    message: welcomeMessage,
    currentStep: "greeting",
    suggestedResponses: ["9876543210", "9876543211", "I'm a new customer"],
  };
}

export async function processMessage(
  sessionId: string,
  userMessage: string,
  providedCustomerId?: string
): Promise<ChatResponse> {
  const session = getSession(sessionId);
  
  // Add user message to history
  const userMsg: ChatMessage = {
    id: `msg-${Date.now()}`,
    role: "user",
    content: userMessage,
    timestamp: new Date(),
  };
  session.messages.push(userMsg);

  let customer: Customer | undefined;
  if (session.customerId) {
    customer = getCustomerById(session.customerId);
  } else if (providedCustomerId) {
    customer = getCustomerById(providedCustomerId);
    if (customer) session.customerId = customer.id;
  }

  const context = buildContext(session, customer);
  const intent = await detectIntent(userMessage, session.currentStep);

  let response: ChatResponse;

  switch (session.currentStep) {
    case "greeting":
      response = await handleGreeting(session, userMessage, intent, context);
      break;
    case "identification":
      response = await handleIdentification(session, userMessage, intent, context);
      break;
    case "needs_assessment":
      response = await handleNeedsAssessment(session, userMessage, intent, context, customer!);
      break;
    case "offer_presentation":
      response = await handleOfferPresentation(session, userMessage, intent, context, customer!);
      break;
    case "verification":
      response = await handleVerification(session, userMessage, intent, context, customer!);
      break;
    case "underwriting":
      response = await handleUnderwriting(session, userMessage, intent, context, customer!);
      break;
    case "decision":
      response = await handleDecision(session, userMessage, intent, context, customer!);
      break;
    case "sanction":
      response = await handleSanction(session, userMessage, intent, context, customer!);
      break;
    default:
      response = await handleGeneric(session, userMessage, context);
  }

  session.messages.push(response.message);
  session.currentStep = response.currentStep;
  session.lastActivityAt = new Date();
  if (response.application) {
    session.application = response.application;
    applications.set(response.application.id, response.application);
  }
  sessions.set(sessionId, session);

  return response;
}

async function handleGreeting(
  session: ConversationSession,
  userMessage: string,
  intent: string,
  context: AgentContext
): Promise<ChatResponse> {
  // Try to find customer
  const customer = findCustomer(userMessage);

  if (customer) {
    session.customerId = customer.id;
    const message = createMessage(
      `Great to have you here, ${customer.name}! I can see you have a pre-approved personal loan offer of up to ₹${customer.preApprovedLimit.toLocaleString('en-IN')}. How much would you like to borrow today?`,
      "master"
    );

    return {
      message,
      currentStep: "needs_assessment",
      suggestedResponses: [
        `₹${customer.preApprovedLimit.toLocaleString('en-IN')}`,
        `₹${Math.round(customer.preApprovedLimit * 0.5).toLocaleString('en-IN')}`,
        "I need more than my pre-approved limit",
      ],
    };
  }

  // Customer not found
  const aiResponse = await generateAgentResponse(
    "master",
    userMessage,
    context,
    "The customer identity could not be found. Ask them to verify their phone number or email again, or let them know they might be a new customer."
  );

  return {
    message: createMessage(aiResponse, "master"),
    currentStep: "identification",
    suggestedResponses: ["Let me try again", "I'm a new customer"],
  };
}

async function handleIdentification(
  session: ConversationSession,
  userMessage: string,
  intent: string,
  context: AgentContext
): Promise<ChatResponse> {
  const customer = findCustomer(userMessage);

  if (customer) {
    session.customerId = customer.id;
    const message = createMessage(
      `Found you, ${customer.name}! You have a pre-approved personal loan offer of ₹${customer.preApprovedLimit.toLocaleString('en-IN')} at an attractive interest rate. How much would you like to borrow?`,
      "master"
    );

    return {
      message,
      currentStep: "needs_assessment",
      suggestedResponses: [
        `₹${customer.preApprovedLimit.toLocaleString('en-IN')}`,
        `₹${Math.round(customer.preApprovedLimit * 1.5).toLocaleString('en-IN')}`,
        "What's my maximum limit?",
      ],
    };
  }

  if (userMessage.toLowerCase().includes("new customer")) {
    return {
      message: createMessage(
        "I appreciate your interest! For new customers, please visit our nearest branch or apply through our website for a personalized loan offer. Is there anything else I can help you with today?",
        "master"
      ),
      currentStep: "closed",
      suggestedResponses: ["Find nearest branch", "Visit website"],
    };
  }

  const aiResponse = await generateAgentResponse(
    "master",
    userMessage,
    context,
    "Still unable to identify the customer. Be helpful and suggest trying their registered phone or email."
  );

  return {
    message: createMessage(aiResponse, "master"),
    currentStep: "identification",
    suggestedResponses: ["9876543210", "9876543211", "I'm a new customer"],
  };
}

async function handleNeedsAssessment(
  session: ConversationSession,
  userMessage: string,
  intent: string,
  context: AgentContext,
  customer: Customer
): Promise<ChatResponse> {
  const extracted = await extractLoanDetails(userMessage, context);
  
  let requestedAmount = extracted.amount;
  let tenure = extracted.tenure || 36;

  if (!requestedAmount) {
    const aiResponse = await generateAgentResponse(
      "sales",
      userMessage,
      context,
      "Ask the customer to specify the loan amount they need. Mention their pre-approved limit."
    );

    return {
      message: createMessage(aiResponse, "sales"),
      currentStep: "needs_assessment",
      suggestedResponses: [
        `₹${customer.preApprovedLimit.toLocaleString('en-IN')}`,
        "₹3,00,000",
        "₹5,00,000",
      ],
    };
  }

  // Calculate offer details
  const interestRate = customer.creditScore >= 800 ? 10.5 :
                       customer.creditScore >= 750 ? 11.5 :
                       customer.creditScore >= 700 ? 12.5 : 14.0;
  const emi = calculateEMI(requestedAmount, interestRate, tenure);

  // Create application
  const application: LoanApplication = {
    id: `APP-${Date.now()}`,
    customerId: customer.id,
    customerName: customer.name,
    requestedAmount,
    tenure,
    interestRate,
    emi,
    status: "initiated",
    kycStatus: "pending",
    salarySlipUploaded: false,
    salarySlipVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const isWithinLimit = requestedAmount <= customer.preApprovedLimit;
  const isWithinDouble = requestedAmount <= customer.preApprovedLimit * 2;
  const maxLimit = customer.preApprovedLimit * 2;

  // Reject immediately if amount exceeds 2x pre-approved limit
  if (!isWithinDouble) {
    application.status = "rejected";
    application.rejectionReason = `Requested amount of ₹${requestedAmount.toLocaleString('en-IN')} exceeds maximum lending limit of ₹${maxLimit.toLocaleString('en-IN')} (2x pre-approved limit).`;

    return {
      message: createMessage(
        `I appreciate your interest in ₹${requestedAmount.toLocaleString('en-IN')}. However, this exceeds our maximum lending limit for your profile. ` +
        `Based on your pre-approved limit of ₹${customer.preApprovedLimit.toLocaleString('en-IN')}, the maximum I can offer is ₹${maxLimit.toLocaleString('en-IN')}. ` +
        `Would you like to proceed with a lower amount?`,
        "sales"
      ),
      application,
      currentStep: "needs_assessment",
      suggestedResponses: [`₹${maxLimit.toLocaleString('en-IN')}`, `₹${customer.preApprovedLimit.toLocaleString('en-IN')}`, "No, thank you"],
    };
  }

  let responseText: string;
  if (isWithinLimit) {
    responseText = `Excellent choice! Based on your profile, here's your personalized offer:\n\n` +
      `Loan Amount: ₹${requestedAmount.toLocaleString('en-IN')}\n` +
      `Interest Rate: ${interestRate}% per annum\n` +
      `Tenure: ${tenure} months\n` +
      `Monthly EMI: ₹${emi.toLocaleString('en-IN')}\n\n` +
      `This is within your pre-approved limit, so we can process this quickly! Would you like to proceed with this offer?`;
  } else {
    responseText = `I can see you'd like ₹${requestedAmount.toLocaleString('en-IN')}, which is above your pre-approved limit of ₹${customer.preApprovedLimit.toLocaleString('en-IN')}. Here's what I can offer:\n\n` +
      `Loan Amount: ₹${requestedAmount.toLocaleString('en-IN')}\n` +
      `Interest Rate: ${interestRate}% per annum\n` +
      `Tenure: ${tenure} months\n` +
      `Monthly EMI: ₹${emi.toLocaleString('en-IN')}\n\n` +
      `We'll need to verify your income with a salary slip to proceed. Would you like to continue?`;
  }

  const message = createMessage(responseText, "sales", {
    loanAmount: requestedAmount,
    tenure,
    interestRate,
  });

  return {
    message,
    application,
    currentStep: "offer_presentation",
    suggestedResponses: ["Yes, proceed", "I want a different amount", "What documents do you need?"],
  };
}

async function handleOfferPresentation(
  session: ConversationSession,
  userMessage: string,
  intent: string,
  context: AgentContext,
  customer: Customer
): Promise<ChatResponse> {
  const lowerMessage = userMessage.toLowerCase();

  if (intent === "accept_offer" || intent === "confirm" || 
      lowerMessage.includes("yes") || lowerMessage.includes("proceed") || lowerMessage.includes("accept")) {
    
    if (session.application) {
      session.application.status = "verification";
      session.application.updatedAt = new Date();
    }

    const message = createMessage(
      `Great! Let me quickly verify your details. I can see your KYC is already verified with us. ` +
      `Your registered address is: ${customer.address}. Is this correct?`,
      "verification"
    );

    return {
      message,
      application: session.application,
      currentStep: "verification",
      suggestedResponses: ["Yes, that's correct", "I need to update my address"],
    };
  }

  if (intent === "reject_offer" || lowerMessage.includes("different") || lowerMessage.includes("change")) {
    return {
      message: createMessage(
        "No problem! What loan amount would work better for you? I'm here to find the best solution.",
        "sales"
      ),
      application: session.application,
      currentStep: "needs_assessment",
      suggestedResponses: ["₹3,00,000", "₹5,00,000", "₹7,00,000"],
    };
  }

  const aiResponse = await generateAgentResponse(
    "sales",
    userMessage,
    context,
    "The customer hasn't clearly accepted or rejected the offer. Answer their question and gently ask if they'd like to proceed."
  );

  return {
    message: createMessage(aiResponse, "sales"),
    application: session.application,
    currentStep: "offer_presentation",
    suggestedResponses: ["Yes, proceed with the offer", "I have more questions"],
  };
}

async function handleVerification(
  session: ConversationSession,
  userMessage: string,
  intent: string,
  context: AgentContext,
  customer: Customer
): Promise<ChatResponse> {
  const lowerMessage = userMessage.toLowerCase();

  if (intent === "confirm" || lowerMessage.includes("yes") || lowerMessage.includes("correct")) {
    if (session.application) {
      session.application.kycStatus = "verified";
      session.application.status = "underwriting";
      session.application.updatedAt = new Date();
    }

    // Check if salary slip is needed
    const needsSalarySlip = session.application && 
      session.application.requestedAmount > customer.preApprovedLimit;

    if (needsSalarySlip) {
      return {
        message: createMessage(
          `KYC verified successfully! Since your requested amount exceeds your pre-approved limit, ` +
          `I'll need your latest salary slip to verify your income. Please upload it using the file upload option.`,
          "underwriting"
        ),
        application: session.application,
        currentStep: "underwriting",
        suggestedResponses: ["I'll upload now", "What formats are accepted?"],
      };
    }

    // Instant approval path - verify credit score, pre-approved limit, and EMI ratio
    const creditResponse = getCreditScore(customer.id);
    if (session.application && creditResponse) {
      session.application.creditScore = creditResponse.creditScore;
    }

    const app = session.application;
    if (!app) {
      return {
        message: createMessage("I'm sorry, there was an issue with your application. Please try again.", "master"),
        currentStep: "closed",
        suggestedResponses: ["Start over"],
      };
    }

    // Check credit score requirement
    if (!creditResponse || creditResponse.creditScore < 700) {
      app.status = "rejected";
      app.rejectionReason = "Credit score below minimum requirement of 700";
      app.updatedAt = new Date();

      return {
        message: createMessage(
          `I apologize, but based on our credit assessment, we're unable to approve this loan at the moment. ` +
          `Your credit score of ${creditResponse?.creditScore || 'N/A'} is below our minimum requirement of 700. ` +
          `I recommend working on improving your credit score and trying again in a few months.`,
          "underwriting"
        ),
        application: app,
        currentStep: "closed",
        suggestedResponses: ["How can I improve my credit score?", "Thank you"],
      };
    }

    // For pre-approved limit amounts, still verify EMI doesn't exceed 50% of income
    const maxEMI = customer.monthlyIncome * 0.5;
    if (app.emi > maxEMI) {
      // Calculate the maximum affordable loan amount
      const monthlyRate = app.interestRate / 100 / 12;
      const maxAffordableLoan = Math.floor(maxEMI * (Math.pow(1 + monthlyRate, app.tenure) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, app.tenure)));
      
      app.status = "rejected";
      app.rejectionReason = `The EMI of ₹${app.emi.toLocaleString('en-IN')} exceeds 50% of your monthly income (₹${customer.monthlyIncome.toLocaleString('en-IN')}).`;
      app.updatedAt = new Date();

      return {
        message: createMessage(
          `I'm sorry, but the EMI of ₹${app.emi.toLocaleString('en-IN')} would exceed 50% of your monthly income. ` +
          `Based on your income of ₹${customer.monthlyIncome.toLocaleString('en-IN')}, the maximum loan you can afford is approximately ` +
          `₹${maxAffordableLoan.toLocaleString('en-IN')}. Would you like to apply for a lower amount?`,
          "underwriting"
        ),
        application: app,
        currentStep: "closed",
        suggestedResponses: [`₹${maxAffordableLoan.toLocaleString('en-IN')}`, "No, thank you"],
      };
    }

    // Verify the amount is within pre-approved limit for instant approval
    if (app.requestedAmount > customer.preApprovedLimit) {
      app.status = "rejected";
      app.rejectionReason = "Requested amount exceeds pre-approved limit and additional verification failed";
      app.updatedAt = new Date();

      return {
        message: createMessage(
          `I apologize, but the requested amount of ₹${app.requestedAmount.toLocaleString('en-IN')} exceeds your pre-approved limit of ` +
          `₹${customer.preApprovedLimit.toLocaleString('en-IN')}. Would you like to proceed with an amount within your pre-approved limit?`,
          "underwriting"
        ),
        application: app,
        currentStep: "closed",
        suggestedResponses: [`₹${customer.preApprovedLimit.toLocaleString('en-IN')}`, "No, thank you"],
      };
    }

    // All checks passed - approve the loan
    app.status = "approved";
    app.approvedAmount = app.requestedAmount;
    app.updatedAt = new Date();

    return {
      message: createMessage(
        `Excellent news! Your credit score of ${creditResponse.creditScore} looks great, and your loan is approved! ` +
        `Amount: ₹${app.requestedAmount.toLocaleString('en-IN')} at ${app.interestRate}% p.a. ` +
        `Monthly EMI: ₹${app.emi.toLocaleString('en-IN')} (${Math.round(app.emi / customer.monthlyIncome * 100)}% of your income). ` +
        `Shall I generate your sanction letter now?`,
        "underwriting"
      ),
      application: app,
      currentStep: "decision",
      suggestedResponses: ["Yes, generate sanction letter", "Can I get more details?"],
    };
  }

  const aiResponse = await generateAgentResponse(
    "verification",
    userMessage,
    context,
    "Handle the customer's response about verification. If they need to update details, guide them."
  );

  return {
    message: createMessage(aiResponse, "verification"),
    application: session.application,
    currentStep: "verification",
    suggestedResponses: ["Yes, my details are correct", "I need to update something"],
  };
}

async function handleUnderwriting(
  session: ConversationSession,
  userMessage: string,
  intent: string,
  context: AgentContext,
  customer: Customer
): Promise<ChatResponse> {
  // Check if salary slip was uploaded
  if (session.application?.salarySlipUploaded && session.application?.salarySlipVerified) {
    return handleSalarySlipVerified(session, customer);
  }

  const aiResponse = await generateAgentResponse(
    "underwriting",
    userMessage,
    context,
    "The customer needs to upload their salary slip. Guide them through the process."
  );

  return {
    message: createMessage(aiResponse, "underwriting"),
    application: session.application,
    currentStep: "underwriting",
    suggestedResponses: ["I'll upload now", "PDF", "What's the maximum file size?"],
  };
}

function handleSalarySlipVerified(
  session: ConversationSession,
  customer: Customer
): ChatResponse {
  const app = session.application!;
  const maxEMI = customer.monthlyIncome * 0.5;

  if (app.emi <= maxEMI && customer.creditScore >= 700) {
    app.status = "approved";
    app.approvedAmount = app.requestedAmount;
    app.updatedAt = new Date();

    return {
      message: createMessage(
        `Great news! Your salary slip has been verified. With a monthly income of ₹${customer.monthlyIncome.toLocaleString('en-IN')} ` +
        `and EMI of ₹${app.emi.toLocaleString('en-IN')} (${Math.round(app.emi / customer.monthlyIncome * 100)}% of income), ` +
        `your loan is approved! Ready for your sanction letter?`,
        "underwriting"
      ),
      application: app,
      currentStep: "decision",
      suggestedResponses: ["Yes, generate sanction letter", "Show me the final terms"],
    };
  } else {
    let reason = "";
    if (customer.creditScore < 700) {
      reason = `Your credit score of ${customer.creditScore} is below our minimum requirement of 700.`;
    } else {
      reason = `The EMI of ₹${app.emi.toLocaleString('en-IN')} exceeds 50% of your monthly income.`;
    }

    app.status = "rejected";
    app.rejectionReason = reason;
    app.updatedAt = new Date();

    return {
      message: createMessage(
        `I'm sorry, but we're unable to approve this loan application. ${reason} ` +
        `Would you like to apply for a lower amount that fits within your eligibility?`,
        "underwriting"
      ),
      application: app,
      currentStep: "closed",
      suggestedResponses: ["Try a lower amount", "No, thank you"],
    };
  }
}

async function handleDecision(
  session: ConversationSession,
  userMessage: string,
  intent: string,
  context: AgentContext,
  customer: Customer
): Promise<ChatResponse> {
  const lowerMessage = userMessage.toLowerCase();

  if (intent === "confirm" || lowerMessage.includes("yes") || lowerMessage.includes("generate")) {
    if (session.application) {
      session.application.status = "sanctioned";
      session.application.updatedAt = new Date();
    }

    return {
      message: createMessage(
        `Congratulations, ${customer.name}! Your personal loan sanction letter is ready! ` +
        `Loan Amount: ₹${session.application?.approvedAmount?.toLocaleString('en-IN')}\n` +
        `Interest Rate: ${session.application?.interestRate}% p.a.\n` +
        `Monthly EMI: ₹${session.application?.emi.toLocaleString('en-IN')}\n` +
        `Tenure: ${session.application?.tenure} months\n\n` +
        `You can download your sanction letter from the sidebar. The amount will be disbursed within 2-3 business days. Thank you for choosing Tata Capital!`,
        "sanction"
      ),
      application: session.application,
      currentStep: "sanction",
      suggestedResponses: ["Download sanction letter", "Thank you!"],
    };
  }

  const aiResponse = await generateAgentResponse(
    "underwriting",
    userMessage,
    context,
    "The loan is approved. Answer any questions and encourage them to proceed with the sanction letter."
  );

  return {
    message: createMessage(aiResponse, "underwriting"),
    application: session.application,
    currentStep: "decision",
    suggestedResponses: ["Generate sanction letter", "I have a question"],
  };
}

async function handleSanction(
  session: ConversationSession,
  userMessage: string,
  intent: string,
  context: AgentContext,
  customer: Customer
): Promise<ChatResponse> {
  const aiResponse = await generateAgentResponse(
    "sanction",
    userMessage,
    context,
    "The sanction letter is ready. Help with any final questions. Be congratulatory!"
  );

  return {
    message: createMessage(aiResponse, "sanction"),
    application: session.application,
    currentStep: "closed",
    suggestedResponses: ["Thank you!", "When will I receive the funds?"],
  };
}

async function handleGeneric(
  session: ConversationSession,
  userMessage: string,
  context: AgentContext
): Promise<ChatResponse> {
  const aiResponse = await generateAgentResponse(
    "master",
    userMessage,
    context,
    "Handle this message appropriately based on the conversation context."
  );

  return {
    message: createMessage(aiResponse, "master"),
    application: session.application,
    currentStep: session.currentStep,
    suggestedResponses: [],
  };
}

export async function handleSalarySlipUpload(
  sessionId: string,
  applicationId: string,
  fileName: string,
  fileSize: number
): Promise<ChatResponse> {
  const session = getSession(sessionId);
  const customer = session.customerId ? getCustomerById(session.customerId) : undefined;

  if (!session.application || session.application.id !== applicationId) {
    return {
      message: createMessage(
        "I couldn't find your application. Please try again or restart the conversation.",
        "master"
      ),
      currentStep: session.currentStep,
    };
  }

  // Simulate verification
  session.application.salarySlipUploaded = true;
  session.application.salarySlipVerified = true;
  session.application.updatedAt = new Date();

  const creditResponse = getCreditScore(session.customerId!);
  if (creditResponse) {
    session.application.creditScore = creditResponse.creditScore;
  }

  sessions.set(sessionId, session);

  // Process the underwriting decision
  if (customer) {
    return handleSalarySlipVerified(session, customer);
  }

  return {
    message: createMessage(
      "Your salary slip has been uploaded successfully. Processing your application...",
      "underwriting"
    ),
    application: session.application,
    currentStep: "underwriting",
  };
}

export function getApplication(applicationId: string): LoanApplication | undefined {
  return applications.get(applicationId);
}

export function getSession2(sessionId: string): ConversationSession | undefined {
  return sessions.get(sessionId);
}
