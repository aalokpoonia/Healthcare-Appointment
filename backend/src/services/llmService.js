const OpenAI = require('openai');

const client = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
}) : null;

async function askLLM(prompt, type = 'general') {
  if (!client) {
    return {
      status: 'fallback',
      message: 'Summary unavailable — please review notes manually.',
      fallback: true,
    };
  }

  try {
    const response = await client.chat.completions.create({
      model: 'gemini-2.0-flash',
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'Return valid JSON only and nothing else.' },
        { role: 'user', content: prompt },
      ],
    });

    const content = response.choices[0]?.message?.content || '{}';
    return { status: 'ok', data: JSON.parse(content), fallback: false };
  } catch (error) {
    return {
      status: 'fallback',
      message: 'Summary unavailable — please review notes manually.',
      fallback: true,
      error: error.message,
    };
  }
}

module.exports = { askLLM };