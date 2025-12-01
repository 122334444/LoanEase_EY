import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  HelpCircle, 
  Shield,
  Menu
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onMenuClick?: () => void;
  showMenu?: boolean;
  className?: string;
}

export function Header({ onMenuClick, showMenu = false, className }: HeaderProps) {
  return (
    <header 
      className={cn(
        "h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80",
        "sticky top-0 z-50",
        "flex items-center justify-between px-4 gap-4",
        className
      )}
      data-testid="header"
    >
      <div className="flex items-center gap-3">
        {showMenu && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={onMenuClick}
            data-testid="button-menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <MessageSquare className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-base font-semibold leading-tight">LoanEase</h1>
            <p className="text-xs text-muted-foreground leading-tight">by Tata Capital</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="outline" className="hidden sm:flex gap-1 text-xs">
          <Shield className="h-3 w-3 text-chart-4" />
          Secure
        </Badge>
        
        <Button 
          variant="ghost" 
          size="icon"
          data-testid="button-help"
        >
          <HelpCircle className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
