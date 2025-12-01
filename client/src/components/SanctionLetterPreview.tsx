import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Download, Printer, CheckCircle2 } from "lucide-react";
import type { SanctionLetter } from "@shared/schema";
import { motion } from "framer-motion";

interface SanctionLetterPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  letter: SanctionLetter | null;
  onDownload?: () => void;
}

export function SanctionLetterPreview({
  open,
  onOpenChange,
  letter,
  onDownload,
}: SanctionLetterPreviewProps) {
  if (!letter) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-sanction-letter">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-chart-4" />
            Loan Sanction Letter
          </DialogTitle>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border rounded-lg p-6 space-y-6"
        >
          <div className="text-center border-b pb-4">
            <h2 className="text-xl font-bold text-primary">TATA CAPITAL</h2>
            <p className="text-xs text-muted-foreground mt-1">Non-Banking Financial Company</p>
          </div>

          <div className="text-center">
            <h3 className="text-lg font-semibold">PERSONAL LOAN SANCTION LETTER</h3>
            <p className="text-sm text-muted-foreground">
              Date: {new Date(letter.sanctionDate).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm">Dear <span className="font-semibold">{letter.customerName}</span>,</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We are pleased to inform you that your personal loan application has been approved. 
              Please find below the details of your sanctioned loan:
            </p>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-3">
              <div>
                <p className="text-muted-foreground text-xs">Application ID</p>
                <p className="font-mono font-medium" data-testid="text-application-id">{letter.applicationId}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Sanctioned Amount</p>
                <p className="font-mono font-bold text-lg text-primary" data-testid="text-sanctioned-amount">
                  ₹{letter.loanAmount.toLocaleString('en-IN')}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Interest Rate</p>
                <p className="font-mono font-medium" data-testid="text-sanctioned-interest">
                  {letter.interestRate}% per annum
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-muted-foreground text-xs">Tenure</p>
                <p className="font-mono font-medium" data-testid="text-sanctioned-tenure">
                  {letter.tenure} months
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Monthly EMI</p>
                <p className="font-mono font-bold text-lg" data-testid="text-sanctioned-emi">
                  ₹{letter.emi.toLocaleString('en-IN')}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Processing Fee</p>
                <p className="font-mono font-medium">
                  ₹{letter.processingFee.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-xs text-muted-foreground">Expected Disbursement Date</p>
            <p className="font-medium" data-testid="text-disbursement-date">
              {new Date(letter.disbursementDate).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">TERMS AND CONDITIONS</p>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              {letter.termsAndConditions.map((term, idx) => (
                <li key={idx}>{term}</li>
              ))}
            </ul>
          </div>

          <div className="pt-4 space-y-2 text-center">
            <p className="text-xs text-muted-foreground">
              For any queries, please contact our customer support at 1800-XXX-XXXX
            </p>
            <p className="text-xs font-medium">
              This is a system-generated document and does not require a signature.
            </p>
          </div>
        </motion.div>

        <div className="flex gap-2 justify-end pt-4">
          <Button 
            variant="outline" 
            onClick={() => window.print()}
            data-testid="button-print-letter"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button 
            onClick={onDownload}
            data-testid="button-download-letter"
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
