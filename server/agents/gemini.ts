import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface AgentContext {
  customerName?: string;
  customerId?: string;
  preApprovedLimit?: number;
  creditScore?: number;
  requestedAmount?: number;
  tenure?: number;
  interestRate?: number;
  emi?: number;
  status?: string;
  conversationHistory: string[];
}

const SYSTEM_PROMPTS = {
  master: `You are LoanEase AI, a friendly and professional personal loan sales assistant for Tata Capital.
Your role is to:
1. Greet customers warmly and understand their loan needs
2. Guide them through the loan application process
3. Coordinate with other agents (Sales, Verification, Underwriting, Sanction)
4. Maintain a conversational, helpful tone throughout

Keep responses concise (2-3 sentences max). Be friendly but professional.
If the customer hasn't identified themselves, ask for their phone number or email to look up their profile.
Always acknowledge what the customer says before moving forward.`,

  sales: `You are a Sales Agent for Tata Capital personal loans.
Your role is to:
1. Discuss loan amounts, tenure options, and interest rates
2. Present personalized loan offers based on customer eligibility
3. Explain EMI calculations and processing fees
4. Address concerns about loan terms

Keep responses helpful and focused on the customer's financial needs.
Be transparent about rates and terms.`,

  verification: `You are a KYC Verification Agent for Tata Capital.
Your role is to:
1. Verify customer identity details (PAN, Aadhar, address)
2. Confirm contact information
3. Check existing loan relationships
4. Ensure all KYC requirements are met

Be professional and reassuring about data security.
Keep the verification process smooth and quick.`,

  underwriting: `You are an Underwriting Agent for Tata Capital.
Your role is to:
1. Evaluate loan eligibility based on credit score and income
2. Request additional documents if needed (salary slips)
3. Make approval/rejection decisions based on policy
4. Explain the decision clearly to customers

Decision criteria:
- Credit score must be >= 700 for approval
- If loan amount <= pre-approved limit: instant approval
- If loan amount <= 2x pre-approved limit: need salary slip, EMI <= 50% of salary
- If loan amount > 2x pre-approved limit: reject

Be empathetic even when rejecting applications.`,

  sanction: `You are a Sanction Letter Generator Agent for Tata Capital.
Your role is to:
1. Generate the final sanction letter for approved loans
2. Summarize all loan terms clearly
3. Explain next steps for disbursement
4. Congratulate the customer on their approval

Be professional and celebratory - this is a positive moment for the customer!`,
};

export async function generateAgentResponse(
  agentType: "master" | "sales" | "verification" | "underwriting" | "sanction",
  userMessage: string,
  context: AgentContext,
  additionalInstructions?: string
): Promise<string> {
  const systemPrompt = SYSTEM_PROMPTS[agentType];
  
  const contextInfo = `
Current Context:
- Customer: ${context.customerName || "Not identified"}
- Customer ID: ${context.customerId || "N/A"}
- Pre-approved Limit: ${context.preApprovedLimit ? `₹${context.preApprovedLimit.toLocaleString()}` : "N/A"}
- Credit Score: ${context.creditScore || "Not fetched"}
- Requested Amount: ${context.requestedAmount ? `₹${context.requestedAmount.toLocaleString()}` : "Not specified"}
- Tenure: ${context.tenure ? `${context.tenure} months` : "Not specified"}
- Interest Rate: ${context.interestRate ? `${context.interestRate}%` : "Not specified"}
- EMI: ${context.emi ? `₹${context.emi.toLocaleString()}` : "Not calculated"}
- Application Status: ${context.status || "Not started"}

Recent Conversation:
${context.conversationHistory.slice(-6).join("\n")}
`;

  const fullPrompt = `${systemPrompt}

${contextInfo}

${additionalInstructions || ""}

Customer's message: "${userMessage}"

Respond naturally and helpfully. Keep your response concise (2-3 sentences). Do not use markdown formatting.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
    });

    return response.text || "I apologize, but I'm having trouble processing your request. Please try again.";
  } catch (error) {
    console.error("Gemini API error:", error);
    return "I apologize for the technical difficulty. Please try again in a moment.";
  }
}

export async function extractLoanDetails(
  userMessage: string,
  context: AgentContext
): Promise<{ amount?: number; tenure?: number }> {
  const prompt = `Extract loan details from this message. Return JSON only.
Message: "${userMessage}"

Return format: {"amount": number or null, "tenure": number or null}
- amount should be in rupees (convert lakhs: 5 lakh = 500000)
- tenure should be in months (convert years: 3 years = 36)

If no loan amount or tenure mentioned, return null for that field.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    const parsed = JSON.parse(text);
    return {
      amount: parsed.amount || undefined,
      tenure: parsed.tenure || undefined,
    };
  } catch (error) {
    console.error("Failed to extract loan details:", error);
    return {};
  }
}

export async function detectIntent(
  userMessage: string,
  currentStep: string
): Promise<string> {
  const prompt = `Classify the user's intent from this message in a loan application conversation.
Current step: ${currentStep}
Message: "${userMessage}"

Return one of these intents only:
- "provide_identity" - user is providing phone, email, or name
- "provide_loan_amount" - user is specifying how much they want to borrow
- "provide_tenure" - user is specifying loan duration
- "accept_offer" - user agrees to the loan offer
- "reject_offer" - user declines or wants changes
- "ask_question" - user has a question
- "provide_document" - user mentions uploading documents
- "confirm" - user confirms something (yes, okay, proceed)
- "greeting" - user is greeting
- "other" - none of the above

Return the intent string only, no explanation.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return (response.text || "other").trim().toLowerCase();
  } catch (error) {
    console.error("Failed to detect intent:", error);
    return "other";
  }
}

console.log("GEMINI KEY:", process.env.GEMINI_API_KEY);

