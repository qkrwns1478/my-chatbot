import { NextResponse } from "next/server";
import { getCharacters, saveCharacters } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const characters = getCharacters();
    const index = characters.findIndex((c) => c.id === id && c.userId === session.userId);

    if (index === -1) {
      return NextResponse.json({ error: "Character not found or access denied" }, { status: 404 });
    }

    characters[index] = {
      ...characters[index],
      name: body.name,
      persona: body.persona,
      greeting: body.greeting,
      imageUrl: body.imageUrl,
    };
    saveCharacters(characters);

    return NextResponse.json(characters[index]);
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
    const characters = getCharacters();

    const characterToDelete = characters.find((c) => c.id === id);
    if (characterToDelete && characterToDelete.userId !== session.userId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const filteredCharacters = characters.filter((c) => c.id !== id);
    saveCharacters(filteredCharacters);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
