// app/api/function-calling/route.ts
import { config } from '@/app/config';

export async function POST(req: Request) {
  try {
    // Временно отключаем function calling, чтобы чат не падал
    // (позже можно будет вернуть нормальную логику)
    return Response.json({
      type: null,
      data: null
    }, { status: 200 });

    // === Ниже закомментированный старый код (пока не трогаем) ===
    /*
    const body = await req.json();
    const contextMessages = body.message;

    const client = new OpenAI({
      apiKey: config.fcAPI_KEY,
      baseURL: config.fcBaseURL,
    });

    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [...],
      tools: functions,
      tool_choice: "auto"
    });

    // ... остальной код
    */
  } catch (error) {
    console.error('Function calling error:', error);
    return Response.json(
      { type: null, data: null, error: 'Function calling failed' },
      { status: 200 }
    );
  }
}