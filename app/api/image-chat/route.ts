// app/api/image-chat/route.ts

import { NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';

export const runtime = 'edge';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { image, prompt = "What's in this image?" } = await req.json();

    if (!image) {
      return NextResponse.json(
        { error: 'Image is required' },
        { status: 400 }
      );
    }

    const chatCompletion = await groq.chat.completions.create({
      model: "meta-llama/llama-4-maverick-17b-128e-instruct",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: { url: image },
            },
          ],
        },
      ],
      temperature: 0.7,
      max_tokens: 1024,
      stream: true,
    });

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of chatCompletion) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              controller.enqueue(
                new TextEncoder().encode(`data: ${JSON.stringify({ content })}\n\n`)
              );
            }
          }
          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('Image chat error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process image chat' },
      { status: 500 }
    );
  }
}