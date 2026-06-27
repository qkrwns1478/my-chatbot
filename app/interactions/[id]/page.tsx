"use client";

import { useState, useEffect, useRef, use } from "react";
import Link from "next/link";
import { Character, InteractionMessage } from "@/lib/db";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import AVAILABLE_MODELS from "@/data/models";

export default function InteractionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [messages, setMessages] = useState<InteractionMessage[]>([]);
  const [char1, setChar1] = useState<Character | null>(null);
  const [char2, setChar2] = useState<Character | null>(null);
  const [nextTurn, setNextTurn] = useState<"char1" | "char2">("char2");

  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0].id);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const roomRes = await fetch(`/api/interactions/${id}`);
        if (!roomRes.ok) throw new Error("Failed to load interaction room");
        const roomData = await roomRes.json();
        setMessages(roomData.messages || []);
        setNextTurn(roomData.nextTurn);

        const charRes = await fetch("/api/characters");
        if (charRes.ok) {
          const charData = await charRes.json();
          const c1 = charData.find((c: Character) => c.id === roomData.character1Id);
          const c2 = charData.find((c: Character) => c.id === roomData.character2Id);
          setChar1(c1 || null);
          setChar2(c2 || null);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const proceedConversation = async () => {
    if (isLoading || !char1 || !char2) return;

    setIsLoading(true);

    try {
      const res = await fetch("/api/interactions/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId: id, model: selectedModel }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => [...prev, data.reply]);
        setNextTurn((prev) => (prev === "char1" ? "char2" : "char1"));
      } else {
        console.error(data.error);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!char1 || !char2) return null; // or a loading state

  const activeChar = nextTurn === "char1" ? char1 : char2;

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto border-x border-border-subtle">
      {/* Header */}
      <header className="px-5 py-4 border-b border-border-subtle bg-surface-dark/80 backdrop-blur-[15px] flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-[13px] font-mono text-text-muted hover:text-text-secondary transition-colors"
          >
            ←
          </Link>
          <div className="w-px h-4 bg-border-subtle" />
          <div className="flex items-center gap-4">
            <span className="text-[12px] font-mono text-brand-purple/70 bg-brand-green/8 border border-brand-green/15 rounded px-2 py-0.5 uppercase tracking-wide">
              Simulation
            </span>
            <div className="flex items-center gap-2">
              <h1 className="text-[16px] font-medium text-text-primary tracking-tight">
                {char1.name} <span className="text-text-muted text-[13px] font-normal mx-1">vs</span> {char2.name}
              </h1>
            </div>
          </div>
        </div>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="bg-surface-elevated text-[12px] text-text-secondary border border-border-subtle rounded-xl px-3 py-2 outline-none focus:border-brand-green transition-all duration-200 cursor-pointer font-mono hover:text-text-primary"
        >
          {AVAILABLE_MODELS.map((model) => (
            <option key={model.id} value={model.id}>
              {model.label}
            </option>
          ))}
        </select>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
        <div className="flex justify-center mb-8">
            <div className="text-[12px] font-mono text-text-muted bg-surface-elevated border border-border-subtle rounded-full px-4 py-1.5 shadow-sm">
                Simulation Started
            </div>
        </div>

        {messages.map((msg, idx) => {
          const isChar1 = msg.characterId === char1.id;
          const charName = isChar1 ? char1.name : char2.name;

          return (
            <div key={idx} className={`flex flex-col ${isChar1 ? "items-start" : "items-end"}`}>
              <span className="text-[12px] font-mono text-text-muted mb-1.5">
                {charName}
              </span>
              <div
                className={`px-5 py-4 max-w-[85%] rounded-2xl text-[16px] leading-[26px] overflow-hidden ${
                  isChar1
                    ? "bg-surface-elevated border border-border-subtle text-text-primary rounded-bl-sm"
                    : "bg-surface-dark border border-brand-green/30 text-text-primary rounded-br-sm"
                }`}
              >
                <div className="space-y-2">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ ...props }) => <p className="mb-4 last:mb-0 leading-[26px]" {...props} />,
                      a: ({ ...props }) => <a className="text-brand-green hover:text-brand-green-mid underline" {...props} />,
                      code: (props) => {
                        const { children, className, ...rest } = props;
                        const match = /language-(\w+)/.exec(className || "");
                        return match ? (
                          <pre className="bg-page-bg border border-border-subtle rounded-xl p-4 my-4 overflow-x-auto text-[14px] font-mono">
                            <code className={className} {...rest}>{children}</code>
                          </pre>
                        ) : (
                          <code className="bg-surface-dark border border-border-subtle rounded px-1.5 py-0.5 text-[13px] font-mono text-brand-green-mid" {...rest}>
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className={`flex flex-col ${nextTurn === "char1" ? "items-start" : "items-end"}`}>
            <span className="text-[12px] font-mono text-text-muted mb-1.5">{activeChar.name} is typing...</span>
            <div className={`border border-border-subtle rounded-2xl px-5 py-4 flex items-center gap-1.5 ${nextTurn === "char1" ? "bg-surface-elevated rounded-bl-sm" : "bg-surface-dark border-brand-green/30 rounded-br-sm"}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-brand-green typing-dot-1" />
              <span className="w-1.5 h-1.5 rounded-full bg-brand-green typing-dot-2" />
              <span className="w-1.5 h-1.5 rounded-full bg-brand-green typing-dot-3" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-5 py-4 bg-surface-dark border-t border-border-subtle flex justify-center">
        <button
          onClick={proceedConversation}
          disabled={isLoading}
          className="w-full max-w-sm bg-brand-green hover:bg-brand-green-mid text-page-bg font-medium px-6 py-4 rounded-xl transition-all duration-200 disabled:opacity-40 shadow-[0_0_0px_rgba(0,229,153,0)] hover:shadow-[0_0_16px_rgba(0,229,153,0.3)] text-[15px] tracking-[-0.3px] flex items-center justify-center gap-2"
        >
          {isLoading ? (
             <span>Waiting for response...</span>
          ) : (
            <>
                <span>Click to generate next response for <b>{activeChar.name}</b></span>
                <span className="text-page-bg/70 group-hover:translate-x-1 transition-transform">→</span>
            </>
           )}
        </button>
      </div>
    </div>
  );
}
