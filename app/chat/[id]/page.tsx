"use client";

import { useState, useEffect, useRef, use } from "react";
import { Message } from "@/lib/db";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import AVAILABLE_MODELS from "@/data/models";

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [messages, setMessages] = useState<Message[]>([]);
  const [characterName, setCharacterName] = useState<string>("Character");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0].id);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. 채팅방 데이터 불러오기
        const roomRes = await fetch(`/api/chatrooms/${id}`);
        if (!roomRes.ok) throw new Error("Failed to load chatroom");
        const roomData = await roomRes.json();
        setMessages(roomData.messages || []);

        // 2. 캐릭터 목록을 불러와서 현재 채팅방의 캐릭터 이름 찾기
        const charRes = await fetch("/api/characters");
        if (charRes.ok) {
          const characters = await charRes.json();
          const char = characters.find((c: any) => c.id === roomData.characterId);
          if (char) {
            setCharacterName(char.name); // 찾은 이름으로 상태 업데이트
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

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto border-x border-border-subtle bg-surface-dark">
      {/* Header Area with Model Selection */}
      <header className="p-4 border-b border-border-subtle bg-surface-dark flex justify-between items-center">
        <h1 className="text-[18px] font-medium text-text-primary tracking-[-0.13px]">
          Chat with {characterName} {/* 헤더에도 캐릭터 이름 반영 */}
        </h1>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="bg-surface-elevated text-[13px] text-text-primary border border-border-subtle rounded-xl px-3 py-2 outline-none focus:border-brand-green tracking-[-0.13px] cursor-pointer"
        >
          {AVAILABLE_MODELS.map((model) => (
            <option key={model.id} value={model.id}>
              {model.label}
            </option>
          ))}
        </select>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
            <span className="text-[13px] text-text-secondary mb-1 tracking-[-0.13px]">
              {/* 'Character' 대신 characterName 상태값 출력 */}
              {msg.role === "user" ? "You" : characterName}
            </span>
            <div
              className={`p-4 max-w-[85%] rounded-2xl text-[16px] leading-[24px] overflow-hidden ${
                msg.role === "user"
                  ? "bg-brand-green-dark text-text-primary"
                  : "bg-surface-elevated text-text-primary border border-border-subtle"
              }`}
            >
              {msg.role === "user" ? (
                <div className="whitespace-pre-wrap">{msg.content}</div>
              ) : (
                <div className="space-y-4">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ node, ...props }) => <p className="mb-4 last:mb-0" {...props} />,
                      a: ({ node, ...props }) => (
                        <a
                          className="text-brand-green hover:underline cursor-pointer"
                          target="_blank"
                          rel="noopener noreferrer"
                          {...props}
                        />
                      ),
                      strong: ({ node, ...props }) => <strong className="font-medium text-text-primary" {...props} />,
                      h1: ({ node, ...props }) => (
                        <h1
                          className="text-[24px] font-medium mt-6 mb-4 text-text-primary border-b border-border-subtle pb-2"
                          {...props}
                        />
                      ),
                      h2: ({ node, ...props }) => (
                        <h2 className="text-[20px] font-medium mt-6 mb-4 text-text-primary" {...props} />
                      ),
                      h3: ({ node, ...props }) => (
                        <h3 className="text-[18px] font-medium mt-5 mb-3 text-text-primary" {...props} />
                      ),
                      ul: ({ node, ...props }) => <ul className="list-disc ml-6 space-y-2 mb-4" {...props} />,
                      ol: ({ node, ...props }) => <ol className="list-decimal ml-6 space-y-2 mb-4" {...props} />,
                      li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                      blockquote: ({ node, ...props }) => (
                        <blockquote
                          className="border-l-4 border-brand-green-mid pl-4 py-1 text-text-secondary bg-surface-dark/50 rounded-r-xl"
                          {...props}
                        />
                      ),
                      code: (props) => {
                        const { children, className, node, ...rest } = props;
                        const match = /language-(\w+)/.exec(className || "");
                        return match ? (
                          <pre className="bg-page-bg border border-border-subtle rounded-xl p-4 my-4 overflow-x-auto text-[14px] font-mono text-text-secondary leading-[23.1px] tracking-[-0.28px]">
                            <code className={className} {...rest}>
                              {children}
                            </code>
                          </pre>
                        ) : (
                          <code
                            className="bg-surface-dark border border-border-subtle rounded px-1.5 py-0.5 text-[14px] font-mono text-brand-green-mid tracking-[-0.28px]"
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
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="text-[14px] text-text-secondary font-mono tracking-[-0.28px]">
            {characterName} is typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-surface-dark border-t border-border-subtle">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 bg-page-bg border border-border-subtle rounded-xl px-4 py-3 text-[16px] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand-green"
          />
          <button
            onClick={sendMessage}
            disabled={isLoading}
            className="bg-brand-green hover:bg-brand-green-mid text-page-bg font-medium px-6 py-3 rounded-xl transition-colors disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
