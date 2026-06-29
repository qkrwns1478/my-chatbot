"use client";

import { useState, useEffect, useRef, use } from "react";
import Link from "next/link";
import { Message } from "@/lib/db";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import AVAILABLE_MODELS from "@/data/models";
import Image from "next/image";

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [messages, setMessages] = useState<Message[]>([]);
  const [characterName, setCharacterName] = useState<string>("Character");
  const [characterImage, setCharacterImage] = useState<string>("/pictures/default.jpg");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0].id);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editInput, setEditInput] = useState("");
  const [editWidth, setEditWidth] = useState<number | string>("auto");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const roomRes = await fetch(`/api/chatrooms/${id}`);
        if (!roomRes.ok) throw new Error("Failed to load chatroom");
        const roomData = await roomRes.json();
        setMessages(roomData.messages || []);

        const charRes = await fetch("/api/characters");
        if (charRes.ok) {
          const charData = await charRes.json();
          const char = charData.find((c: { id: string }) => c.id === roomData.characterId);
          if (char) {
            setCharacterName(char.name);
            setCharacterImage(char.imageUrl || "/pictures/default.jpg");
          }
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    setIsLoading(true);

    const tempMessage: Message = { role: "user", content: userMsg, timestamp: Date.now() };
    setMessages((prev) => [...prev, tempMessage]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatroomId: id, message: userMsg, model: selectedModel }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => [...prev, data.reply]);
      } else {
        console.error(data.error);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const editMessage = async (index: number) => {
    if (!editInput.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/chatrooms/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ index, content: editInput.trim() }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessages(data.messages);
        setEditingIndex(null);
        // 수정 후 자동으로 새로운 답변 생성
        await fetchReply(data.messages);
      } else {
        console.error(data.error);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const regenerateResponse = async () => {
    if (isLoading || messages.length === 0) return;
    if (messages[messages.length - 1].role !== "assistant") return;

    setIsLoading(true);
    // UI에서 마지막 답변 제거 (낙관적 업데이트는 취향에 따라 선택, 여기서는 API 완료 후 교체)
    setMessages((prev) => prev.slice(0, -1));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatroomId: id, model: selectedModel, action: "regenerate" }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => [...prev, data.reply]);
      } else {
        console.error(data.error);
        // 실패 시 원래 메시지 복구 로직이 필요할 수 있음
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReply = async (currentMessages: Message[]) => {
    setIsLoading(true);
    try {
      const lastUserMsg = currentMessages[currentMessages.length - 1].content;
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatroomId: id, message: lastUserMsg, model: selectedModel }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => [...prev, data.reply]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

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
          <div className="flex items-center gap-2">
            <h1 className="text-[18px] font-medium text-text-primary tracking-[-0.13px]">
              {characterName}
            </h1>
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
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
            {msg.role === "user" ? (
              <span className="text-[12px] font-mono text-text-muted mb-1.5">You</span>
            ) : (
              <div className="flex items-center gap-2 mb-1.5">
                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-border-subtle bg-surface-elevated">
                  <Image src={characterImage} alt={characterName} fill className="object-cover" />
                </div>
                <span className="text-[12px] font-mono text-text-muted">{characterName}</span>
              </div>
            )}
            <div
              ref={(el) => { messageRefs.current[idx] = el; }}
              style={editingIndex === idx ? { width: editWidth } : {}}
              className={`px-5 py-4 max-w-[85%] rounded-2xl text-[16px] leading-[26px] ${
                msg.role === "user"
                  ? "bg-brand-green-dark border border-brand-green/20 text-text-primary rounded-br-sm"
                  : "bg-surface-elevated border border-border-subtle text-text-primary rounded-bl-sm"
              }`}
            >
              <div className="space-y-2">
                {editingIndex === idx ? (
                  <div className="flex flex-col">
                    <textarea
                      ref={(el) => {
                        if (el) {
                          el.style.height = 'auto';
                          el.style.height = el.scrollHeight + 'px';
                        }
                      }}
                      value={editInput}
                      onChange={(e) => {
                        setEditInput(e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = e.target.scrollHeight + 'px';
                      }}
                      className="bg-transparent border-none p-0 text-[16px] leading-[26px] text-text-primary focus:outline-none w-full resize-none overflow-hidden block"
                      autoFocus
                    />
                  </div>
                ) : (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ ...props }) => <p className="mb-4 last:mb-0 leading-[26px]" {...props} />,
                      a: ({ ...props }) => (
                        <a
                          className="text-brand-green hover:text-brand-green-mid underline underline-offset-2 cursor-pointer"
                          target="_blank"
                          rel="noopener noreferrer"
                          {...props}
                        />
                      ),
                      strong: ({ ...props }) => <strong className="font-medium text-text-primary" {...props} />,
                      h1: ({ ...props }) => (
                        <h1 className="text-[22px] font-medium mt-6 mb-3 text-text-primary border-b border-border-subtle pb-2" {...props} />
                      ),
                      h2: ({ ...props }) => (
                        <h2 className="text-[18px] font-medium mt-5 mb-3 text-text-primary" {...props} />
                      ),
                      h3: ({ ...props }) => (
                        <h3 className="text-[16px] font-medium mt-4 mb-2 text-text-secondary" {...props} />
                      ),
                      ul: ({ ...props }) => <ul className="list-disc ml-5 space-y-1.5 mb-4 text-text-secondary" {...props} />,
                      ol: ({ ...props }) => <ol className="list-decimal ml-5 space-y-1.5 mb-4 text-text-secondary" {...props} />,
                      li: ({ ...props }) => <li className="pl-1 text-text-primary" {...props} />,
                      blockquote: ({ ...props }) => (
                        <blockquote
                          className="border-l-2 border-brand-green/50 pl-4 py-1 text-text-secondary italic my-4"
                          {...props}
                        />
                      ),
                      code: (props) => {
                        const { children, className, ...rest } = props;
                        const match = /language-(\w+)/.exec(className || "");
                        return match ? (
                          <pre className="bg-page-bg border border-border-subtle rounded-xl p-4 my-4 overflow-x-auto text-[14px] font-mono text-text-secondary leading-[23.1px] tracking-[-0.28px]">
                            <code className={className} {...rest}>
                              {children}
                            </code>
                          </pre>
                        ) : (
                          <code
                            className="bg-surface-dark border border-border-subtle rounded px-1.5 py-0.5 text-[13px] font-mono text-brand-green-mid tracking-[-0.28px]"
                            {...rest}
                          >
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                )}
              </div>
            </div>
	            {editingIndex === idx ? (
	              <div className="flex gap-2 mt-2 mr-1">
	                <button
	                  onClick={() => {
	                    setEditingIndex(null);
	                    setEditWidth("auto");
	                  }}
	                  className="text-[12px] text-text-muted hover:text-text-primary transition-colors bg-surface-dark px-3 py-1.5 rounded-md border border-border-subtle"
	                >
	                  Cancel
	                </button>
	                <button
	                  onClick={() => {
	                    editMessage(idx);
	                    setEditWidth("auto");
	                  }}
	                  className="text-[12px] text-brand-green font-medium hover:text-brand-green-mid transition-colors bg-brand-green/10 px-3 py-1.5 rounded-md border border-brand-green/20"
	                >
	                  Save
	                </button>
	              </div>
	            ) : (
	              msg.role === "user" && (
	                <button
	                  onClick={() => {
	                    const el = messageRefs.current[idx];
	                    if (el) {
	                      setEditWidth(el.offsetWidth);
	                    }
	                    setEditingIndex(idx);
	                    setEditInput(msg.content);
	                  }}
	                  className="text-[11px] font-mono text-text-muted mt-1 hover:text-brand-green transition-colors mr-1"
	                >
	                  Edit
	                </button>
	              )
	            )}
            {msg.role === "assistant" && idx === messages.length - 1 && !isLoading && (
              <button
                onClick={regenerateResponse}
                className="text-[11px] font-mono text-text-muted mt-1 hover:text-brand-green transition-colors ml-1"
              >
                Regenerate
              </button>
            )}
          </div>

        ))}

        {isLoading && (
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-border-subtle bg-surface-elevated">
                <Image src={characterImage} alt={characterName} fill className="object-cover" />
              </div>
              <span className="text-[12px] font-mono text-text-muted">{characterName}</span>
            </div>
            <div className="bg-surface-elevated border border-border-subtle rounded-2xl rounded-bl-sm px-5 py-4 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-green typing-dot-1" />
              <span className="w-1.5 h-1.5 rounded-full bg-brand-green typing-dot-2" />
              <span className="w-1.5 h-1.5 rounded-full bg-brand-green typing-dot-3" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-5 py-4 bg-surface-dark border-t border-border-subtle">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 bg-surface-elevated border border-border-subtle rounded-xl px-4 py-3 text-[16px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-green focus:shadow-[0_0_0_1px_rgba(0,229,153,0.2)] transition-all duration-200"
          />
          <button
            onClick={sendMessage}
            disabled={isLoading}
            className="bg-brand-green hover:bg-brand-green-mid text-page-bg font-medium px-6 py-3 rounded-xl transition-all duration-200 disabled:opacity-40 shadow-[0_0_0px_rgba(0,229,153,0)] hover:shadow-[0_0_16px_rgba(0,229,153,0.3)] text-[15px] tracking-[-0.3px]"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
