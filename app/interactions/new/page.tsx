"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Character } from "@/lib/db";

export default function NewInteractionPage() {
  const router = useRouter();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedChar1, setSelectedChar1] = useState<string>("");
  const [selectedChar2, setSelectedChar2] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/characters")
      .then((res) => res.json())
      .then((data) => {
        setCharacters(data);
        if (data.length >= 2) {
          setSelectedChar1(data[0].id);
          setSelectedChar2(data[1].id);
        }
      });
  }, []);

  const handleStartInteraction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedChar1 || !selectedChar2) {
      setError("Please select two characters to interact.");
      return;
    }

    if (selectedChar1 === selectedChar2) {
      setError("Please select two different characters.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          character1Id: selectedChar1,
          character2Id: selectedChar2,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create interaction room");
      }

      const room = await res.json();
      router.push(`/interactions/${room.id}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  if (characters.length < 2) {
    return (
      <main className="min-h-screen p-8 max-w-2xl mx-auto flex flex-col items-center justify-center space-y-6">
        <h1 className="text-[24px] text-text-primary text-center">Not enough characters</h1>
        <p className="text-text-secondary text-center">You need at least 2 characters to start an interaction.</p>
        <Link href="/characters/new" className="text-brand-green hover:underline">
          Go create more characters
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto space-y-12">
      <header className="space-y-2 pb-6 border-b border-border-subtle">
        <div className="flex items-center gap-3 text-[14px] text-text-muted font-mono mb-4">
          <Link href="/" className="hover:text-text-primary transition-colors">
            ← Back
          </Link>
        </div>
        <h1 className="text-[32px] font-medium text-text-primary tracking-[-0.6px]">
          New Interaction
        </h1>
        <p className="text-text-secondary">Select two characters to watch them converse.</p>
      </header>

      <form onSubmit={handleStartInteraction} className="space-y-8">
        <div className="space-y-3">
          <label className="text-[13px] font-mono text-text-muted uppercase tracking-[0.1em]">
            Character 1 (Initiator)
          </label>
          <select
            value={selectedChar1}
            onChange={(e) => setSelectedChar1(e.target.value)}
            className="w-full bg-surface-dark border border-border-subtle rounded-xl px-4 py-3 text-[15px] text-text-primary focus:border-brand-green focus:shadow-[0_0_0_1px_rgba(0,229,153,0.2)] outline-none transition-all"
            required
          >
            {characters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          <label className="text-[13px] font-mono text-text-muted uppercase tracking-[0.1em]">
            Character 2 (Responder)
          </label>
          <select
            value={selectedChar2}
            onChange={(e) => setSelectedChar2(e.target.value)}
            className="w-full bg-surface-dark border border-border-subtle rounded-xl px-4 py-3 text-[15px] text-text-primary focus:border-brand-green focus:shadow-[0_0_0_1px_rgba(0,229,153,0.2)] outline-none transition-all"
            required
          >
            {characters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="text-[14px] text-error">{error}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-brand-green hover:bg-brand-green-mid text-page-bg font-medium px-6 py-4 rounded-xl transition-all duration-200 disabled:opacity-40 text-[16px] tracking-[-0.3px]"
        >
          {isLoading ? "Starting Simulation..." : "Start Simulation"}
        </button>
      </form>
    </main>
  );
}
