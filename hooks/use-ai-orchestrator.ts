import { useState } from "react";

export interface Message {
  role: "user" | "assistant";
  content: string;
  functionCalls?: Array<{
    name: string;
    args: Record<string, any>;
  }>;
  timestamp: Date;
}

export interface UseAIOrchestratorOptions {
  onError?: (error: Error) => void;
  onSuccess?: (message: string) => void;
}

export function useAIOrchestrator(options?: UseAIOrchestratorOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    // Add user message
    const userMessage: Message = {
      role: "user",
      content: message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          conversationHistory,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to send message");
      }

      const data = await response.json();

      // Add assistant message
      const assistantMessage: Message = {
        role: "assistant",
        content: data.message,
        functionCalls: data.functionCalls,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setConversationHistory(data.conversationHistory);

      options?.onSuccess?.(data.message);
    } catch (error) {
      console.error("[AI Orchestrator] Error:", error);
      
      //error message
      const errorMessage: Message = {
        role: "assistant",
        content: "I'm sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
      options?.onError?.(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
    setConversationHistory([]);
  };

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
  };
}

// EXAMPLE USAGE

/*
import { useAIOrchestrator } from "@/hooks/use-ai-orchestrator";

export default function ChatInterface() {
  const { messages, isLoading, sendMessage } = useAIOrchestrator({
    onSuccess: (message) => {
      console.log("AI responded:", message);
    },
    onError: (error) => {
      console.error("Error:", error);
    },
  });

  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
    setInput("");
  };

  return (
    <div>
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={msg.role}>
            {msg.content}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
          placeholder="Ask me anything..."
        />
        <button disabled={isLoading}>Send</button>
      </form>
    </div>
  );
}
*/
