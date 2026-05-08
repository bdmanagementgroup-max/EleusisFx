"use client";

import { useState, useRef, useEffect, useCallback } from "react";

type Message = { role: "user" | "assistant"; content: string };

const WELCOME: Message = {
  role: "assistant",
  content:
    "Hi — I have your challenge metrics loaded. Ask me anything: how you're tracking against your profit target, whether your drawdown is a concern, how many days you realistically need, or anything else about your evaluation. I'll give you straight answers based on your actual numbers.",
};

const CHIPS = [
  "Am I on pace to pass?",
  "Is my drawdown a concern?",
  "How many more days do I need?",
  "What should I focus on today?",
];

export default function CoachClient() {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load session history on mount
  useEffect(() => {
    const loadSessionHistory = async () => {
      try {
        const response = await fetch("/api/dashboard/coach", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          const data = await response.json() as { messages: Message[] };
          if (data.messages && data.messages.length > 0) {
            setMessages(data.messages);
          }
        }
      } catch {
        // If loading fails, keep the welcome message
      } finally {
        setLoaded(true);
      }
    };

    loadSessionHistory();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || streaming) return;

      const userMsg: Message = { role: "user", content: trimmed };
      const nextMessages = [...messages, userMsg];
      setMessages([...nextMessages, { role: "assistant", content: "" }]);
      setInput("");
      setStreaming(true);

      try {
        const response = await fetch("/api/dashboard/coach", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: nextMessages }),
        });

        if (!response.ok || !response.body) {
          const errText = await response.text().catch(() => "Request failed");
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: "assistant",
              content: `Something went wrong: ${errText}`,
            };
            return updated;
          });
          setStreaming(false);
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: "assistant",
              content: updated[updated.length - 1].content + chunk,
            };
            return updated;
          });
        }
      } catch {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: "Network error — please check your connection and try again.",
          };
          return updated;
        });
      } finally {
        setStreaming(false);
      }
    },
    [messages, streaming]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const handleChip = (chip: string) => {
    send(chip);
  };

  const showChips = loaded && messages.length === 1 && messages[0].role === "assistant" && messages[0].content === WELCOME.content;

  return (
    <div style={{ padding: "40px 40px 80px", display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            fontSize: 10,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: "#4f8ef7",
            marginBottom: 8,
          }}
        >
          AI Coach
        </div>
        <h1
          style={{
            fontFamily: "var(--font-syne), Syne, sans-serif",
            fontWeight: 800,
            fontSize: 32,
            letterSpacing: -1,
            margin: 0,
          }}
        >
          Your Performance Analyst
        </h1>
      </div>

      <div
        style={{
          background: "#08090f",
          border: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div
            style={{
              fontSize: 11,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "rgba(210,220,240,0.58)",
            }}
          >
            ELEUSIS FX AI COACH
          </div>
          <div
            style={{
              fontSize: 12,
              color: "rgba(210,220,240,0.58)",
              marginTop: 4,
            }}
          >
            Your private performance analyst. Ask about your metrics, pace, drawdown strategy.
          </div>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            maxHeight: "calc(100vh - 320px)",
            padding: "24px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {messages.map((msg, i) => {
            const isUser = msg.role === "user";
            const isLastAssistant =
              !isUser && i === messages.length - 1;

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: isUser ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={
                    isUser
                      ? {
                          background: "rgba(79,142,247,0.12)",
                          border: "1px solid rgba(79,142,247,0.2)",
                          color: "#e8eaf0",
                          padding: "12px 16px",
                          maxWidth: "70%",
                          fontSize: 14,
                          lineHeight: 1.7,
                        }
                      : {
                          background: "#08090f",
                          border: "1px solid rgba(255,255,255,0.06)",
                          color: "rgba(210,220,240,0.88)",
                          padding: "16px 20px",
                          maxWidth: "85%",
                          fontSize: 14,
                          lineHeight: 1.8,
                        }
                  }
                >
                  <span style={{ whiteSpace: "pre-wrap" }}>{msg.content}</span>
                  {streaming && isLastAssistant && (
                    <span
                      style={{
                        display: "inline-block",
                        width: 2,
                        height: 14,
                        background: "#4f8ef7",
                        marginLeft: 2,
                        verticalAlign: "middle",
                        animation: "blink 1s step-end infinite",
                      }}
                    />
                  )}
                </div>
              </div>
            );
          })}

          {showChips && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginTop: 8,
              }}
            >
              {CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleChip(chip)}
                  disabled={streaming}
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(79,142,247,0.3)",
                    color: "#4f8ef7",
                    padding: "8px 14px",
                    fontSize: 12,
                    cursor: streaming ? "not-allowed" : "pointer",
                    opacity: streaming ? 0.5 : 1,
                    transition: "all 0.2s",
                    fontFamily: "inherit",
                  }}
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            padding: "16px 20px",
            display: "flex",
            gap: 12,
            alignItems: "flex-end",
          }}
        >
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={streaming}
            placeholder="Type your question..."
            style={{
              flex: 1,
              background: "#08090f",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#e8eaf0",
              padding: "12px 14px",
              fontSize: 14,
              lineHeight: 1.6,
              resize: "none",
              outline: "none",
              fontFamily: "inherit",
              opacity: streaming ? 0.6 : 1,
              minHeight: 44,
            }}
          />
          <button
            onClick={() => send(input)}
            disabled={streaming || !input.trim()}
            style={{
              background: streaming || !input.trim() ? "rgba(79,142,247,0.3)" : "#4f8ef7",
              border: "none",
              color: "#fff",
              padding: "12px 20px",
              fontSize: 12,
              letterSpacing: 1.5,
              fontWeight: 700,
              cursor: streaming || !input.trim() ? "not-allowed" : "pointer",
              fontFamily: "var(--font-syne), Syne, sans-serif",
              whiteSpace: "nowrap",
              transition: "background 0.2s",
              height: 44,
            }}
          >
            {streaming ? "..." : "SEND →"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
