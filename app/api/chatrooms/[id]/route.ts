import { NextResponse } from "next/server";
import { getChatrooms, saveChatrooms } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const chatrooms = getChatrooms();
    const chatroom = chatrooms.find((c) => c.id === id && c.userId === session.userId);

    if (!chatroom) {
      return NextResponse.json({ error: "Chatroom not found or access denied" }, { status: 404 });
    }

    return NextResponse.json(chatroom);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const chatrooms = getChatrooms();

    const chatroomToDelete = chatrooms.find(c => c.id === id);
    if (chatroomToDelete && chatroomToDelete.userId !== session.userId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const filteredChatrooms = chatrooms.filter((c) => c.id !== id);
    saveChatrooms(filteredChatrooms);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
