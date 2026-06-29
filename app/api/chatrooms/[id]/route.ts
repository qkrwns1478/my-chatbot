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

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { index, content } = await req.json();

    const chatrooms = getChatrooms();
    const chatroomIndex = chatrooms.findIndex((c) => c.id === id && c.userId === session.userId);

    if (chatroomIndex === -1) {
      return NextResponse.json({ error: "Chatroom not found or access denied" }, { status: 404 });
    }

    const chatroom = chatrooms[chatroomIndex];

    if (index < 0 || index >= chatroom.messages.length) {
      return NextResponse.json({ error: "Invalid message index" }, { status: 400 });
    }

    // 수정 시 해당 인덱스 이후의 메시지들은 삭제 (대화 흐름 일관성)
    chatroom.messages[index].content = content;
    chatroom.messages[index].timestamp = Date.now();
    chatroom.messages = chatroom.messages.slice(0, index + 1);
    chatroom.updatedAt = Date.now();

    chatrooms[chatroomIndex] = chatroom;
    saveChatrooms(chatrooms);

    return NextResponse.json({ success: true, messages: chatroom.messages });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
