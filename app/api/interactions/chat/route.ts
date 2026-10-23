import { NextResponse } from "next/server";
import { getPersonas, getInteractionRooms, saveInteractionRooms } from "@/lib/db";
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
        room.nextTurn = room.nextTurn === "persona1" ? "persona2" : "persona1";
      } else {
        return NextResponse.json({ error: "No message to regenerate" }, { status: 400 });
      }
    }

    const personas = getPersonas();

    const persona1 = personas.find((c) => c.id === room.persona1Id);
    const persona2 = personas.find((c) => c.id === room.persona2Id);

    if (!persona1 || !persona2) {
      return NextResponse.json({ error: "One or both personas not found" }, { status: 404 });
    }

    const activePersonaId = room.nextTurn === "persona1" ? room.persona1Id : room.persona2Id;
    const activePersona = room.nextTurn === "persona1" ? persona1 : persona2;
    const otherPersona = room.nextTurn === "persona1" ? persona2 : persona1;

    // Convert history for the active persona's perspective
    // Their own past messages are "assistant", the other persona's are "user"
    const recentMessages = room.messages.slice(-10).map((msg) => ({
      role: msg.personaId === activePersonaId ? ("assistant" as const) : ("user" as const),
      content: msg.content,
    }));

    const apiMessages = [
      {
        role: "system" as const,
        content: `You are playing the role of ${activePersona.name}. ${activePersona.persona}\n\nYou are having a conversation with ${otherPersona.name}. Respond naturally in persona as ${activePersona.name}.`,
      },
      ...recentMessages,
    ];

    const selectedModel = resolveGroqModel(model);
    if (!selectedModel) {
      return NextResponse.json({ error: "Unsupported model" }, { status: 400 });
    }

    const replyContent = await createGroqReply(apiMessages, selectedModel);

    const newMessage = {
      personaId: activePersonaId,
      content: replyContent,
      timestamp: Date.now(),
    };

    room.messages.push(newMessage);
    room.nextTurn = room.nextTurn === "persona1" ? "persona2" : "persona1";
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
