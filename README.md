# Neon Persona Chat

A modern chatbot application built with [Next.js](https://nextjs.org), designed for interactive persona conversations.

## Features

- **Persona Interaction**: Engage in rich, conversational interactions with AI personas.
- **Image Uploads**: Share and upload images within the chat context.
- **User Authentication**: Secure login and registration flows.
- **Responsive UI**: Optimized chat window sizing and clear placeholders.

## Tech Stacks

![Next.js](https://img.shields.io/badge/next.js-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?logo=react&logoColor=%2361DAFB)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?&logo=typescript&logoColor=white)
![Groq](https://img.shields.io/badge/Groq-F55036?logoColor=white)

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

Create a `.env.local` file in the project root and add your Groq API key:

```dotenv
GROQ_API_KEY=your_groq_api_key
```

Get a key from [Groq Console](https://console.groq.com/keys). The key is used only by the server-side chat API routes. Do not prefix it with `NEXT_PUBLIC_` or commit it to Git.

Both persona chats and persona-to-persona interactions support these Groq models:

- `qwen/qwen3.8-27b` (default)
- `openai/gpt-oss-120b`
- `openai/gpt-oss-20b`

The previous `OPENROUTER_API_KEY` setting is no longer used.

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `app/` - Next.js App Router pages and layouts
- `components/` - Reusable UI components
- `lib/` - Utility functions
- `database/` - Database configurations and queries
