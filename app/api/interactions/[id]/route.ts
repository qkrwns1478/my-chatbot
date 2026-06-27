import { NextResponse } from "next/server";
import { getInteractionRooms, saveInteractionRooms } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const rooms = getInteractionRooms();
    const room = rooms.find((r) => r.id === id && r.userId === session.userId);

    if (!room) {
      return NextResponse.json({ error: "Interaction room not found or access denied" }, { status: 404 });
    }

    return NextResponse.json(room);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    let rooms = getInteractionRooms();

    const roomToDelete = rooms.find(r => r.id === id);
    if (roomToDelete && roomToDelete.userId !== session.userId) {
       return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    rooms = rooms.filter((r) => r.id !== id);
    saveInteractionRooms(rooms);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
