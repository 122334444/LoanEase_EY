import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { LoanApplication } from "@shared/schema";
import { 
  IndianRupee, 
  Calendar, 
  Percent, 
  Calculator,
  CheckCircle2,
  XCircle,
  Clock,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LoanSummaryCardProps {
  application?: LoanApplication;
  className?: string;
}

const statusConfig = {
  initiated: { label: "Started", color: "bg-muted text-muted-foreground", icon: Clock },
  verification: { label: "Verifying", color: "bg-chart-3/20 text-chart-3", icon: Clock },
  underwriting: { label: "Processing", color: "bg-chart-4/20 text-chart-4", icon: Clock },
  approved: { label: "Approved", color: "bg-chart-4/20 text-chart-4", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "bg-destructive/20 text-destructive", icon: XCircle },
  sanctioned: { label: "Sanctioned", color: "bg-primary/20 text-primary", icon: FileText },
};

export function LoanSummaryCard({ application, className }: LoanSummaryCardProps) {
  if (!application) {
    return (
      <Card className={cn("bg-accent/50", className)} data-testid="card-loan-summary-empty">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <IndianRupee className="h-4 w-4 text-primary" />
            Loan Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Start chatting to receive your personalized loan offer.
          </p>
        </CardContent>
      </Card>
    );
  }

  const status = statusConfig[application.status];
  const StatusIcon = status.icon;
  const displayAmount = application.approvedAmount || application.requestedAmount;

  const bgStyles = {
    approved: "bg-green-500/10 border-green-500/20",
    sanctioned: "bg-green-500/10 border-green-500/20",
    rejected: "bg-red-500/10 border-red-500/20",
    initiated: "bg-accent/50 border-accent",
    verification: "bg-accent/50 border-accent",
    underwriting: "bg-accent/50 border-accent",
  };

  const cardBg = bgStyles[application.status] || "bg-accent/50";

  return (
    <Card className={cn("transition-colors duration-500", cardBg, className)} data-testid="card-loan-summary">
      <CardHeader className="pb-3 flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <IndianRupee className="h-4 w-4 text-primary" />
          Loan Summary
        </CardTitle>
        <Badge className={cn("text-xs", status.color)}>
          <StatusIcon className="h-3 w-3 mr-1" />
          {status.label}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center py-2">
          <p className="text-xs text-muted-foreground mb-1">
            {application.approvedAmount ? "Approved Amount" : "Requested Amount"}
          </p>
          <p className="text-3xl font-bold font-mono text-foreground" data-testid="text-loan-amount">
            ₹{displayAmount.toLocaleString('en-IN')}
          </p>
        </div>

        <Separator className="bg-foreground/10" />

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Tenure</p>
              <p className="text-sm font-medium font-mono" data-testid="text-tenure">
                {application.tenure} months
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Percent className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Interest</p>
              <p className="text-sm font-medium font-mono" data-testid="text-interest-rate">
                {application.interestRate}% p.a.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2 bg-background/50 rounded-lg p-3">
          <Calculator className="h-4 w-4 text-primary mt-0.5" />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Monthly EMI</p>
            <p className="text-lg font-bold font-mono text-primary" data-testid="text-emi">
              ₹{application.emi.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {application.creditScore && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Credit Score</span>
            <span className={cn(
              "font-mono font-semibold",
              application.creditScore >= 750 ? "text-green-600 dark:text-green-400" :
              application.creditScore >= 700 ? "text-yellow-600 dark:text-yellow-400" :
              "text-red-600 dark:text-red-400"
            )} data-testid="text-credit-score">
              {application.creditScore}/900
            </span>
          </div>
        )}

        {application.rejectionReason && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <p className="text-sm text-red-600 dark:text-red-400" data-testid="text-rejection-reason">
              {application.rejectionReason}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
