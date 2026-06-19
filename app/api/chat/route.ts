import { NextResponse } from "next/server";
import { getCharacters, getChatrooms, saveChatrooms } from "@/lib/db";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export async function POST(req: Request) {
  try {
    const { chatroomId, message, model } = await req.json();

    const chatrooms = getChatrooms();
    const chatroomIndex = chatrooms.findIndex((c) => c.id === chatroomId);

    if (chatroomIndex === -1) {
      return NextResponse.json({ error: "Chatroom not found" }, { status: 404 });
    }

    const chatroom = chatrooms[chatroomIndex];
    const characters = getCharacters();
    const character = characters.find((c) => c.id === chatroom.characterId);

    if (!character) {
      return NextResponse.json({ error: "Character not found" }, { status: 404 });
    }

    const userMessage = { role: "user" as const, content: message, timestamp: Date.now() };
    chatroom.messages.push(userMessage);

    const recentMessages = chatroom.messages.slice(-10).map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    const apiMessages = [{ role: "system", content: character.persona }, ...recentMessages];

    const selectedModel = model || "google/gemini-2.5-flash";

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Neon Character Chat",
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: apiMessages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Failed to fetch from OpenRouter");
    }

    const replyContent = data.choices[0].message.content;

    const assistantMessage = { role: "assistant" as const, content: replyContent, timestamp: Date.now() };
    chatroom.messages.push(assistantMessage);
    chatroom.updatedAt = Date.now();

    chatrooms[chatroomIndex] = chatroom;
    saveChatrooms(chatrooms);

    return NextResponse.json({ reply: assistantMessage });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
