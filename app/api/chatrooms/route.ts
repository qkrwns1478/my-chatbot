import { NextResponse } from "next/server";
import { getChatrooms, saveChatrooms, Chatroom } from "@/lib/db";
import crypto from "crypto";

export async function GET() {
  try {
    const chatrooms = getChatrooms();
    return NextResponse.json(chatrooms);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { characterId, initialMessage } = await req.json();

    const newChatroom: Chatroom = {
      id: crypto.randomUUID(),
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
