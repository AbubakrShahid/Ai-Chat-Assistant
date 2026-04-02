import { NextResponse } from "next/server";
import OpenAI from "openai";
import { ChatRequest, ChatResponse, ChatErrorResponse } from "@/types/chat";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(
  request: Request
): Promise<NextResponse<ChatResponse | ChatErrorResponse>> {
  try {
    const body: ChatRequest = await request.json();
    const { prompt, history } = body;

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "Prompt is required and cannot be empty." },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "your_openai_api_key_here") {
      return NextResponse.json(
        { error: "OpenAI API key is not configured. Please set OPENAI_API_KEY in your .env.local file." },
        { status: 500 }
      );
    }

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: "You are a helpful AI assistant. Provide clear, concise, and accurate responses.",
      },
      ...history.map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
      {
        role: "user" as const,
        content: prompt,
      },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
      max_tokens: 1024,
      temperature: 0.7,
    });

    const responseMessage = completion.choices[0]?.message?.content;

    if (!responseMessage) {
      return NextResponse.json(
        { error: "No response received from OpenAI." },
        { status: 502 }
      );
    }

    return NextResponse.json({ message: responseMessage });
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      const statusCode = error.status ?? 500;
      return NextResponse.json(
        { error: `OpenAI API error: ${error.message}` },
        { status: statusCode }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 }
    );
  }
}
