import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { 
  initializeSession, 
  processMessage, 
  handleSalarySlipUpload,
  getApplication,
  getSession2
} from "./agents/orchestrator";
import { customers, getCustomerById, getCreditScore, generateLoanOffer } from "./data/customers";
import { generateSanctionLetterPDF } from "./utils/sanction-letter-pdf";
import type { SanctionLetter } from "@shared/schema";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Initialize a new chat session
  app.get("/api/chat/init", async (req: Request, res: Response) => {
    try {
      const sessionId = req.query.sessionId as string;
      if (!sessionId) {
        return res.status(400).json({ error: "Session ID required" });
      }
      const response = await initializeSession(sessionId);
      res.json(response);
    } catch (error) {
      console.error("Init session error:", error);
      res.status(500).json({ error: "Failed to initialize session" });
    }
  });

  // Send a message in the chat
  app.post("/api/chat/send", async (req: Request, res: Response) => {
    try {
      const { sessionId, message, customerId } = req.body;
      if (!sessionId || !message) {
        return res.status(400).json({ error: "Session ID and message required" });
      }
      const response = await processMessage(sessionId, message, customerId);
      res.json(response);
    } catch (error) {
      console.error("Send message error:", error);
      res.status(500).json({ error: "Failed to process message" });
    }
  });

  // Upload salary slip
  app.post("/api/chat/upload-salary-slip", upload.single("file"), async (req: Request, res: Response) => {
    try {
      const { sessionId, applicationId } = req.body;
      const file = req.file;

      if (!sessionId || !applicationId || !file) {
        return res.status(400).json({ error: "Session ID, application ID, and file required" });
      }

      const response = await handleSalarySlipUpload(
        sessionId,
        applicationId,
        file.originalname,
        file.size
      );
      res.json(response);
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Failed to upload file" });
    }
  });

  // Get sanction letter data
  app.get("/api/chat/sanction-letter", async (req: Request, res: Response) => {
    try {
      const applicationId = req.query.applicationId as string;
      if (!applicationId) {
        return res.status(400).json({ error: "Application ID required" });
      }

      const application = getApplication(applicationId);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }

      if (application.status !== "sanctioned") {
        return res.status(400).json({ error: "Loan not yet sanctioned" });
      }

      const customer = getCustomerById(application.customerId);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }

      const sanctionLetter: SanctionLetter = {
        applicationId: application.id,
        customerName: customer.name,
        loanAmount: application.approvedAmount || application.requestedAmount,
        interestRate: application.interestRate,
        tenure: application.tenure,
        emi: application.emi,
        processingFee: Math.round((application.approvedAmount || application.requestedAmount) * 0.02),
        disbursementDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        sanctionDate: new Date().toISOString(),
        termsAndConditions: [
          "This sanction is valid for 30 days from the date of issue.",
          "The loan amount will be disbursed to your registered bank account.",
          "EMI will be deducted automatically via ECS/NACH mandate.",
          "Prepayment is allowed after 6 EMIs with no prepayment charges.",
          "Late payment penalty of 2% per month will be applicable on overdue EMIs.",
          "The borrower agrees to maintain adequate insurance coverage.",
          "Tata Capital reserves the right to modify interest rates as per RBI guidelines.",
        ],
      };

      res.json(sanctionLetter);
    } catch (error) {
      console.error("Sanction letter error:", error);
      res.status(500).json({ error: "Failed to generate sanction letter" });
    }
  });

  // Download sanction letter as PDF
  app.get("/api/chat/download-sanction-letter", async (req: Request, res: Response) => {
    try {
      const applicationId = req.query.applicationId as string;
      if (!applicationId) {
        return res.status(400).json({ error: "Application ID required" });
      }

      const application = getApplication(applicationId);
      if (!application || application.status !== "sanctioned") {
        return res.status(404).json({ error: "Sanctioned application not found" });
      }

      const customer = getCustomerById(application.customerId);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }

      // Generate professional PDF with bank header
      const pdfBuffer = generateSanctionLetterPDF(application, customer);
      
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=sanction-letter-${applicationId}.pdf`);
      res.setHeader("Content-Length", pdfBuffer.length);
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Download error:", error);
      res.status(500).json({ error: "Failed to download sanction letter" });
    }
  });

  // Get all customers (for demo purposes)
  app.get("/api/customers", (req: Request, res: Response) => {
    const safeCustomers = customers.map(c => ({
      id: c.id,
      name: c.name,
      phone: c.phone.slice(-4).padStart(10, '*'),
      city: c.city,
      preApprovedLimit: c.preApprovedLimit,
    }));
    res.json(safeCustomers);
  });

  // Get credit score (mock credit bureau API)
  app.get("/api/credit-bureau/:customerId", (req: Request, res: Response) => {
    const { customerId } = req.params;
    const creditResponse = getCreditScore(customerId);
    if (!creditResponse) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.json(creditResponse);
  });

  // Get loan offers (mock offer mart)
  app.get("/api/offers/:customerId", (req: Request, res: Response) => {
    const { customerId } = req.params;
    const customer = getCustomerById(customerId);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    const offers = [
      generateLoanOffer(customer, customer.preApprovedLimit),
      generateLoanOffer(customer, Math.round(customer.preApprovedLimit * 0.5)),
      generateLoanOffer(customer, Math.round(customer.preApprovedLimit * 0.75)),
    ];

    res.json(offers);
  });

  return httpServer;
}

// Simple PDF generation (creates a basic PDF structure)
function generateSanctionLetterPDF(application: any, customer: any): Buffer {
  const amount = application.approvedAmount || application.requestedAmount;
  const processingFee = Math.round(amount * 0.02);
  const date = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Create a simple PDF structure
  const content = `
TATA CAPITAL
Non-Banking Financial Company

PERSONAL LOAN SANCTION LETTER

Date: ${date}
Application ID: ${application.id}

Dear ${customer.name},

We are pleased to inform you that your personal loan application has been approved.

LOAN DETAILS:
--------------
Sanctioned Amount: Rs. ${amount.toLocaleString('en-IN')}
Interest Rate: ${application.interestRate}% per annum
Tenure: ${application.tenure} months
Monthly EMI: Rs. ${application.emi.toLocaleString('en-IN')}
Processing Fee: Rs. ${processingFee.toLocaleString('en-IN')}

DISBURSEMENT:
The loan amount will be disbursed to your registered bank account within 2-3 business days.

TERMS AND CONDITIONS:
1. This sanction is valid for 30 days from the date of issue.
2. EMI will be deducted automatically via ECS/NACH mandate.
3. Prepayment is allowed after 6 EMIs with no prepayment charges.
4. Late payment penalty of 2% per month will be applicable on overdue EMIs.

Thank you for choosing Tata Capital.

For any queries, please contact: 1800-XXX-XXXX

This is a system-generated document.
  `.trim();

  // Create minimal PDF structure
  const pdfHeader = '%PDF-1.4\n';
  const textContent = content.split('\n').map((line, i) => 
    `BT /F1 12 Tf 50 ${800 - i * 14} Td (${line.replace(/[()\\]/g, '\\$&')}) Tj ET`
  ).join('\n');

  const pdfBody = `
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj

2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj

3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj

4 0 obj
<< /Length ${textContent.length} >>
stream
${textContent}
endstream
endobj

5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000266 00000 n 
0000000${(350 + textContent.length).toString().padStart(3, '0')} 00000 n 

trailer
<< /Size 6 /Root 1 0 R >>
startxref
${400 + textContent.length}
%%EOF`;

  return Buffer.from(pdfHeader + pdfBody, 'utf-8');
}
