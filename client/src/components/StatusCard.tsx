import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText,
  ArrowRight,
  RefreshCcw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface StatusCardProps {
  status: "approved" | "rejected" | "pending" | "sanctioned";
  title: string;
  message: string;
  details?: { label: string; value: string }[];
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const statusConfig = {
  approved: {
    icon: CheckCircle2,
    iconBg: "bg-chart-4/10",
    iconColor: "text-chart-4",
  },
  rejected: {
    icon: XCircle,
    iconBg: "bg-destructive/10",
    iconColor: "text-destructive",
  },
  pending: {
    icon: Clock,
    iconBg: "bg-chart-5/10",
    iconColor: "text-chart-5",
  },
  sanctioned: {
    icon: FileText,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
};

export function StatusCard({
  status,
  title,
  message,
  details,
  primaryAction,
  secondaryAction,
  className,
}: StatusCardProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={cn("text-center", className)} data-testid={`card-status-${status}`}>
        <CardContent className="pt-8 pb-6 px-6 space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5, delay: 0.1 }}
            className={cn(
              "w-16 h-16 rounded-full mx-auto flex items-center justify-center",
              config.iconBg
            )}
          >
            <Icon className={cn("h-8 w-8", config.iconColor)} />
          </motion.div>

          <div className="space-y-2">
            <h3 className="text-xl font-semibold" data-testid="text-status-title">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground" data-testid="text-status-message">
              {message}
            </p>
          </div>

          {details && details.length > 0 && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-left">
              {details.map((detail, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{detail.label}</span>
                  <span className="font-medium font-mono">{detail.value}</span>
                </div>
              ))}
            </div>
          )}

          {(primaryAction || secondaryAction) && (
            <div className="flex gap-2 justify-center pt-2">
              {secondaryAction && (
                <Button
                  variant="outline"
                  onClick={secondaryAction.onClick}
                  data-testid="button-secondary-action"
                >
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  {secondaryAction.label}
                </Button>
              )}
              {primaryAction && (
                <Button
                  onClick={primaryAction.onClick}
                  data-testid="button-primary-action"
                >
                  {primaryAction.label}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
