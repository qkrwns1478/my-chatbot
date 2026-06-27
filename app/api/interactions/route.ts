import { NextResponse } from "next/server";
import { getCharacters, getInteractionRooms, saveInteractionRooms } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { character1Id, character2Id } = await req.json();

    if (!character1Id || !character2Id) {
      return NextResponse.json({ error: "Missing characters" }, { status: 400 });
    }

    const characters = getCharacters();
    const char1 = characters.find(c => c.id === character1Id && c.userId === session.userId);

    if (!char1) {
      return NextResponse.json({ error: "Character 1 not found or unauthorized" }, { status: 404 });
    }

    const rooms = getInteractionRooms();
    const newRoomId = `interaction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const newRoom = {
      id: newRoomId,
      userId: session.userId,
      character1Id,
      character2Id,
      nextTurn: 'char2' as const, // Character 1 speaks first (greeting), so char 2 is next
      messages: [
        {
          characterId: character1Id,
          content: char1.greeting,
          timestamp: Date.now(),
        }
      ],
      updatedAt: Date.now(),
    };

    rooms.push(newRoom);
    saveInteractionRooms(rooms);

    return NextResponse.json(newRoom, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create interaction room" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const rooms = getInteractionRooms().filter(room => room.userId === session.userId);
    return NextResponse.json(rooms);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch interaction rooms" }, { status: 500 });
  }
}
