import { NextResponse } from "next/server";
import { getChatrooms, saveChatrooms } from "@/lib/db";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const chatrooms = getChatrooms();
    const chatroom = chatrooms.find((c) => c.id === id);

    if (!chatroom) {
      return NextResponse.json({ error: "Chatroom not found" }, { status: 404 });
    }

    return NextResponse.json(chatroom);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const chatrooms = getChatrooms();
    const filteredChatrooms = chatrooms.filter((c) => c.id !== id);
    saveChatrooms(filteredChatrooms);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
