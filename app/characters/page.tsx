"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewCharacterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", persona: "", greeting: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push("/");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-page-bg flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-surface-dark border border-border-subtle rounded-2xl p-8 space-y-6">
        <div>
          <h1 className="text-[48px] font-normal leading-[54px] tracking-[-1.92px] mb-2 text-text-primary">
            New Persona
          </h1>
          <p className="text-[16px] text-text-secondary leading-[24px]">
            Define the character's core identity and behavior.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[13px] text-text-secondary tracking-[-0.13px]">Name</label>
            <input
              required
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-surface-elevated border border-border-subtle rounded-xl px-4 py-3 text-[16px] text-text-primary focus:outline-none focus:border-brand-green"
              placeholder="e.g. Neon Cyberpunk"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[13px] text-text-secondary tracking-[-0.13px]">System Persona (Prompt)</label>
            <textarea
              required
              value={formData.persona}
              onChange={(e) => setFormData({ ...formData, persona: e.target.value })}
              className="w-full h-32 bg-surface-elevated border border-border-subtle rounded-xl px-4 py-3 text-[16px] text-text-primary focus:outline-none focus:border-brand-green resize-none"
              placeholder="Describe the character's personality, background, and tone..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-[13px] text-text-secondary tracking-[-0.13px]">First Greeting Message</label>
            <input
              required
              type="text"
              value={formData.greeting}
              onChange={(e) => setFormData({ ...formData, greeting: e.target.value })}
              className="w-full bg-surface-elevated border border-border-subtle rounded-xl px-4 py-3 text-[16px] text-text-primary focus:outline-none focus:border-brand-green"
              placeholder="e.g. System online. How can I assist you today?"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-green hover:bg-brand-green-mid text-page-bg font-medium text-[16px] py-4 rounded-xl transition-colors mt-4 disabled:opacity-50"
          >
            Create Character
          </button>
        </form>
      </div>
    </div>
  );
}
