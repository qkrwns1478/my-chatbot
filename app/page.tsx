"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Character, Chatroom } from "@/lib/db";

export default function Home() {
  const router = useRouter();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [chatrooms, setChatrooms] = useState<Chatroom[]>([]);

  const fetchData = () => {
    fetch("/api/characters")
      .then((res) => res.json())
      .then(setCharacters);
    fetch("/api/chatrooms")
      .then((res) => res.json())
      .then(setChatrooms);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const startChat = async (character: Character) => {
    try {
      const res = await fetch("/api/chatrooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterId: character.id,
          initialMessage: {
            role: "assistant",
            content: character.greeting,
            timestamp: Date.now(),
          },
        }),
      });
      const newRoom = await res.json();
      router.push(`/chat/${newRoom.id}`);
    } catch (error) {
      console.error("Failed to create chatroom", error);
    }
  };

  const deleteCharacter = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this persona?")) return;
    await fetch(`/api/characters/${id}`, { method: "DELETE" });
    fetchData();
  };

  const deleteChatroom = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this session?")) return;
    await fetch(`/api/chatrooms/${id}`, { method: "DELETE" });
    fetchData();
  };

  const navigateToEdit = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    router.push(`/characters/${id}/edit`);
  };

  return (
    <main className="min-h-screen p-8 max-w-5xl mx-auto space-y-16">
      {/* Header */}
      <header className="flex justify-between items-end border-b border-border-subtle pb-8">
        <div>
          <h1 className="text-[68px] font-normal leading-[1] tracking-[-1.92px] text-text-primary">
            Characters
          </h1>
        </div>
        <Link
          href="/characters/new"
          className="text-[15px] text-brand-green bg-brand-green/10 border border-brand-green/30 hover:border-brand-green hover:bg-brand-green/20 px-6 py-3 rounded-xl transition-all duration-200 tracking-[-0.3px] shadow-[0_0_16px_rgba(0,229,153,0)] hover:shadow-[0_0_16px_rgba(0,229,153,0.12)]"
        >
          + Add Persona
        </Link>
      </header>

      {/* Characters */}
      <section className="space-y-5">
        <h2 className="text-[12px] font-mono uppercase tracking-[0.12em] text-text-muted">
          Available Characters
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {characters.map((char) => (
            <div
              key={char.id}
              onClick={() => startChat(char)}
              className="group relative bg-surface-dark border border-border-subtle rounded-2xl p-6 cursor-pointer hover:border-brand-green/50 hover:shadow-[0_0_28px_rgba(0,229,153,0.07)] transition-all duration-300 flex flex-col justify-between overflow-hidden"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-green/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div>
                <h3 className="text-[18px] leading-[1.3] text-text-primary mb-2 group-hover:text-brand-green transition-colors duration-200">
                  {char.name}
                </h3>
                <p className="text-[14px] text-text-tertiary leading-[21px] line-clamp-2">{char.persona}</p>
              </div>
              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-border-subtle">
                <button
                  onClick={(e) => navigateToEdit(e, char.id)}
                  className="text-[13px] text-text-muted hover:text-text-secondary transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => deleteCharacter(e, char.id)}
                  className="text-[13px] text-error/50 hover:text-error transition-colors ml-auto"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {characters.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 border border-dashed border-border-subtle rounded-2xl gap-4">
              <span className="text-[28px] font-mono text-border-subtle select-none">[ ]</span>
              <p className="text-[15px] text-text-muted">No characters yet.</p>
              <Link
                href="/characters/new"
                className="text-[13px] text-brand-green hover:text-brand-green-mid transition-colors"
              >
                Create your first character →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Recent Sessions */}
      <section className="space-y-5">
        <h2 className="text-[12px] font-mono uppercase tracking-[0.12em] text-text-muted">
          Recent Sessions
        </h2>
        <div className="space-y-2">
          {chatrooms
            .sort((a, b) => b.updatedAt - a.updatedAt)
            .map((room) => {
              const char = characters.find((c) => c.id === room.characterId);
              return (
                <Link
                  key={room.id}
                  href={`/chat/${room.id}`}
                  className="group flex items-center justify-between bg-surface-dark border border-border-subtle rounded-xl px-5 py-4 hover:border-brand-green/40 hover:bg-surface-elevated transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-mono text-brand-green/70 bg-brand-green/8 border border-brand-green/15 rounded px-2 py-0.5 tracking-[-0.2px]">
                      {room.id.split("-")[0]}
                    </span>
                    <span className="text-[15px] text-text-secondary group-hover:text-text-primary transition-colors duration-200">
                      {char ? `Chat with ${char.name}` : "Unknown Character"}
                    </span>
                  </div>
                  <div className="flex items-center gap-5">
                    <span className="text-[12px] text-text-muted font-mono tabular-nums">
                      {new Date(room.updatedAt).toLocaleString()}
                    </span>
                    <button
                      onClick={(e) => deleteChatroom(e, room.id)}
                      className="text-[12px] text-error/50 hover:text-error transition-colors opacity-0 group-hover:opacity-100"
                    >
                      Delete
                    </button>
                  </div>
                </Link>
              );
            })}
          {chatrooms.length === 0 && (
            <p className="text-[15px] text-text-muted py-8 text-center">
              No sessions yet. Click a character to start chatting.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
