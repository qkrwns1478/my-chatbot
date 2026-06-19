"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EditCharacterPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [formData, setFormData] = useState({ name: "", persona: "", greeting: "" });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch("/api/characters")
      .then((res) => res.json())
      .then((data) => {
        const char = data.find((c: any) => c.id === id);
        if (char) {
          setFormData({ name: char.name, persona: char.persona, greeting: char.greeting });
        } else {
          router.push("/");
        }
      });
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`/api/characters/${id}`, {
        method: "PUT",
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
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[13px] text-text-muted hover:text-text-secondary transition-colors font-mono"
        >
          ← Back
        </Link>

        <div className="bg-surface-dark border border-border-subtle rounded-2xl p-8 space-y-7 relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-green/40 to-transparent" />

          <div>
            <p className="text-[12px] font-mono uppercase tracking-[0.12em] text-brand-green mb-3">
              Edit Persona
            </p>
            <h1 className="text-[48px] font-normal leading-[54px] tracking-[-1.92px] text-text-primary">
              Edit Character
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[12px] font-mono text-text-muted uppercase tracking-[0.08em]">
                Name
              </label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-surface-elevated border border-border-subtle rounded-xl px-4 py-3 text-[16px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-green focus:shadow-[0_0_0_1px_rgba(0,229,153,0.3)] transition-all duration-200"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-mono text-text-muted uppercase tracking-[0.08em]">
                System Persona
              </label>
              <textarea
                required
                value={formData.persona}
                onChange={(e) => setFormData({ ...formData, persona: e.target.value })}
                className="w-full h-32 bg-surface-elevated border border-border-subtle rounded-xl px-4 py-3 text-[16px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-green focus:shadow-[0_0_0_1px_rgba(0,229,153,0.3)] transition-all duration-200 resize-none leading-[24px]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-mono text-text-muted uppercase tracking-[0.08em]">
                First Greeting
              </label>
              <input
                required
                type="text"
                value={formData.greeting}
                onChange={(e) => setFormData({ ...formData, greeting: e.target.value })}
                className="w-full bg-surface-elevated border border-border-subtle rounded-xl px-4 py-3 text-[16px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-green focus:shadow-[0_0_0_1px_rgba(0,229,153,0.3)] transition-all duration-200"
              />
            </div>

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="w-1/3 bg-surface-elevated border border-border-subtle text-text-secondary hover:text-text-primary hover:border-border-mid font-medium text-[16px] py-4 rounded-xl transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="w-2/3 bg-brand-green hover:bg-brand-green-mid text-page-bg font-medium text-[16px] py-4 rounded-xl transition-all duration-200 disabled:opacity-40 shadow-[0_0_0px_rgba(0,229,153,0)] hover:shadow-[0_0_24px_rgba(0,229,153,0.25)] tracking-[-0.3px]"
              >
                {isLoading ? "Saving..." : "Update Character"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
