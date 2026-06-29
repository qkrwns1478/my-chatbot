import { NextResponse } from "next/server";
import { getChatrooms, saveChatrooms, Chatroom } from "@/lib/db";
import { getSession } from "@/lib/auth";
import crypto from "crypto";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const chatrooms = getChatrooms().filter((chat) => chat.userId === session.userId);
    return NextResponse.json(chatrooms);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { characterId, initialMessage } = await req.json();

    const newChatroom: Chatroom = {
      id: crypto.randomUUID(),
      userId: session.userId,
      characterId,
      messages: initialMessage ? [initialMessage] : [],
      updatedAt: Date.now(),
    };

    const chatrooms = getChatrooms();
    chatrooms.push(newChatroom);
    saveChatrooms(chatrooms);

    return NextResponse.json(newChatroom);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
