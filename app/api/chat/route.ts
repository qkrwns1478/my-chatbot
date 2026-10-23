import { NextResponse } from "next/server";
import { getPersonas, getChatrooms, saveChatrooms } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { createGroqReply, resolveGroqModel } from "@/lib/groq";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { chatroomId, message, model, action } = await req.json();

    const chatrooms = getChatrooms();
    const chatroomIndex = chatrooms.findIndex((c) => c.id === chatroomId && c.userId === session.userId);

    if (chatroomIndex === -1) {
      return NextResponse.json({ error: "Chatroom not found or access denied" }, { status: 404 });
    }

    const chatroom = chatrooms[chatroomIndex];

    if (action === "regenerate") {
      // Regenerable only if the last message is assistant
      if (chatroom.messages.length > 0 && chatroom.messages[chatroom.messages.length - 1].role === "assistant") {
        chatroom.messages.pop();
      } else {
        return NextResponse.json({ error: "No assistant message to regenerate" }, { status: 400 });
      }
    } else {
      const userMessage = { role: "user" as const, content: message, timestamp: Date.now() };
      chatroom.messages.push(userMessage);
    }

    const personas = getPersonas();
    const persona = personas.find((c) => c.id === chatroom.personaId);

    if (!persona) {
      return NextResponse.json({ error: "Persona not found" }, { status: 404 });
    }

    const recentMessages = chatroom.messages.slice(-10).map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    const apiMessages = [{ role: "system" as const, content: persona.persona }, ...recentMessages];

    const selectedModel = resolveGroqModel(model);
    if (!selectedModel) {
      return NextResponse.json({ error: "Unsupported model" }, { status: 400 });
    }

    const replyContent = await createGroqReply(apiMessages, selectedModel);

    const assistantMessage = { role: "assistant" as const, content: replyContent, timestamp: Date.now() };
    chatroom.messages.push(assistantMessage);
    chatroom.updatedAt = Date.now();

    chatrooms[chatroomIndex] = chatroom;
    saveChatrooms(chatrooms);

    return NextResponse.json({ reply: assistantMessage });
  } catch (error: unknown) {
    console.error("Chat API Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
