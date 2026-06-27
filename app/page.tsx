"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Character, Chatroom, InteractionRoom } from "@/lib/db";
import { useConfirm } from "@/context/ConfirmContext";

import Image from "next/image";

export default function Home() {
  const router = useRouter();
  const { confirm } = useConfirm();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [chatrooms, setChatrooms] = useState<Chatroom[]>([]);
  const [interactions, setInteractions] = useState<InteractionRoom[]>([]);

  const fetchData = () => {
    fetch("/api/characters")
      .then((res) => res.json())
      .then(setCharacters);
    fetch("/api/chatrooms")
      .then((res) => res.json())
      .then(setChatrooms);
    fetch("/api/interactions")
      .then((res) => res.json())
      .then(setInteractions)
      .catch(() => setInteractions([])); // Handle gracefully if not found
  };

  useEffect(() => {
    fetchData();
  }, []);

  const startChat = useCallback(async (character: Character) => {
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
  }, [router]);

  const deleteCharacter = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const ok = await confirm({
      title: "Delete Character",
      message: "Are you sure you want to delete this character?",
      confirmText: "Delete",
      variant: "danger",
    });
    if (!ok) return;
    await fetch(`/api/characters/${id}`, { method: "DELETE" });
    fetchData();
  };

  const deleteChatroom = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const ok = await confirm({
      title: "Delete Session",
      message: "Are you sure you want to delete this session?",
      confirmText: "Delete",
      variant: "danger",
    });
    if (!ok) return;
    await fetch(`/api/chatrooms/${id}`, { method: "DELETE" });
    fetchData();
  };

  const deleteInteraction = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const ok = await confirm({
      title: "Delete Interaction",
      message: "Are you sure you want to delete this interaction session?",
      confirmText: "Delete",
      variant: "danger",
    });
    if (!ok) return;
    await fetch(`/api/interactions/${id}`, { method: "DELETE" });
    fetchData();
  };

  const navigateToEdit = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    router.push(`/characters/${id}/edit`);
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <main className="min-h-screen p-8 max-w-5xl mx-auto space-y-16">
      {/* Header */}
      <header className="flex justify-between items-end border-b border-border-subtle pb-8">
        <div>
          <h1 className="text-[68px] font-normal leading-[1] tracking-[-1.92px] text-text-primary">
            Neon Character Chat
          </h1>
        </div>
        <div className="flex gap-4 items-center">
          <button
            onClick={logout}
            className="text-[14px] text-text-muted hover:text-text-primary transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Characters */}
      <section className="space-y-5">
        <div className="flex justify-between items-center">
          <h2 className="text-[12px] font-mono uppercase tracking-[0.12em] text-text-muted">
            Your Characters
          </h2>
          <Link
            href="/characters/new"
            className="text-[13px] text-brand-green hover:text-brand-green-mid transition-colors"
          >
            + Add Character
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {characters.map((char) => (
            <div
              key={char.id}
              onClick={() => startChat(char)}
              className="group relative bg-surface-dark border border-border-subtle rounded-2xl p-6 cursor-pointer hover:border-brand-green/50 hover:shadow-[0_0_28px_rgba(0,229,153,0.07)] transition-all duration-300 flex flex-col justify-between overflow-hidden"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-green/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="flex gap-4 items-start">
                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-border-subtle bg-surface-elevated relative">
                  <Image
                    src={char.imageUrl || "/pictures/default.jpg"}
                    alt={char.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-[18px] leading-[1.3] text-text-primary mb-2 group-hover:text-brand-green transition-colors duration-200">
                    {char.name}
                  </h3>
                  <p className="text-[14px] text-text-tertiary leading-[21px] line-clamp-2">{char.persona}</p>
                </div>
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

      {/* Interactions / Simulations */}
      <section className="space-y-5">
        <div className="flex justify-between items-center">
          <h2 className="text-[12px] font-mono uppercase tracking-[0.12em] text-text-muted">
            Character Interactions
          </h2>
          <Link
            href="/interactions/new"
            className="text-[13px] text-brand-green hover:text-brand-green-mid transition-colors"
          >
            + Start Interaction
          </Link>
        </div>
        <div className="space-y-2">
          {interactions
            .sort((a, b) => b.updatedAt - a.updatedAt)
            .map((room) => {
              const char1 = characters.find((c) => c.id === room.character1Id);
              const char2 = characters.find((c) => c.id === room.character2Id);
              if (!char1 || !char2) return null;

              return (
                <Link
                  key={room.id}
                  href={`/interactions/${room.id}`}
                  className="group flex items-center justify-between bg-surface-dark border border-border-subtle rounded-xl px-5 py-4 hover:border-brand-green/40 hover:bg-surface-elevated transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[15px] text-text-secondary group-hover:text-text-primary transition-colors duration-200">
                      {char1.name} <span className="text-[12px] text-text-muted mx-1">vs</span> {char2.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-5">
                    <span className="text-[12px] text-text-muted font-mono tabular-nums">
                      {new Date(room.updatedAt).toLocaleString()}
                    </span>
                    <button
                      onClick={(e) => deleteInteraction(e, room.id)}
                      className="text-[12px] text-error/50 hover:text-error transition-colors opacity-0 group-hover:opacity-100"
                    >
                      Delete
                    </button>
                  </div>
                </Link>
              );
            })}
          {interactions.length === 0 && (
            <p className="text-[15px] text-text-muted py-8 text-center">
              No active interactions. Watch two characters converse!
            </p>
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
