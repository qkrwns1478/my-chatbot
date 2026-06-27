import { NextResponse } from "next/server";
import { getCharacters, getInteractionRooms, saveInteractionRooms } from "@/lib/db";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export async function POST(req: Request) {
  try {
    const { roomId, model } = await req.json();

    const rooms = getInteractionRooms();
    const roomIndex = rooms.findIndex((c) => c.id === roomId);

    if (roomIndex === -1) {
      return NextResponse.json({ error: "Interaction room not found" }, { status: 404 });
    }

    const room = rooms[roomIndex];
    const characters = getCharacters();

    const char1 = characters.find((c) => c.id === room.character1Id);
    const char2 = characters.find((c) => c.id === room.character2Id);

    if (!char1 || !char2) {
      return NextResponse.json({ error: "One or both characters not found" }, { status: 404 });
    }

    const activeCharacterId = room.nextTurn === "char1" ? room.character1Id : room.character2Id;
    const activeCharacter = room.nextTurn === "char1" ? char1 : char2;
    const otherCharacter = room.nextTurn === "char1" ? char2 : char1;

    // Convert history for the active character's perspective
    // Their own past messages are "assistant", the other char's are "user"
    const recentMessages = room.messages.slice(-10).map((msg) => ({
      role: msg.characterId === activeCharacterId ? "assistant" : ("user" as const),
      content: msg.content,
    }));

    const apiMessages = [
      {
        role: "system",
        content: `You are playing the role of ${activeCharacter.name}. ${activeCharacter.persona}\n\nYou are having a conversation with ${otherCharacter.name}. Respond naturally in character as ${activeCharacter.name}.`
      },
      ...recentMessages
    ];

    const selectedModel = model || "google/gemini-2.5-flash";

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Neon Character Chat",
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: apiMessages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Failed to fetch from OpenRouter");
    }

    const replyContent = data.choices[0].message.content;

    const newMessage = {
        characterId: activeCharacterId,
        content: replyContent,
        timestamp: Date.now()
    };

    room.messages.push(newMessage);
    room.nextTurn = room.nextTurn === "char1" ? "char2" : "char1";
    room.updatedAt = Date.now();

    rooms[roomIndex] = room;
    saveInteractionRooms(rooms);

    return NextResponse.json({ reply: newMessage });
  } catch (error: unknown) {
    console.error("Chat API Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
