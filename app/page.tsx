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
      <header className="flex justify-between items-end border-b border-border-subtle pb-6">
        <h1 className="text-[68px] font-normal leading-[1] tracking-[-1.92px] text-text-primary">Neon Deck</h1>
        <Link
          href="/characters/new"
          className="text-[15px] bg-surface-elevated border border-border-subtle hover:border-brand-green px-6 py-3 rounded-xl transition-colors text-text-primary"
        >
          + Add Persona
        </Link>
      </header>

      <section className="space-y-6">
        <h2 className="text-[18px] font-medium leading-[18px] tracking-[-0.13px] text-text-secondary">
          Available Characters
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {characters.map((char) => (
            <div
              key={char.id}
              onClick={() => startChat(char)}
              className="group bg-surface-dark border border-border-subtle rounded-2xl p-6 cursor-pointer hover:border-brand-green transition-all flex flex-col justify-between"
            >
              <div>
                <h3 className="text-[18px] text-text-primary mb-2 group-hover:text-brand-green transition-colors">
                  {char.name}
                </h3>
                <p className="text-[15px] text-text-tertiary line-clamp-2">{char.persona}</p>
              </div>
              <div className="flex gap-3 mt-6 pt-4 border-t border-border-subtle">
                <button
                  onClick={(e) => navigateToEdit(e, char.id)}
                  className="text-[13px] text-text-secondary hover:text-text-primary transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => deleteCharacter(e, char.id)}
                  className="text-[13px] text-error hover:opacity-80 transition-opacity"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {characters.length === 0 && (
            <div className="text-[15px] text-text-muted">No characters found. Create one to begin.</div>
          )}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-[18px] font-medium leading-[18px] tracking-[-0.13px] text-text-secondary">
          Recent Sessions
        </h2>
        <div className="space-y-4">
          {chatrooms
            .sort((a, b) => b.updatedAt - a.updatedAt)
            .map((room) => {
              const char = characters.find((c) => c.id === room.characterId);
              return (
                <Link
                  key={room.id}
                  href={`/chat/${room.id}`}
                  className="block bg-surface-dark border border-border-subtle rounded-xl p-4 hover:bg-surface-elevated transition-colors"
                >
                  <div className="flex justify-between items-center text-[15px]">
                    <div className="flex items-center gap-4">
                      <span className="text-text-primary font-mono tracking-[-0.32px]">{room.id.split("-")[0]}</span>
                      <span className="text-text-secondary">
                        {char ? `Chat with ${char.name}` : "Unknown Character"}
                      </span>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="text-text-tertiary text-[13px]">
                        {new Date(room.updatedAt).toLocaleString()}
                      </span>
                      <button
                        onClick={(e) => deleteChatroom(e, room.id)}
                        className="text-[13px] text-error hover:opacity-80 transition-opacity"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </Link>
              );
            })}
        </div>
      </section>
    </main>
  );
}
