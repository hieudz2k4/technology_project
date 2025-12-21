"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/header";
import {
  Send,
  Loader2,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Mic,
  ImageIcon,
  X,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  images?: string[];
  timestamp: Date;
}

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm your DZDEX AI Assistant. I can help you with trading strategies, market analysis, risk management, and answer questions about perpetual futures trading. How can I assist you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        const audioUrl = URL.createObjectURL(audioBlob);
        setInput((prev) => prev + ` [Voice message: ${audioUrl}]`);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("[v0] Error accessing microphone:", error);
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const imageData = event.target?.result as string;
          setUploadedImages((prev) => [...prev, imageData]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && uploadedImages.length === 0) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      images: uploadedImages.length > 0 ? uploadedImages : undefined,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setUploadedImages([]);
    setIsLoading(true);

    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: generateMockResponse(input),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      <Header />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-2xl px-4 py-8 md:px-6">
            {messages.length === 1 && !isLoading && (
              <div className="mb-8 text-center">
                <h1 className="mb-2 text-3xl font-bold text-foreground">
                  DZDEX AI Assistant
                </h1>
                <p className="text-muted-foreground">
                  Ask me anything about perpetual futures trading
                </p>
              </div>
            )}

            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex max-w-xl gap-3 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    {message.role === "assistant" && (
                      <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-success/20">
                        <span className="text-xs font-bold text-success">
                          AI
                        </span>
                      </div>
                    )}

                    <div
                      className={`rounded-lg px-4 py-3 ${
                        message.role === "user"
                          ? "bg-success/10 text-foreground"
                          : "border border-border bg-card text-foreground"
                      }`}
                    >
                      {message.images && message.images.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-2">
                          {message.images.map((image, idx) => (
                            <img
                              key={idx}
                              src={image || "/placeholder.svg"}
                              alt={`Uploaded image ${idx + 1}`}
                              className="max-h-48 max-w-xs rounded-lg border border-border"
                            />
                          ))}
                        </div>
                      )}
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content}
                      </p>

                      {message.role === "assistant" && (
                        <div className="mt-3 flex gap-2 pt-2">
                          <button className="rounded p-1 hover:bg-muted">
                            <Copy className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                          </button>
                          <button className="rounded p-1 hover:bg-muted">
                            <ThumbsUp className="h-4 w-4 text-muted-foreground hover:text-success" />
                          </button>
                          <button className="rounded p-1 hover:bg-muted">
                            <ThumbsDown className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-3">
                    <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-success/20">
                      <span className="text-xs font-bold text-success">AI</span>
                    </div>
                    <div className="rounded-lg border border-border bg-card px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-success" />
                        <span className="text-sm text-muted-foreground">
                          Thinking...
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-border bg-background px-4 py-4 md:px-6">
          <div className="mx-auto max-w-2xl">
            {messages.length === 1 && !isLoading && (
              <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <SuggestedPrompt
                  title="Trading Tips"
                  description="Get advice on perpetual futures"
                  onClick={() =>
                    setInput(
                      "What are some important trading tips for perpetual futures?",
                    )
                  }
                />
                <SuggestedPrompt
                  title="Risk Management"
                  description="Learn about risk strategies"
                  onClick={() =>
                    setInput("How should I manage risk in perpetual trading?")
                  }
                />
                <SuggestedPrompt
                  title="Leverage Guide"
                  description="Understand leverage safely"
                  onClick={() =>
                    setInput("Explain leverage and how to use it safely")
                  }
                />
                <SuggestedPrompt
                  title="Market Analysis"
                  description="Analyze market trends"
                  onClick={() => setInput("How do I analyze market trends?")}
                />
              </div>
            )}

            {uploadedImages.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {uploadedImages.map((image, idx) => (
                  <div key={idx} className="relative">
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`Preview ${idx + 1}`}
                      className="max-h-24 max-w-24 rounded-lg border border-border"
                    />
                    <button
                      onClick={() => removeImage(idx)}
                      className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-white hover:bg-destructive/90"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleSendMessage} className="flex flex-col gap-3">
              <div className="rounded-lg border border-border bg-card p-4">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything about trading..."
                  className="w-full border-0 bg-transparent px-3 py-3 text-foreground placeholder:text-muted-foreground focus:ring-0"
                  disabled={isLoading}
                />

                {/* Icons row at the bottom of the container */}
                <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      title="Upload image"
                    >
                      <ImageIcon className="h-5 w-5" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={
                        isRecording ? stopVoiceRecording : startVoiceRecording
                      }
                      className={`rounded-full p-2 transition-colors ${
                        isRecording
                          ? "bg-destructive text-white hover:bg-destructive/90"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                      title={
                        isRecording ? "Stop recording" : "Start voice recording"
                      }
                    >
                      <Mic className="h-5 w-5" />
                    </button>
                  </div>

                  <Button
                    type="submit"
                    disabled={
                      isLoading ||
                      (!input.trim() && uploadedImages.length === 0)
                    }
                    className="rounded-full bg-success text-black hover:bg-success/90 disabled:opacity-50 px-4"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </form>

            <p className="mt-3 text-center text-xs text-muted-foreground">
              AI can make mistakes. Always verify important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SuggestedPrompt({
  title,
  description,
  onClick,
}: {
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-border bg-card p-3 text-left transition-all hover:border-success hover:bg-card/80"
    >
      <div className="font-medium text-foreground">{title}</div>
      <div className="text-xs text-muted-foreground">{description}</div>
    </button>
  );
}

function generateMockResponse(userInput: string): string {
  const responses: { [key: string]: string } = {
    trading:
      "For perpetual futures trading, consider these key points:\n\n1. **Start Small** - Begin with small positions to learn the mechanics\n2. **Use Stop Losses** - Always set stop losses to protect your capital\n3. **Understand Leverage** - Know your liquidation price at all times\n4. **Monitor Funding Rates** - These can significantly impact your P&L\n5. **Diversify** - Don't put all capital in one position\n\nWhat specific aspect would you like to know more about?",
    risk: "Risk management is crucial in perpetual trading. Here's a framework:\n\n**Position Sizing**\n- Risk only 1-2% of your capital per trade\n- Adjust position size based on leverage\n\n**Stop Losses**\n- Always set them before entering\n- Place them at technical support/resistance\n\n**Take Profit Targets**\n- Define exit points before trading\n- Consider scaling out of positions\n\n**Liquidation Price**\n- Monitor it constantly\n- Keep a safety margin (10-20%)\n\nWould you like specific examples?",
    leverage:
      "Leverage amplifies both gains and losses. Here's what you need to know:\n\n**How It Works**\n- 10x leverage = 10% price move = 100% profit/loss\n- 5x leverage = 10% price move = 50% profit/loss\n\n**Safe Leverage Levels**\n- Beginners: 2-3x\n- Intermediate: 5-10x\n- Advanced: 10-20x (with strict risk management)\n\n**Key Risks**\n- Liquidation at specific price levels\n- Funding rate costs\n- Slippage on entry/exit\n\n**Pro Tip**: Never use maximum leverage. Always keep a safety margin!",
    market:
      "Market analysis for perpetual trading involves:\n\n**Technical Analysis**\n- Support and resistance levels\n- Trend identification (uptrend, downtrend, sideways)\n- Key indicators (RSI, MACD, Moving Averages)\n\n**Fundamental Analysis**\n- News and events\n- On-chain metrics\n- Market sentiment\n\n**Perpetual-Specific Metrics**\n- Funding rates (positive = longs paying shorts)\n- Open interest (market activity)\n- Long/short ratio\n\n**Best Practice**: Combine multiple indicators for better decisions. What timeframe are you trading?",
  };

  const lowerInput = userInput.toLowerCase();
  for (const [key, response] of Object.entries(responses)) {
    if (lowerInput.includes(key)) {
      return response;
    }
  }

  return "That's a great question! In perpetual futures trading, it's important to have a solid strategy, manage your risk properly, and stay informed about market conditions.\n\nI can help you with:\n- Trading strategies and tips\n- Risk management techniques\n- Leverage and liquidation concepts\n- Market analysis methods\n\nWhat would you like to explore?";
}
