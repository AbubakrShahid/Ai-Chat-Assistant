import { NextResponse } from "next/server";
import OpenAI from "openai";

interface TitleRequest {
  message: string;
}

interface TitleResponse {
  title: string;
}

interface TitleErrorResponse {
  error: string;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(
  request: Request
): Promise<NextResponse<TitleResponse | TitleErrorResponse>> {
  try {
    const body: TitleRequest = await request.json();

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "your_openai_api_key_here") {
      return NextResponse.json({ title: body.message.slice(0, 40) });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Generate a short, descriptive title (max 6 words) for this conversation based on the user's first message. Return only the title, no quotes or punctuation at the end.",
        },
        { role: "user", content: body.message },
      ],
      max_tokens: 20,
      temperature: 0.7,
    });

    const title =
      completion.choices[0]?.message?.content?.trim() ||
      body.message.slice(0, 40);

    return NextResponse.json({ title });
  } catch {
    return NextResponse.json({ title: "New Chat" });
  }
}
