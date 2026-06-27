import { NextResponse } from "next/server";
import { getInteractionRooms, saveInteractionRooms } from "@/lib/db";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const rooms = getInteractionRooms();
    const room = rooms.find((r) => r.id === id);

    if (!room) {
      return NextResponse.json({ error: "Interaction room not found" }, { status: 404 });
    }

    return NextResponse.json(room);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    let rooms = getInteractionRooms();
    rooms = rooms.filter((r) => r.id !== id);
    saveInteractionRooms(rooms);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
