"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ImageCropperModal from "@/components/ImageCropperModal";
import Image from "next/image";

export default function NewCharacterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", persona: "", greeting: "", imageUrl: "" });
  const [isLoading, setIsLoading] = useState(false);

  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener("load", () => setImageToCrop(reader.result?.toString() || null));
      reader.readAsDataURL(file);
      e.target.value = ""; // reset input
    }
  };

  const handleCropComplete = async (croppedFile: File) => {
    setImageToCrop(null);
    setIsUploadingImage(true);

    try {
      const uploadData = new FormData();
      uploadData.append("image", croppedFile);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });

      if (res.ok) {
        const { url } = await res.json();
        setFormData((prev) => ({ ...prev, imageUrl: url }));
      }
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setIsUploadingImage(false);
    }
  };

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
    <div className="min-h-screen flex items-center justify-center p-8">
      {imageToCrop && (
        <ImageCropperModal
          imageSrc={imageToCrop}
          onClose={() => setImageToCrop(null)}
          onCropComplete={handleCropComplete}
        />
      )}

      <div className="w-full max-w-2xl space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[13px] text-text-muted hover:text-text-secondary transition-colors font-mono"
        >
          ← Back
        </Link>

        <div className="bg-surface-dark border border-border-subtle rounded-2xl p-10 space-y-8 relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-green/40 to-transparent" />

          <div>
            <p className="text-[12px] font-mono uppercase tracking-[0.12em] text-brand-green mb-3">New Persona</p>
            <h1 className="text-[48px] font-normal leading-[54px] tracking-[-1.92px] text-text-primary">
              Create Character
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex gap-6 items-start">
              <div className="space-y-2 flex-shrink-0">
                <label className="text-[12px] font-mono text-text-muted uppercase tracking-[0.08em] block">Image</label>
                <div className="relative w-32 h-32 rounded-xl border border-border-subtle overflow-hidden bg-surface-elevated flex flex-col items-center justify-center group">
                  {!formData.imageUrl && (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      disabled={isUploadingImage}
                    />
                  )}
                  {formData.imageUrl ? (
                    <>
                      <Image src={formData.imageUrl} alt="Thumbnail" fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, imageUrl: "" }))}
                        className="absolute top-1 right-1 bg-black/60 hover:bg-red-500/80 text-white rounded-md w-6 h-6 flex items-center justify-center text-sm z-20 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove image"
                      >
                        ✕
                      </button>
                    </>
                  ) : (
                    <div className="text-text-muted text-[12px] flex flex-col items-center gap-1 group-hover:text-brand-green">
                      {isUploadingImage ? (
                        <span>Uploading...</span>
                      ) : (
                        <>
                          <span className="text-[20px]">+</span>
                          <span>Upload</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2 flex-1">
                <label className="text-[12px] font-mono text-text-muted uppercase tracking-[0.08em]">Name</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-surface-elevated border border-border-subtle rounded-xl px-5 py-4 text-[16px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-green focus:shadow-[0_0_0_1px_rgba(0,229,153,0.3)] transition-all duration-200"
                  placeholder="e.g. AI Assistent"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[12px] font-mono text-text-muted uppercase tracking-[0.08em]">
                System Persona
              </label>
              <textarea
                required
                value={formData.persona}
                onChange={(e) => setFormData({ ...formData, persona: e.target.value })}
                className="w-full h-48 bg-surface-elevated border border-border-subtle rounded-xl px-5 py-4 text-[16px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-green focus:shadow-[0_0_0_1px_rgba(0,229,153,0.3)] transition-all duration-200 resize-none leading-[24px]"
                placeholder="Describe the character's personality, background, and tone..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-[12px] font-mono text-text-muted uppercase tracking-[0.08em]">
                First Greeting
              </label>
              <input
                required
                type="text"
                value={formData.greeting}
                onChange={(e) => setFormData({ ...formData, greeting: e.target.value })}
                className="w-full bg-surface-elevated border border-border-subtle rounded-xl px-5 py-4 text-[16px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-green focus:shadow-[0_0_0_1px_rgba(0,229,153,0.3)] transition-all duration-200"
                placeholder="e.g. System online. How can I assist you today?"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || isUploadingImage}
              className="w-full bg-brand-green hover:bg-brand-green-mid text-page-bg font-medium text-[16px] py-4 rounded-xl transition-all duration-200 mt-2 disabled:opacity-40 shadow-[0_0_0px_rgba(0,229,153,0)] hover:shadow-[0_0_24px_rgba(0,229,153,0.25)] tracking-[-0.3px]"
            >
              {isLoading ? "Creating..." : "Create Character"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
