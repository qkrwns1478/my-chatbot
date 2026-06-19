import fs from "fs";
import path from "path";

const DB_DIR = path.join(process.cwd(), "database");

// 데이터베이스 디렉토리가 없으면 생성
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

export interface Character {
  id: string;
  name: string;
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
  characterId: string;
  messages: Message[];
  updatedAt: number;
}

const getFilePath = (filename: string) => path.join(DB_DIR, `${filename}.json`);

function readDB<T>(filename: string, defaultData: T): T {
  const filePath = getFilePath(filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function writeDB<T>(filename: string, data: T) {
  const filePath = getFilePath(filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Character CRUD
export const getCharacters = () => readDB<Character[]>("characters", []);
export const saveCharacters = (data: Character[]) => writeDB("characters", data);

// Chatroom CRUD
export const getChatrooms = () => readDB<Chatroom[]>("chatrooms", []);
export const saveChatrooms = (data: Chatroom[]) => writeDB("chatrooms", data);
