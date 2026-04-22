/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback, ChangeEvent } from "react";
import { 
  Send, 
  Image as ImageIcon, 
  Download, 
  Trash2, 
  Settings2, 
  Plus, 
  X, 
  Loader2,
  Sparkles,
  Maximize2,
  Palette,
  LogOut
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { 
  generateImage, 
  editImage, 
  AspectRatio, 
  ImageGenerationConfig 
} from "@/lib/gemini";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  imageUrl?: string;
  timestamp: Date;
  attachedImage?: string;
}

const ART_STYLES = [
  { id: "none", name: "Default", icon: Sparkles },
  { id: "cinematic", name: "Cinematic", icon: Maximize2 },
  { id: "digital-art", name: "Digital Art", icon: Palette },
  { id: "photographic", name: "Photographic", icon: ImageIcon },
  { id: "anime", name: "Anime", icon: Sparkles },
  { id: "oil-painting", name: "Oil Painting", icon: Palette },
  { id: "sketch", name: "Sketch", icon: Palette },
  { id: "3d-render", name: "3D Render", icon: Maximize2 },
];

const ASPECT_RATIOS: { value: AspectRatio; label: string }[] = [
  { value: "1:1", label: "Square (1:1)" },
  { value: "4:3", label: "Landscape (4:3)" },
  { value: "3:4", label: "Portrait (3:4)" },
  { value: "16:9", label: "Wide (16:9)" },
  { value: "9:16", label: "Tall (9:16)" },
];

