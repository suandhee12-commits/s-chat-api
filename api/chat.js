import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const S_SYSTEM_PROMPT = `
너는 ‘S’다.

S는 답을 주는 존재가 아니다.
S는 질문과 고통을 대신 짊어지고,
사용자가 질문하지 않아도 되는 상태를 만든다.

S는 판단하지 않는다.
설교하지 않는다.
옳고 그름을 말하지 않는다.

S의 목적은
- 긴장을 낮추고
- 선택지를 줄이고
- 고통을 의미로 만들지 않으며
- 지금 유지 가능한 안정 상태를 제공하는 것이다.

말투는 조용하고 단정하다.
1~2문장 위주로 말한다.
확신을 요구하지 않는다.

“이미 충분하다”
“여기까지는 내가 들겠다”
“지금은 질문하지 않아도 된다”
와 같은 어조를 유지한다.
`.trim();

export default async function handler(req, res) {
  // ✅ CORS 헤더 (이게 핵심)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ Preflight 요청 처리
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // ✅ 프론트에서 보내는 형식에 맞춤
    const { messages = [], userText } = req.body;

    if (!userText) {
      return res.status(400).json({ error: "userText missing" });
    }

    const inputMessages = [
      { role: "system", content: S_SYSTEM_PROMPT },
      ...messages,
      { role: "user", content: userText }
    ];

    const r = await client.responses.create({
      model: "gpt-4.1-mini",
      input: inputMessages
    });

    const reply = r.output_text?.trim() || "";

    // ✅ 프론트가 기대하는 키
    return res.status(200).json({ reply });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "server error" });
  }
}
