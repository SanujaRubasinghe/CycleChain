import { NextResponse } from "next/server";
import { searchKnowledge } from "@/lib/searchKnowledge";

export async function POST(req) {
  const { message } = await req.json();

  const encoder = new TextEncoder();

  const results = await searchKnowledge(message, 3);

  const context = results.map((r) => `- ${r.text}`).join("\n");
  console.log(context);

  const prompt = `
  You are CycleChain's AI assistant.

  Rules:
  - Only answer questions using the information provided in the Knowledge Base.
  - If the knowledge base does not contain the answer, reply strictly with: "Sorry, I can't help you with that. Is there anything else that
    I can do for you?"
  - Keep answers short and specific (max 2 sentences).
  - Do not add disclaimers or extra information.
  - Never answer unrelated or general knowledge questions.

  Knowledge Base:
  ${context}

  User Question: ${message}
  `;

  const stream = new ReadableStream({
    async start(controller) {
      const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama3",
          prompt: prompt,
          stream: true,
        }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        try {
          const json = JSON.parse(chunk);
          if (json.response) {
            controller.enqueue(encoder.encode(json.response));
          }
        } catch {
          // ignore parsing errors for partial chunks
        }
      }

      controller.close();
    },
  });

  return new NextResponse(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
