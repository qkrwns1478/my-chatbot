import { NextResponse } from "next/server";
import { getCharacters, getInteractionRooms, saveInteractionRooms } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { createGroqReply, resolveGroqModel } from "@/lib/groq";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { roomId, model, action } = await req.json();

    const rooms = getInteractionRooms();
    const roomIndex = rooms.findIndex((c) => c.id === roomId && c.userId === session.userId);

    if (roomIndex === -1) {
      return NextResponse.json({ error: "Interaction room not found or access denied" }, { status: 404 });
    }

    const room = rooms[roomIndex];

    if (action === "regenerate") {
      if (room.messages.length > 0) {
        room.messages.pop();
        // Turn back the nextTurn
        room.nextTurn = room.nextTurn === "char1" ? "char2" : "char1";
      } else {
        return NextResponse.json({ error: "No message to regenerate" }, { status: 400 });
      }
    }

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
      role: msg.characterId === activeCharacterId ? ("assistant" as const) : ("user" as const),
      content: msg.content,
    }));

    const apiMessages = [
      {
        role: "system" as const,
        content: `You are playing the role of ${activeCharacter.name}. ${activeCharacter.persona}\n\nYou are having a conversation with ${otherCharacter.name}. Respond naturally in character as ${activeCharacter.name}.`,
      },
      ...recentMessages,
    ];

    const selectedModel = resolveGroqModel(model);
    if (!selectedModel) {
      return NextResponse.json({ error: "Unsupported model" }, { status: 400 });
    }

    const replyContent = await createGroqReply(apiMessages, selectedModel);

    const newMessage = {
      characterId: activeCharacterId,
      content: replyContent,
      timestamp: Date.now(),
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
