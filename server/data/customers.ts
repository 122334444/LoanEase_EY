import type { Customer, LoanOffer, CreditBureauResponse } from "@shared/schema";

// 12 synthetic customers with varied profiles
export const customers: Customer[] = [
  {
    id: "CUST001",
    name: "Vikrant Yadav",
    phone: "1003456",
    email: "vikrantyadav162@gmail.com",
    age: 35,
    city: "Varanasi",
    address: "123, Durgakund, Varanasi, Uttar Pradesh 233321",
    panNumber: "ABCPK1234A",
    aadharNumber: "1234-5678-9012",
    employmentType: "salaried",
    monthlyIncome: 80000,
    employer: "Tata Consultancy Services",
    existingLoans: [
      { type: "Home Loan", amount: 2500000, emi: 22000, remainingTenure: 120 },
    ],
    preApprovedLimit: 500000,
    creditScore: 780,
    kycVerified: true,
  },
  {
    id: "CUST002",
    name: "Priya Sharma",
    phone: "(9876564328)",
    email: "priya.sharma@email.com",
    age: 28,
    city: "Bangalore",
    address: "45, Koramangala 5th Block, Bangalore, Karnataka 560095",
    panNumber: "DEFPS5678B",
    aadharNumber: "2345-6789-0123",
    employmentType: "salaried",
    monthlyIncome: 120000,
    employer: "Infosys Limited",
    existingLoans: [],
    preApprovedLimit: 800000,
    creditScore: 820,
    kycVerified: true,
  },
  {
    id: "CUST004",
    name: "Sunita Reddy",
    phone: "9876543213",
    email: "sunita.reddy@email.com",
    age: 31,
    city: "Hyderabad",
    address: "234, Banjara Hills, Hyderabad, Telangana 500034",
    panNumber: "JKLSR3456D",
    aadharNumber: "4567-8901-2345",
    employmentType: "salaried",
    monthlyIncome: 95000,
    employer: "Amazon India",
    existingLoans: [
      { type: "Car Loan", amount: 500000, emi: 12000, remainingTenure: 36 },
    ],
    preApprovedLimit: 600000,
    creditScore: 795,
    kycVerified: true,
  },
  {
    id: "CUST005",
    name: "Vikram Singh",
    phone: "9876543214",
    email: "vikram.singh@email.com",
    age: 45,
    city: "Delhi",
    address: "567, Connaught Place, New Delhi 110001",
    panNumber: "MNUVS7890E",
    aadharNumber: "5678-9012-3456",
    employmentType: "salaried",
    monthlyIncome: 150000,
    employer: "HDFC Bank",
    existingLoans: [],
    preApprovedLimit: 1200000,
    creditScore: 840,
    kycVerified: true,
  },
  {
    id: "CUST006",
    name: "Meera Iyer",
    phone: "9876543215",
    email: "meera.iyer@email.com",
    age: 29,
    city: "Chennai",
    address: "89, T. Nagar, Chennai, Tamil Nadu 600017",
    panNumber: "OPQMI1234F",
    aadharNumber: "6789-0123-4567",
    employmentType: "salaried",
    monthlyIncome: 75000,
    employer: "Zoho Corporation",
    existingLoans: [],
    preApprovedLimit: 400000,
    creditScore: 760,
    kycVerified: true,
  },
  {
    id: "CUST007",
    name: "Arjun Nair",
    phone: "9876543216",
    email: "arjun.nair@email.com",
    age: 38,
    city: "Kochi",
    address: "12, Marine Drive, Kochi, Kerala 682031",
    panNumber: "RSTAN5678G",
    aadharNumber: "7890-1234-5678",
    employmentType: "self-employed",
    monthlyIncome: 180000,
    existingLoans: [
      {
        type: "Personal Loan",
        amount: 300000,
        emi: 15000,
        remainingTenure: 18,
      },
    ],
    preApprovedLimit: 700000,
    creditScore: 720,
    kycVerified: true,
  },
  {
    id: "CUST008",
    name: "Neha Gupta",
    phone: "9876543217",
    email: "neha.gupta@email.com",
    age: 33,
    city: "Pune",
    address: "456, Koregaon Park, Pune, Maharashtra 411001",
    panNumber: "UVWNG9012H",
    aadharNumber: "8901-2345-6789",
    employmentType: "salaried",
    monthlyIncome: 110000,
    employer: "Wipro Limited",
    existingLoans: [],
    preApprovedLimit: 900000,
    creditScore: 810,
    kycVerified: true,
  },
];

// Pre-approved loan offers
export function generateLoanOffer(
  customer: Customer,
  amount?: number,
): LoanOffer {
  const loanAmount = amount || customer.preApprovedLimit;
  const interestRate =
    customer.creditScore >= 800
      ? 10.5
      : customer.creditScore >= 750
        ? 11.5
        : customer.creditScore >= 700
          ? 12.5
          : 14.0;
  const tenure = 36;
  const monthlyRate = interestRate / 100 / 12;
  const emi = Math.round(
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
      (Math.pow(1 + monthlyRate, tenure) - 1),
  );
  const processingFee = Math.round(loanAmount * 0.02);

  return {
    id: `OFFER-${customer.id}-${Date.now()}`,
    customerId: customer.id,
    amount: loanAmount,
    interestRate,
    tenure,
    emi,
    processingFee,
    preApproved: loanAmount <= customer.preApprovedLimit,
  };
}

// Credit bureau mock response
export function getCreditScore(
  customerId: string,
): CreditBureauResponse | null {
  const customer = customers.find((c) => c.id === customerId);
  if (!customer) return null;

  return {
    customerId: customer.id,
    creditScore: customer.creditScore,
    creditHistory:
      customer.creditScore >= 750
        ? "Excellent"
        : customer.creditScore >= 700
          ? "Good"
          : "Fair",
    activeLoans: customer.existingLoans.length,
    defaultHistory: false,
  };
}

// Find customer by phone or email
export function findCustomer(identifier: string): Customer | undefined {
  const normalized = identifier.toLowerCase().trim();
  return customers.find(
    (c) =>
      c.phone === normalized ||
      c.email.toLowerCase() === normalized ||
      c.name.toLowerCase().includes(normalized),
  );
}

export function getCustomerById(id: string): Customer | undefined {
  return customers.find((c) => c.id === id);
}
