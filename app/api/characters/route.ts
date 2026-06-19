import { NextResponse } from "next/server";
import { getCharacters, saveCharacters, Character } from "@/lib/db";
import crypto from "crypto";

export async function GET() {
  try {
    const characters = getCharacters();
    return NextResponse.json(characters);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const newCharacter: Character = {
      id: crypto.randomUUID(),
      name: body.name,
      persona: body.persona,
      greeting: body.greeting || "Hello.",
    };

    const characters = getCharacters();
    characters.push(newCharacter);
    saveCharacters(characters);

    return NextResponse.json(newCharacter);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
