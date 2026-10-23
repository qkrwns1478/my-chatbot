import fs from "fs";
import path from "path";

const DB_DIR = path.join(process.cwd(), "database");

// 데이터베이스 디렉토리가 없으면 생성
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

export interface User {
  id: string;
  email: string;
  password: string; // Hashed
}

export interface Persona {
  id: string;
  userId: string;
  name: string;
  imageUrl?: string;
  persona: string; // 성격, 배경 설정 등
  greeting: string;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface Chatroom {
  id: string;
  userId: string;
  personaId: string;
  messages: Message[];
  updatedAt: number;
}

export interface InteractionMessage {
  personaId: string; // Shows which persona spoke
  content: string;
  timestamp: number;
}

export interface InteractionRoom {
  id: string;
  userId: string;
  persona1Id: string;
  persona2Id: string;
  nextTurn: 'persona1' | 'persona2'; // Tracks whose turn it is to speak next (using string keys 'persona1' or 'persona2' to represent persona1Id or persona2Id)
  messages: InteractionMessage[];
  updatedAt: number;
}

const getFilePath = (filename: string) => path.join(DB_DIR, `${filename}.json`);

function readDB<T>(filename: string, defaultData: T): T {
  const filePath = getFilePath(filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  if (filename === "chatrooms") {
    return data.map((room: Record<string, unknown>) => {
      const { characterId, ...chatroom } = room;
      return { ...chatroom, personaId: room.personaId ?? characterId };
    }) as T;
  }
  if (filename === "interactions") {
    return data.map((room: Record<string, unknown>) => {
      const { character1Id, character2Id, ...interaction } = room;
      return {
        ...interaction,
        persona1Id: room.persona1Id ?? character1Id,
        persona2Id: room.persona2Id ?? character2Id,
        nextTurn:
          room.nextTurn === "char1"
            ? "persona1"
            : room.nextTurn === "char2"
              ? "persona2"
              : room.nextTurn,
        messages: Array.isArray(room.messages)
          ? room.messages.map((message: Record<string, unknown>) => {
              const { characterId, ...interactionMessage } = message;
              return {
                ...interactionMessage,
                personaId: message.personaId ?? characterId,
              };
            })
          : room.messages,
      };
    }) as T;
  }
  return data;
}

function writeDB<T>(filename: string, data: T) {
  const filePath = getFilePath(filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// persona CRUD
export const getPersonas = () => {
  const personaPath = getFilePath("personas");
  const legacyPath = getFilePath("characters");
  if (!fs.existsSync(personaPath) && fs.existsSync(legacyPath)) {
    fs.copyFileSync(legacyPath, personaPath);
  }
  return readDB<Persona[]>("personas", []);
};
export const savePersonas = (data: Persona[]) => writeDB("personas", data);

// Chatroom CRUD
export const getChatrooms = () => readDB<Chatroom[]>("chatrooms", []);
export const saveChatrooms = (data: Chatroom[]) => writeDB("chatrooms", data);

// InteractionRoom CRUD
export const getInteractionRooms = () => readDB<InteractionRoom[]>("interactions", []);
export const saveInteractionRooms = (data: InteractionRoom[]) => writeDB("interactions", data);

// User CRUD
export const getUsers = () => readDB<User[]>("users", []);
export const saveUsers = (data: User[]) => writeDB("users", data);