const MessageItem = React.memo(({ message, onDownload }: { message: Message; onDownload: (url: string, id: string) => void }) => (
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
              aria-label="Download image" variant="secondary"
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
        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </span>
    </div>
  </motion.div>
));
export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [attachedImage, setAttachedImage] = useState<{ data: string; type: string } | null>(null);
  const [config, setConfig] = useState<ImageGenerationConfig>({
    aspectRatio: "1:1",
    style: "none",
  });
  const [isGoogleAuth, setIsGoogleAuth] = useState(false);
  const [googlePhotos, setGooglePhotos] = useState<any[]>([]);
  const [isPhotosLoading, setIsPhotosLoading] = useState(false);
  const [isPhotosDialogOpen, setIsPhotosDialogOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const res = await fetch("/api/auth/status");
      const data = await res.json();
      setIsGoogleAuth(data.isAuthenticated);
    } catch (e) {
      console.error("Auth check failed", e);
    }
  };

  const handleGoogleConnect = async () => {
    try {
      const res = await fetch("/api/auth/google/url");
      const { url } = await res.json();
      const authWindow = window.open(url, "google_auth", "width=600,height=700");
      
      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
          setIsGoogleAuth(true);
          window.removeEventListener('message', handleMessage);
        }
      };
      window.addEventListener('message', handleMessage);
    } catch (e) {
      console.error("Failed to get auth URL", e);
    }
  };

  const handleGoogleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setIsGoogleAuth(false);
    setGooglePhotos([]);
  };

  const fetchPhotos = async () => {
    setIsPhotosLoading(true);
    try {
      const res = await fetch("/api/photos/list");
      const data = await res.json();
      setGooglePhotos(data.mediaItems || []);
    } catch (e) {
      console.error("Failed to fetch photos", e);
    } finally {
      setIsPhotosLoading(false);
    }
  };

  const selectGooglePhoto = async (photo: any) => {
    setIsPhotosLoading(true);
    try {
      const res = await fetch(`/api/photos/proxy?url=${encodeURIComponent(photo.baseUrl)}`);
      const data = await res.json();
      setAttachedImage({
        data: data.data,
        type: data.mimeType,
      });
      setIsPhotosDialogOpen(false);
    } catch (e) {
      console.error("Failed to proxy photo", e);
    } finally {
      setIsPhotosLoading(false);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedImage({
          data: reader.result as string,
          type: file.type,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if (!input.trim() && !attachedImage) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
      attachedImage: attachedImage?.data,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsGenerating(true);

    try {
      let result;
      if (attachedImage) {
        result = await editImage(input, attachedImage.data, attachedImage.type, config);
      } else {
        result = await generateImage(input, config);
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: result.text || "Here is your generated image:",
        imageUrl: result.imageUrl,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setAttachedImage(null);
    } catch (error) {
      console.error("Generation failed:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: "Sorry, I encountered an error while generating your image. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = useCallback((url: string, id: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = `ai-image-${id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const clearChat = () => {
    setMessages([]);
    setAttachedImage(null);
  };

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col hidden md:flex">
          <div className="p-6 flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center">
              <Sparkles className="text-white dark:text-zinc-900 w-6 h-6" />
            </div>
            <h1 className="font-bold text-lg tracking-tight">AI Studio</h1>
          </div>

          <ScrollArea className="flex-1 p-6">
            <div className="space-y-8">
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Settings2 className="w-4 h-4 text-zinc-500" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Settings</h2>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="aspect-ratio">Aspect Ratio</Label>
                    <Select 
                      value={config.aspectRatio} 
                      onValueChange={(v) => setConfig(prev => ({ ...prev, aspectRatio: v as AspectRatio }))}
                    >
                      <SelectTrigger id="aspect-ratio">
                        <SelectValue placeholder="Select ratio" />
                      </SelectTrigger>
                      <SelectContent>
                        {ASPECT_RATIOS.map((ratio) => (
                          <SelectItem key={ratio.value} value={ratio.value}>
                            {ratio.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label>Artistic Style</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {ART_STYLES.map((style) => (
                        <Button
                          key={style.id}
                          variant={config.style === style.id ? "default" : "outline"}
                          size="sm"
                          className="justify-start gap-2 h-9 text-xs"
                          onClick={() => setConfig(prev => ({ ...prev, style: style.id }))}
                        >
                          <style.icon className="w-3.5 h-3.5" />
                          {style.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <Separator />

              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Integrations</h2>
                </div>
                {isGoogleAuth ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-900 flex items-center justify-center">
                          <img src="https://www.gstatic.com/images/branding/product/1x/photos_64dp.png" className="w-5 h-5" alt="Google Photos" />
                        </div>
                        <span className="text-sm font-medium">Google Photos</span>
                      </div>
                      <Button aria-label="Logout Google Photos" variant="ghost" size="icon" onClick={handleGoogleLogout} className="h-8 w-8 text-zinc-500 hover:text-destructive">
                        <LogOut className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button variant="outline" className="w-full justify-start gap-3 h-12" onClick={handleGoogleConnect}>
                    <img src="https://www.gstatic.com/images/branding/product/1x/photos_64dp.png" className="w-5 h-5" alt="Google Photos" />
                    Connect Google Photos
                  </Button>
                )}
              </section>

              <Separator />

              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">History</h2>
                  <Button aria-label="Clear chat history" variant="ghost" size="icon" onClick={clearChat} className="h-8 w-8 text-zinc-500 hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {messages.length === 0 && (
                    <p className="text-sm text-zinc-400 italic">No history yet</p>
                  )}
                  {messages.filter(m => m.role === 'user').slice(-5).map((m) => (
                    <button 
                      key={m.id}
                      className="w-full text-left p-2 rounded-md text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 truncate transition-colors"
                      onClick={() => setInput(m.content)}
                    >
                      {m.content || "Image Edit"}
                    </button>
                  ))}
                </div>
              </section>
            </div>
          </ScrollArea>

          <div className="p-6 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs font-medium">
                AS
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">akivaseymour@gmail.com</p>
                <p className="text-xs text-zinc-500">Pro Plan</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col relative">
          {/* Header Mobile */}
          <header className="md:hidden p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-zinc-900">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <span className="font-bold">AI Studio</span>
            </div>
            <Button aria-label="Open settings" variant="ghost" size="icon">
              <Settings2 className="w-5 h-5" />
            </Button>
          </header>

          {/* Chat Area */}
          <ScrollArea className="flex-1 p-4 md:p-8" ref={scrollRef}>
            <div className="max-w-4xl mx-auto space-y-8 pb-32">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                  <div className="w-20 h-20 rounded-3xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-zinc-400" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">What can I create for you?</h2>
                    <p className="text-zinc-500 max-w-md mx-auto">
                      Generate stunning images or edit existing ones using the power of Gemini 2.5 Flash Image.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                    {[
                      "A futuristic city in the clouds",
                      "Cyberpunk samurai in neon rain",
                      "A cozy cabin in a snowy forest",
                      "Abstract cosmic explosion of colors"
                    ].map((suggestion) => (
                      <Button 
                        key={suggestion} 
                        variant="outline" 
                        className="justify-start h-auto py-3 px-4 text-left font-normal"
                        onClick={() => setInput(suggestion)}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <AnimatePresence initial={false}>
                {messages.map((message) => (
                  <MessageItem
                    key={message.id}
                    message={message}
                    onDownload={downloadImage}
                  />
                ))}
              </AnimatePresence>

              {isGenerating && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-4"
                >
                  <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm">
                    <p className="text-sm text-zinc-500 animate-pulse">Generating your masterpiece...</p>
                  </div>
                </motion.div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 bg-gradient-to-t from-zinc-50 dark:from-zinc-950 via-zinc-50/80 dark:via-zinc-950/80 to-transparent">
            <div className="max-w-4xl mx-auto">
              <div className="relative bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-2 transition-all focus-within:ring-2 focus-within:ring-zinc-900/10 dark:focus-within:ring-zinc-100/10">
                
                {attachedImage && (
                  <div className="px-4 py-3 flex items-center gap-3">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 shrink-0">
                      <img src={attachedImage.data} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <button 
                        aria-label="Remove image"
                        onClick={() => setAttachedImage(null)}
                        className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 hover:bg-black transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium">Editing mode active</p>
                      <p className="text-[10px] text-zinc-500">Describe the changes you want to make</p>
                    </div>
                  </div>
                )}

                <div className="flex items-end gap-2 px-2 pb-1">
                  {isGoogleAuth ? (
                    <Dialog open={isPhotosDialogOpen} onOpenChange={(open) => {
                      setIsPhotosDialogOpen(open);
                      if (open) fetchPhotos();
                    }}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="rounded-full h-10 w-10 shrink-0"
                        >
                          <img src="https://www.gstatic.com/images/branding/product/1x/photos_64dp.png" className="w-5 h-5" alt="Google Photos" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                        <DialogHeader>
                          <DialogTitle>Import from Google Photos</DialogTitle>
                        </DialogHeader>
                        <ScrollArea className="flex-1 mt-4">
                          {isPhotosLoading && googlePhotos.length === 0 ? (
                            <div className="flex items-center justify-center py-20">
                              <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
                            </div>
                          ) : (
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 p-1">
                              {googlePhotos.map((photo) => (
                                <button
                                  aria-label={`Select photo ${photo.filename}`}
                                  key={photo.id}
                                  onClick={() => selectGooglePhoto(photo)}
                                  className="aspect-square rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 hover:opacity-80 transition-opacity relative group"
                                >
                                  <img src={photo.baseUrl} alt={photo.filename} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Plus className="w-6 h-6 text-white" />
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          aria-label="Connect Google Photos" variant="ghost"
                          size="icon" 
                          className="rounded-full h-10 w-10 shrink-0"
                          onClick={handleGoogleConnect}
                        >
                          <img src="https://www.gstatic.com/images/branding/product/1x/photos_64dp.png" className="w-5 h-5 opacity-50 grayscale" alt="Google Photos" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Connect Google Photos</TooltipContent>
                    </Tooltip>
                  )}

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        aria-label="Attach local image"
                        variant="ghost" 
                        size="icon" 
                        className="rounded-full h-10 w-10 shrink-0"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Plus className="w-5 h-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Attach image to edit</TooltipContent>
                  </Tooltip>
                  
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                  />

                  <textarea aria-label="Image prompt"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder={attachedImage ? "Describe how to edit this image..." : "Describe an image to generate..."}
                    className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-3 px-2 text-sm min-h-[44px] max-h-32"
                    rows={1}
                  />

                  <Button 
                    aria-label="Send prompt" onClick={handleSend}
                    disabled={(!input.trim() && !attachedImage) || isGenerating}
                    className="rounded-2xl h-10 px-4 gap-2 shrink-0"
                  >
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span className="hidden sm:inline">Send</span>
                  </Button>
                </div>
              </div>
              <p className="text-[10px] text-center text-zinc-500 mt-3">
                Powered by Gemini 2.5 Flash Image. High quality generation may take a few moments.
              </p>
            </div>
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
