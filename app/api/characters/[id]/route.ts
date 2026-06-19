import { NextResponse } from "next/server";
import { getCharacters, saveCharacters } from "@/lib/db";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const characters = getCharacters();
    const index = characters.findIndex((c) => c.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Character not found" }, { status: 404 });
    }

    characters[index] = { ...characters[index], name: body.name, persona: body.persona, greeting: body.greeting };
    saveCharacters(characters);

    return NextResponse.json(characters[index]);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const characters = getCharacters();
    const filteredCharacters = characters.filter((c) => c.id !== id);
    saveCharacters(filteredCharacters);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
