import { NextResponse } from "next/server";
import { getPersonas, savePersonas, Persona } from "@/lib/db";
import { getSession } from "@/lib/auth";
import crypto from "crypto";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const personas = getPersonas().filter((c) => c.userId === session.userId);
    return NextResponse.json(personas);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    const newPersona: Persona = {
      id: crypto.randomUUID(),
      userId: session.userId,
      name: body.name,
      persona: body.persona,
      greeting: body.greeting || "Hello.",
      imageUrl: body.imageUrl || undefined,
    };

    const personas = getPersonas();
    personas.push(newPersona);
    savePersonas(personas);

    return NextResponse.json(newPersona);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
