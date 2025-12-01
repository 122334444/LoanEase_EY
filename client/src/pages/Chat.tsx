import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { ChatMessage, TypingIndicator } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { ProgressTracker } from "@/components/ProgressTracker";
import { LoanSummaryCard } from "@/components/LoanSummaryCard";
import { FileUpload } from "@/components/FileUpload";
import { SanctionLetterPreview } from "@/components/SanctionLetterPreview";
import { useToast } from "@/hooks/use-toast";
import type { 
  ChatMessage as ChatMessageType, 
  ChatResponse, 
  LoanApplication,
  SanctionLetter,
  ConversationSession
} from "@shared/schema";
import { AnimatePresence } from "framer-motion";
import { PanelRight, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Chat() {
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [sessionId] = useState(() => `session-${Date.now()}`);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [currentStep, setCurrentStep] = useState<ConversationSession["currentStep"]>("greeting");
  const [application, setApplication] = useState<LoanApplication | undefined>();
  const [suggestedResponses, setSuggestedResponses] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingAgent, setTypingAgent] = useState<string>("master");
  const [showSidebar, setShowSidebar] = useState(false);
  const [sanctionLetter, setSanctionLetter] = useState<SanctionLetter | null>(null);
  const [showSanctionLetter, setShowSanctionLetter] = useState(false);

  const initSession = useQuery({
    queryKey: ['/api/chat/init', sessionId],
    queryFn: async () => {
      const res = await fetch(`/api/chat/init?sessionId=${sessionId}`);
      if (!res.ok) throw new Error('Failed to initialize session');
      return res.json() as Promise<ChatResponse>;
    },
  });

  useEffect(() => {
    if (initSession.data) {
      setMessages([initSession.data.message]);
      setCurrentStep(initSession.data.currentStep);
      setSuggestedResponses(initSession.data.suggestedResponses || []);
    }
  }, [initSession.data]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const sendMessage = useMutation({
    mutationFn: async (message: string) => {
      const res = await apiRequest('POST', '/api/chat/send', {
        sessionId,
        message,
        customerId: application?.customerId,
      });
      return res.json() as Promise<ChatResponse>;
    },
    onMutate: (message) => {
      const userMessage: ChatMessageType = {
        id: `user-${Date.now()}`,
        role: "user",
        content: message,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);
      setSuggestedResponses([]);
      setIsTyping(true);
    },
    onSuccess: (data) => {
      setIsTyping(false);
      setMessages(prev => [...prev, data.message]);
      setCurrentStep(data.currentStep);
      setSuggestedResponses(data.suggestedResponses || []);
      if (data.application) {
        setApplication(data.application);
      }
      if (data.message.agentType) {
        setTypingAgent(data.message.agentType);
      }
    },
    onError: (error) => {
      setIsTyping(false);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
      });
    },
  });

  const uploadSalarySlip = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('sessionId', sessionId);
      formData.append('applicationId', application?.id || '');
      
      const res = await fetch('/api/chat/upload-salary-slip', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      return res.json() as Promise<ChatResponse>;
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, data.message]);
      setCurrentStep(data.currentStep);
      setSuggestedResponses(data.suggestedResponses || []);
      if (data.application) {
        setApplication(data.application);
      }
      toast({
        title: "Upload Successful",
        description: "Your salary slip has been uploaded for verification.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload file",
      });
    },
  });

  const getSanctionLetter = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/chat/sanction-letter?applicationId=${application?.id}`);
      if (!res.ok) throw new Error('Failed to generate sanction letter');
      return res.json() as Promise<SanctionLetter>;
    },
    onSuccess: (data) => {
      setSanctionLetter(data);
      setShowSanctionLetter(true);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate sanction letter",
      });
    },
  });

  const downloadSanctionLetter = async () => {
    if (!application?.id) return;
    
    try {
      const res = await fetch(`/api/chat/download-sanction-letter?applicationId=${application.id}`);
      if (!res.ok) throw new Error('Download failed');
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sanction-letter-${application.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "Unable to download the sanction letter.",
      });
    }
  };

  const handleSend = (message: string) => {
    if (!sendMessage.isPending) {
      sendMessage.mutate(message);
    }
  };

  const handleFileUpload = async (file: File) => {
    await uploadSalarySlip.mutateAsync(file);
  };

  const showFileUpload = currentStep === "underwriting" && 
    application?.status === "underwriting" && 
    !application?.salarySlipUploaded;

  const showViewSanctionButton = application?.status === "sanctioned";

  const Sidebar = () => (
    <div className="flex flex-col h-full p-4 space-y-4">
      <ProgressTracker currentStep={currentStep} />
      <LoanSummaryCard application={application} />
      
      {showFileUpload && (
        <FileUpload
          onUpload={handleFileUpload}
          title="Upload Salary Slip"
          description="PDF, JPG, or PNG (max 5MB)"
        />
      )}

      {showViewSanctionButton && (
        <Button 
          className="w-full"
          onClick={() => getSanctionLetter.mutate()}
          disabled={getSanctionLetter.isPending}
          data-testid="button-view-sanction-letter"
        >
          <FileText className="h-4 w-4 mr-2" />
          View Sanction Letter
        </Button>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header 
        showMenu 
        onMenuClick={() => setShowSidebar(true)} 
      />

      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden md:flex w-80 border-r bg-card/50 flex-col overflow-y-auto">
          <Sidebar />
        </aside>

        <Sheet open={showSidebar} onOpenChange={setShowSidebar}>
          <SheetContent side="left" className="w-80 p-0">
            <Sidebar />
          </SheetContent>
        </Sheet>

        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <ScrollArea 
              ref={scrollRef} 
              className="h-full"
            >
              <div className="max-w-3xl mx-auto p-4 space-y-4 pb-6">
                {initSession.isLoading ? (
                  <TypingIndicator agentType="master" />
                ) : (
                  <>
                    <AnimatePresence>
                      {messages.map((msg, idx) => (
                        <ChatMessage 
                          key={msg.id} 
                          message={msg}
                          isLatest={idx === messages.length - 1}
                        />
                      ))}
                    </AnimatePresence>

                    {isTyping && (
                      <TypingIndicator agentType={typingAgent} />
                    )}
                  </>
                )}
              </div>
            </ScrollArea>
          </div>

          <ChatInput
            onSend={handleSend}
            onFileUpload={showFileUpload ? handleFileUpload : undefined}
            disabled={initSession.isLoading}
            isLoading={sendMessage.isPending}
            suggestedResponses={suggestedResponses}
            showFileUpload={showFileUpload}
            placeholder={
              currentStep === "closed" 
                ? "This conversation has ended" 
                : "Type your message..."
            }
          />
        </main>

        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-24 right-4 md:hidden shadow-lg"
          onClick={() => setShowSidebar(true)}
          data-testid="button-show-sidebar"
        >
          <PanelRight className="h-5 w-5" />
        </Button>
      </div>

      <SanctionLetterPreview
        open={showSanctionLetter}
        onOpenChange={setShowSanctionLetter}
        letter={sanctionLetter}
        onDownload={downloadSanctionLetter}
      />
    </div>
  );
}
