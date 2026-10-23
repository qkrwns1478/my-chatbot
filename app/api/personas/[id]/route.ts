import { NextResponse } from "next/server";
import { getPersonas, savePersonas } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const personas = getPersonas();
    const index = personas.findIndex((c) => c.id === id && c.userId === session.userId);

    if (index === -1) {
      return NextResponse.json({ error: "Persona not found or access denied" }, { status: 404 });
    }

    personas[index] = {
      ...personas[index],
      name: body.name,
      persona: body.persona,
      greeting: body.greeting,
      imageUrl: body.imageUrl,
    };
    savePersonas(personas);

    return NextResponse.json(personas[index]);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const personas = getPersonas();

    const personaToDelete = personas.find((c) => c.id === id);
    if (personaToDelete && personaToDelete.userId !== session.userId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const filteredpersonas = personas.filter((c) => c.id !== id);
    savePersonas(filteredpersonas);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
