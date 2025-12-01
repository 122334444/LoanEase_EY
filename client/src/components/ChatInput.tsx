import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send, Paperclip, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ChatInputProps {
  onSend: (message: string) => void;
  onFileUpload?: (file: File) => void;
  disabled?: boolean;
  isLoading?: boolean;
  suggestedResponses?: string[];
  placeholder?: string;
  showFileUpload?: boolean;
}

export function ChatInput({
  onSend,
  onFileUpload,
  disabled,
  isLoading,
  suggestedResponses,
  placeholder = "Type your message...",
  showFileUpload = false,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSubmit = () => {
    if (message.trim() && !disabled && !isLoading) {
      onSend(message.trim());
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileUpload) {
      onFileUpload(file);
    }
    e.target.value = "";
  };

  const handleSuggestedClick = (suggestion: string) => {
    if (!disabled && !isLoading) {
      onSend(suggestion);
    }
  };

  return (
    <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <AnimatePresence>
        {suggestedResponses && suggestedResponses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 pt-3 pb-1 flex flex-wrap gap-2"
          >
            {suggestedResponses.map((suggestion, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                className="text-xs h-8"
                onClick={() => handleSuggestedClick(suggestion)}
                disabled={disabled || isLoading}
                data-testid={`button-suggestion-${idx}`}
              >
                {suggestion}
              </Button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-4 flex items-end gap-2">
        {showFileUpload && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={handleFileChange}
              data-testid="input-file-upload"
            />
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isLoading}
              data-testid="button-attach-file"
            >
              <Paperclip className="h-5 w-5" />
            </Button>
          </>
        )}

        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isLoading}
            rows={1}
            className={cn(
              "w-full resize-none rounded-2xl border bg-card px-4 py-3 pr-12",
              "text-sm placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "min-h-[48px] max-h-[120px]"
            )}
            data-testid="input-chat-message"
          />
          <Button
            size="icon"
            className={cn(
              "absolute right-2 bottom-2 h-8 w-8 rounded-full",
              "transition-all duration-200",
              message.trim() ? "opacity-100 scale-100" : "opacity-50 scale-95"
            )}
            onClick={handleSubmit}
            disabled={!message.trim() || disabled || isLoading}
            data-testid="button-send-message"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
