import { motion } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { ChatMessage as ChatMessageType } from "@shared/schema";
import { agentTypeLabels } from "@shared/schema";
import { Bot, User, Briefcase, Shield, Calculator, FileCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: ChatMessageType;
  isLatest?: boolean;
}

const agentIcons: Record<string, typeof Bot> = {
  master: Bot,
  sales: Briefcase,
  verification: Shield,
  underwriting: Calculator,
  sanction: FileCheck,
};

const agentColors: Record<string, string> = {
  master: "bg-primary text-primary-foreground",
  sales: "bg-chart-2 text-white",
  verification: "bg-chart-3 text-white",
  underwriting: "bg-chart-4 text-white",
  sanction: "bg-chart-5 text-foreground",
};

export function ChatMessage({ message, isLatest }: ChatMessageProps) {
  const isUser = message.role === "user";
  const agentType = message.agentType || "master";
  const AgentIcon = agentIcons[agentType] || Bot;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className={cn(
        "flex gap-3 max-w-[85%]",
        isUser ? "ml-auto flex-row-reverse" : "mr-auto"
      )}
      data-testid={`chat-message-${message.id}`}
    >
      {!isUser && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className={cn("text-xs", agentColors[agentType])}>
            <AgentIcon className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}

      <div className={cn("flex flex-col gap-1", isUser ? "items-end" : "items-start")}>
        {!isUser && (
          <Badge variant="secondary" className="text-xs font-medium px-2 py-0.5">
            {agentTypeLabels[agentType] || "AI Assistant"}
          </Badge>
        )}
        
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-relaxed",
            isUser
              ? "bg-primary text-primary-foreground rounded-br-md"
              : "bg-card border border-card-border rounded-bl-md"
          )}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
          
          {message.metadata?.loanAmount && (
            <div className="mt-3 pt-3 border-t border-current/10 space-y-1 font-mono text-xs">
              <div className="flex justify-between gap-4">
                <span className="opacity-70">Loan Amount:</span>
                <span className="font-semibold">₹{message.metadata.loanAmount.toLocaleString('en-IN')}</span>
              </div>
              {message.metadata.tenure && (
                <div className="flex justify-between gap-4">
                  <span className="opacity-70">Tenure:</span>
                  <span className="font-semibold">{message.metadata.tenure} months</span>
                </div>
              )}
              {message.metadata.interestRate && (
                <div className="flex justify-between gap-4">
                  <span className="opacity-70">Interest Rate:</span>
                  <span className="font-semibold">{message.metadata.interestRate}% p.a.</span>
                </div>
              )}
            </div>
          )}
        </div>

        <span className="text-xs text-muted-foreground px-1">
          {new Date(message.timestamp).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>

      {isUser && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-secondary text-secondary-foreground">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </motion.div>
  );
}

export function TypingIndicator({ agentType = "master" }: { agentType?: string }) {
  const AgentIcon = agentIcons[agentType] || Bot;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex gap-3 max-w-[85%] mr-auto"
      data-testid="typing-indicator"
    >
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className={cn("text-xs", agentColors[agentType])}>
          <AgentIcon className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col gap-1 items-start">
        <Badge variant="secondary" className="text-xs font-medium px-2 py-0.5">
          {agentTypeLabels[agentType] || "AI Assistant"}
        </Badge>
        
        <div className="bg-card border border-card-border rounded-2xl rounded-bl-md px-4 py-3">
          <div className="flex gap-1.5">
            <motion.span
              className="w-2 h-2 rounded-full bg-muted-foreground"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0 }}
            />
            <motion.span
              className="w-2 h-2 rounded-full bg-muted-foreground"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
            />
            <motion.span
              className="w-2 h-2 rounded-full bg-muted-foreground"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
