import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  CloudUpload, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  X,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>;
  accept?: string;
  maxSize?: number;
  className?: string;
  title?: string;
  description?: string;
}

type UploadStatus = "idle" | "uploading" | "success" | "error";

export function FileUpload({
  onUpload,
  accept = ".pdf,.jpg,.jpeg,.png",
  maxSize = 5 * 1024 * 1024,
  className,
  title = "Upload Salary Slip",
  description = "PDF, JPG, or PNG up to 5MB",
}: FileUploadProps) {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (file.size > maxSize) {
      setError(`File size must be less than ${maxSize / 1024 / 1024}MB`);
      setStatus("error");
      return;
    }

    const allowedTypes = accept.split(",").map(t => t.trim());
    const fileExt = `.${file.name.split(".").pop()?.toLowerCase()}`;
    if (!allowedTypes.includes(fileExt)) {
      setError(`File type not allowed. Please upload ${accept}`);
      setStatus("error");
      return;
    }

    setFileName(file.name);
    setStatus("uploading");
    setError(null);
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 100);

    try {
      await onUpload(file);
      clearInterval(progressInterval);
      setProgress(100);
      setStatus("success");
    } catch (err) {
      clearInterval(progressInterval);
      setError(err instanceof Error ? err.message : "Upload failed");
      setStatus("error");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const resetUpload = () => {
    setStatus("idle");
    setProgress(0);
    setFileName(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <Card 
      className={cn(
        "transition-all duration-200",
        isDragging && "ring-2 ring-primary ring-offset-2",
        className
      )}
      data-testid="card-file-upload"
    >
      <CardContent className="p-6">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
          data-testid="input-file"
        />

        <AnimatePresence mode="wait">
          {status === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={cn(
                "flex flex-col items-center justify-center",
                "border-2 border-dashed rounded-lg p-8",
                "cursor-pointer hover-elevate",
                isDragging ? "border-primary bg-primary/5" : "border-muted"
              )}
              onClick={() => inputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <CloudUpload className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">{title}</p>
              <p className="text-xs text-muted-foreground">{description}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4"
                data-testid="button-browse-files"
              >
                Browse Files
              </Button>
            </motion.div>
          )}

          {status === "uploading" && (
            <motion.div
              key="uploading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center p-6"
            >
              <Loader2 className="h-10 w-10 text-primary animate-spin mb-3" />
              <p className="text-sm font-medium mb-2">Uploading {fileName}</p>
              <Progress value={progress} className="w-full h-2" />
              <p className="text-xs text-muted-foreground mt-2">{progress}%</p>
            </motion.div>
          )}

          {status === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center p-6"
            >
              <div className="relative">
                <FileText className="h-12 w-12 text-muted-foreground" />
                <CheckCircle2 className="h-5 w-5 text-chart-4 absolute -bottom-1 -right-1" />
              </div>
              <p className="text-sm font-medium mt-3 mb-1">{fileName}</p>
              <p className="text-xs text-chart-4">Upload successful</p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-3"
                onClick={resetUpload}
                data-testid="button-upload-another"
              >
                Upload another file
              </Button>
            </motion.div>
          )}

          {status === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center p-6"
            >
              <div className="relative">
                <FileText className="h-12 w-12 text-muted-foreground" />
                <XCircle className="h-5 w-5 text-destructive absolute -bottom-1 -right-1" />
              </div>
              <p className="text-sm font-medium mt-3 mb-1">{fileName || "Upload Failed"}</p>
              <p className="text-xs text-destructive">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={resetUpload}
                data-testid="button-try-again"
              >
                Try again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
