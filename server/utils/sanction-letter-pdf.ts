import type { LoanApplication } from "@shared/schema";
import type { Customer } from "../data/customers";

/**
 * Generate a professional PDF sanction letter for Tata Capital
 * Uses basic PDF structure with proper formatting9120044380
 */
export function generateSanctionLetterPDF(
  application: LoanApplication,
  customer: Customer
): Buffer {
  const amount = application.approvedAmount || application.requestedAmount;
  const processingFee = Math.round(amount * 0.02);
  const totalAmount = amount + processingFee;
  const disbursementDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  const sanctionDate = new Date();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-IN');
  };

  // Create PDF content with proper structure
  const content = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/Resources <<
/Font <<
/F1 4 0 R
/F2 5 0 R
/F3 6 0 R
>>
>>
/MediaBox [0 0 612 792]
/Contents 7 0 R
>>
endobj

4 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica-Bold
>>
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

6 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Courier
>>
endobj

7 0 obj
<<
/Length 4500
>>
stream
BT
/F2 9 Tf
50 750 Td
(TATA CAPITAL) Tj
0 -12 Td
(Non-Banking Financial Company) Tj
ET

BT
/F1 10 Tf
50 720 Td
(PERSONAL LOAN SANCTION LETTER) Tj
ET

BT
/F2 8 Tf
50 705 Td
(CIN: L67190MH2007PLC164062) Tj
0 -10 Td
(Date: ${formatDate(sanctionDate)}) Tj
ET

BT
/F2 9 Tf
50 680 Td
(Ref: ${application.id}) Tj
ET

1 0 0 1 0 0 cm
BT
/F2 10 Tf
50 665 Td
(Dear ${customer.name},) Tj
ET

BT
/F2 9 Tf
50 650 Td
(We are pleased to inform you that your personal loan application has been) Tj
0 -10 Td
(approved. Please find below the details of your sanctioned loan:) Tj
ET

50 620 m
560 620 l
S

BT
/F1 10 Tf
50 605 Td
(LOAN SANCTIONED DETAILS) Tj
ET

BT
/F2 9 Tf
70 590 Td
(Applicant Name :) Tj
280 0 Td
(${customer.name}) Tj
ET

BT
/F2 9 Tf
70 577 Td
(Application ID :) Tj
280 0 Td
(${application.id}) Tj
ET

BT
/F2 9 Tf
70 564 Td
(PAN Number :) Tj
280 0 Td
(${customer.panNumber}) Tj
ET

BT
/F2 9 Tf
70 551 Td
(Address :) Tj
280 0 Td
(${customer.address}) Tj
ET

50 535 m
560 535 l
S

BT
/F1 10 Tf
50 520 Td
(LOAN OFFER DETAILS) Tj
ET

BT
/F2 9 Tf
70 505 Td
(Sanctioned Loan Amount :) Tj
280 0 Td
(Rs. ${formatCurrency(amount)}) Tj
ET

BT
/F2 9 Tf
70 492 Td
(Interest Rate :) Tj
280 0 Td
(${application.interestRate}% per annum) Tj
ET

BT
/F2 9 Tf
70 479 Td
(Loan Tenure :) Tj
280 0 Td
(${application.tenure} months) Tj
ET

BT
/F2 9 Tf
70 466 Td
(Monthly EMI :) Tj
280 0 Td
(Rs. ${formatCurrency(application.emi)}) Tj
ET

BT
/F2 9 Tf
70 453 Td
(Processing Fee :) Tj
280 0 Td
(Rs. ${formatCurrency(processingFee)}) Tj
ET

BT
/F2 9 Tf
70 440 Td
(Total Loan Amount (incl. Fee) :) Tj
280 0 Td
(Rs. ${formatCurrency(totalAmount)}) Tj
ET

50 425 m
560 425 l
S

BT
/F1 10 Tf
50 410 Td
(DISBURSEMENT) Tj
ET

BT
/F2 9 Tf
70 395 Td
(Expected Disbursement Date :) Tj
280 0 Td
(${formatDate(disbursementDate)}) Tj
ET

BT
/F2 9 Tf
70 382 Td
(Mode of Disbursement :) Tj
280 0 Td
(Direct to Bank Account) Tj
ET

50 365 m
560 365 l
S

BT
/F1 9 Tf
50 350 Td
(TERMS AND CONDITIONS) Tj
ET

BT
/F2 8 Tf
70 335 Td
(1. This sanction is valid for 30 days from the date of issue.) Tj
0 -10 Td
(2. All mandatory documents must be submitted before disbursement.) Tj
0 -10 Td
(3. EMI will be auto-deducted via ECS/NACH from your bank account.) Tj
0 -10 Td
(4. Late payment charges @ 2% per month will be applicable on overdue EMIs.) Tj
0 -10 Td
(5. Prepayment is allowed after 6 EMIs without prepayment charges.) Tj
0 -10 Td
(6. The loan is subject to our standard terms and conditions.) Tj
ET

BT
/F2 9 Tf
50 230 Td
(This letter is computer generated and does not require signature.) Tj
ET

BT
/F2 8 Tf
50 215 Td
(For any queries or assistance, please contact:) Tj
0 -10 Td
(Email: support@tatacapital.com | Phone: 1800-XXX-XXXX) Tj
ET

BT
/F1 10 Tf
50 185 Td
(Tata Capital Financial Services Limited) Tj
ET

BT
/F2 8 Tf
50 170 Td
(Authorized Signatory) Tj
ET

endstream
endobj

xref
0 8
0000000000 65535 f 
0000000010 00000 n 
0000000079 00000 n 
0000000137 00000 n 
0000000289 00000 n 
0000000373 00000 n 
0000000462 00000 n 
0000000555 00000 n 
trailer
<<
/Size 8
/Root 1 0 R
>>
startxref
5120
%%EOF`;

  return Buffer.from(content, 'utf-8');
}
