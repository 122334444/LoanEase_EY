import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { LoanOffer } from "@shared/schema";
import { 
  IndianRupee, 
  Percent, 
  Calendar, 
  Sparkles,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface LoanOfferCardProps {
  offer: LoanOffer;
  onAccept?: (offer: LoanOffer) => void;
  onCustomize?: (offer: LoanOffer) => void;
  isSelected?: boolean;
  className?: string;
}

export function LoanOfferCard({
  offer,
  onAccept,
  onCustomize,
  isSelected,
  className,
}: LoanOfferCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className={cn(
          "relative overflow-visible transition-all duration-200",
          isSelected && "ring-2 ring-primary",
          className
        )}
        data-testid={`card-loan-offer-${offer.id}`}
      >
        {offer.preApproved && (
          <Badge 
            className="absolute -top-2 left-4 bg-chart-5 text-foreground"
          >
            <Sparkles className="h-3 w-3 mr-1" />
            Pre-Approved
          </Badge>
        )}

        <CardHeader className="pb-2 pt-6">
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Loan Amount</p>
            <p className="text-4xl font-bold font-mono text-foreground" data-testid="text-offer-amount">
              ₹{offer.amount.toLocaleString('en-IN')}
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1 text-muted-foreground">
                <Percent className="h-3.5 w-3.5" />
                <span className="text-xs">Interest Rate</span>
              </div>
              <p className="text-lg font-semibold font-mono" data-testid="text-offer-interest">
                {offer.interestRate}%
              </p>
              <p className="text-xs text-muted-foreground">per annum</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1 text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span className="text-xs">Tenure</span>
              </div>
              <p className="text-lg font-semibold font-mono" data-testid="text-offer-tenure">
                {offer.tenure}
              </p>
              <p className="text-xs text-muted-foreground">months</p>
            </div>
          </div>

          <Separator />

          <div className="bg-primary/5 rounded-lg p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Monthly EMI</p>
            <div className="flex items-center justify-center gap-1">
              <IndianRupee className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold font-mono text-primary" data-testid="text-offer-emi">
                {offer.emi.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Processing Fee</span>
            <span className="font-mono">₹{offer.processingFee.toLocaleString('en-IN')}</span>
          </div>
        </CardContent>

        <CardFooter className="flex gap-2 pt-2">
          {onCustomize && (
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => onCustomize(offer)}
              data-testid="button-customize-offer"
            >
              Customize
            </Button>
          )}
          {onAccept && (
            <Button 
              className="flex-1"
              onClick={() => onAccept(offer)}
              data-testid="button-accept-offer"
            >
              Accept Offer
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
