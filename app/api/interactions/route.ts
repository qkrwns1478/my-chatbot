import { NextResponse } from "next/server";
import { getPersonas, getInteractionRooms, saveInteractionRooms } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { persona1Id, persona2Id } = await req.json();

    if (!persona1Id || !persona2Id) {
      return NextResponse.json({ error: "Missing personas" }, { status: 400 });
    }

    const personas = getPersonas();
    const persona1 = personas.find((c) => c.id === persona1Id && c.userId === session.userId);

    if (!persona1) {
      return NextResponse.json({ error: "Persona 1 not found or unauthorized" }, { status: 404 });
    }

    const rooms = getInteractionRooms();
    const newRoomId = `interaction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const newRoom = {
      id: newRoomId,
      userId: session.userId,
      persona1Id,
      persona2Id,
      nextTurn: "persona2" as const, // Persona 1 speaks first (greeting), so persona 2 is next
      messages: [
        {
          personaId: persona1Id,
          content: persona1.greeting,
          timestamp: Date.now(),
        },
      ],
      updatedAt: Date.now(),
    };

    rooms.push(newRoom);
    saveInteractionRooms(rooms);

    return NextResponse.json(newRoom, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create interaction room" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const rooms = getInteractionRooms().filter((room) => room.userId === session.userId);
    return NextResponse.json(rooms);
  } catch {
    return NextResponse.json({ error: "Failed to fetch interaction rooms" }, { status: 500 });
  }
}
