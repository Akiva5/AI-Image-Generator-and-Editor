import React from "react";
import { motion } from "motion/react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  imageUrl?: string;
  timestamp: Date;
  attachedImage?: string;
}

interface MessageItemProps {
  message: Message;
  onDownload: (url: string, id: string) => void;
}

export const MessageItem = React.memo(({ message, onDownload }: MessageItemProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={cn(
      "flex gap-4",
      message.role === "user" ? "flex-row-reverse" : "flex-row"
    )}
  >
    <div className={cn(
      "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
      message.role === "user" ? "bg-zinc-900 text-white" : "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
    )}>
      {message.role === "user" ? "U" : "AI"}
    </div>
    <div className={cn(
      "flex flex-col gap-2 max-w-[85%]",
      message.role === "user" ? "items-end" : "items-start"
    )}>
      {message.attachedImage && (
        <div className="relative group rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
          <img
            src={message.attachedImage}
            alt="Attached"
            className="max-w-xs h-auto"
            referrerPolicy="no-referrer"
          />
          <Badge className="absolute top-2 right-2 bg-black/50 backdrop-blur-md border-none">Original</Badge>
        </div>
      )}

      {message.content && (
        <div className={cn(
          "px-4 py-3 rounded-2xl text-sm leading-relaxed",
          message.role === "user"
            ? "bg-zinc-900 text-white rounded-tr-none"
            : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-tl-none shadow-sm"
        )}>
          {message.content}
        </div>
      )}

      {message.imageUrl && (
        <Card className="overflow-hidden border-none shadow-xl group relative">
          <img
            src={message.imageUrl}
            alt="Generated"
            className="w-full h-auto max-h-[600px] object-contain bg-zinc-100 dark:bg-zinc-800"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <Button
              aria-label="Download image"
              variant="secondary"
              size="icon"
              className="rounded-full"
              onClick={() => onDownload(message.imageUrl!, message.id)}
            >
              <Download className="w-5 h-5" />
            </Button>
          </div>
        </Card>
      )}

      <span className="text-[10px] text-zinc-400 px-1">
        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  </motion.div>
));
