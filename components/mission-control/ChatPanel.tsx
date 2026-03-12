"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface AgentInfo {
  id: string;
  name: string;
  icon: string;
  tier: string;
  specialty: string;
  isOrchestrator: boolean;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatPanelProps {
  squadId: string | null;
  agent: AgentInfo | null;
  onOpenSidebar: () => void;
}

export default function ChatPanel({
  squadId,
  agent,
  onOpenSidebar,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Reset conversation when agent changes
  useEffect(() => {
    setMessages([]);
    setInput("");
    setIsStreaming(false);
  }, [agent?.id, squadId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || !agent || !squadId || isStreaming) return;

    const userMessage: ChatMessage = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages([...newMessages, { role: "assistant", content: "" }]);
    setInput("");
    setIsStreaming(true);

    try {
      const response = await fetch("/api/mission-control/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          agentId: agent.id,
          squadId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        setMessages([
          ...newMessages,
          {
            role: "assistant",
            content: `Erro: ${error.error || "Algo correu mal. Tenta novamente."}`,
          },
        ]);
        setIsStreaming(false);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        setIsStreaming(false);
        return;
      }

      const decoder = new TextDecoder();
      let assistantContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;

          try {
            const data = JSON.parse(line.slice(6));

            if (data.error) {
              assistantContent += `\n\nErro: ${data.error}`;
              break;
            }

            if (data.done) {
              break;
            }

            if (data.text) {
              assistantContent += data.text;
              setMessages([
                ...newMessages,
                { role: "assistant", content: assistantContent },
              ]);
            }
          } catch {
            // Ignore malformed JSON chunks
          }
        }
      }

      // Final update
      setMessages([
        ...newMessages,
        { role: "assistant", content: assistantContent || "Sem resposta do agent." },
      ]);
    } catch (error) {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "Erro de ligação. Verifica a tua internet e tenta novamente.",
        },
      ]);
    } finally {
      setIsStreaming(false);
    }
  }, [input, agent, squadId, isStreaming, messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Empty state — no agent selected
  if (!agent) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 px-8">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden px-4 py-2 rounded-lg text-sm font-medium"
          style={{
            backgroundColor: "var(--accent)",
            color: "var(--bg)",
          }}
        >
          🎛️ Abrir Squads
        </button>
        <div className="text-center">
          <p className="text-4xl mb-4">🎛️</p>
          <h2
            className="text-xl font-bold mb-2"
            style={{ color: "var(--text)" }}
          >
            Mission Control
          </h2>
          <p className="text-sm max-w-md" style={{ color: "#8892a4" }}>
            Selecciona um agent da sidebar para começar uma conversa.
            Cada agent tem a sua persona e framework específicos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Agent Header */}
      <div
        className="px-4 py-3 border-b flex items-center gap-3 shrink-0"
        style={{ borderColor: "#1a2035" }}
      >
        <button
          onClick={onOpenSidebar}
          className="lg:hidden text-sm"
          style={{ color: "#8892a4" }}
        >
          ☰
        </button>
        <span className="text-xl">{agent.icon}</span>
        <div className="flex-1 min-w-0">
          <h3
            className="text-sm font-bold truncate"
            style={{ color: "var(--text)" }}
          >
            {agent.name}
          </h3>
          <p
            className="text-xs truncate"
            style={{ color: "#8892a4" }}
          >
            {agent.specialty}
          </p>
        </div>
        <button
          onClick={() => {
            setMessages([]);
            setInput("");
          }}
          className="text-xs px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
          style={{
            backgroundColor: "var(--surface)",
            color: "#8892a4",
            border: "1px solid #2a3555",
          }}
        >
          Nova conversa
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-3xl mb-3">{agent.icon}</p>
            <p className="text-sm" style={{ color: "#8892a4" }}>
              Começa uma conversa com {agent.name}
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className="max-w-[85%] lg:max-w-[70%] rounded-xl px-4 py-3"
              style={
                msg.role === "user"
                  ? {
                      backgroundColor: "var(--accent)18",
                      border: "1px solid var(--accent)30",
                      color: "var(--text)",
                    }
                  : {
                      backgroundColor: "var(--surface)",
                      border: "1px solid #1a2035",
                      color: "var(--text)",
                    }
              }
            >
              {msg.role === "assistant" && (
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm">{agent.icon}</span>
                  <span
                    className="text-xs font-semibold"
                    style={{ color: "var(--accent)" }}
                  >
                    {agent.name}
                  </span>
                </div>
              )}
              <div className="text-sm whitespace-pre-wrap leading-relaxed">
                {msg.content}
                {isStreaming &&
                  i === messages.length - 1 &&
                  msg.role === "assistant" && (
                    <span
                      className="inline-block w-2 h-4 ml-1 animate-pulse"
                      style={{ backgroundColor: "var(--accent)" }}
                    />
                  )}
              </div>
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div
        className="px-4 py-3 border-t shrink-0"
        style={{ borderColor: "#1a2035" }}
      >
        <div
          className="flex items-end gap-2 rounded-xl px-3 py-2"
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid #2a3555",
          }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Fala com ${agent.name}...`}
            rows={1}
            disabled={isStreaming}
            className="flex-1 bg-transparent resize-none text-sm outline-none py-1"
            style={{ color: "var(--text)", maxHeight: "160px" }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isStreaming}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all shrink-0 disabled:opacity-30"
            style={{
              backgroundColor: "var(--accent)",
              color: "var(--bg)",
            }}
          >
            {isStreaming ? "..." : "Enviar"}
          </button>
        </div>
        <p
          className="text-[10px] mt-1.5 text-center"
          style={{ color: "#8892a455" }}
        >
          Enter para enviar · Shift+Enter para nova linha
        </p>
      </div>
    </div>
  );
}
