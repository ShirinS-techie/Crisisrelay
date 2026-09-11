import { NextRequest, NextResponse } from "next/server";

// Runs on the server so the API key never reaches the browser.
export const runtime = "nodejs";

// gemini-2.0-flash was retired. Gemini 3.6 Flash is the current
// generally-available flash model as of this writing — check
// https://ai.google.dev/gemini-api/docs/models for the latest if this
// starts 404ing again.
const GEMINI_MODEL = "gemini-3.6-flash";

interface RawScanResponse {
  score: number;
  tags: string[];
  reasoning?: string;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Server is missing GEMINI_API_KEY. Add it to .env.local (see README) and restart `npm run dev`.",
      },
      { status: 500 }
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Malformed upload." }, { status: 400 });
  }

  const file = form.get("photo");
  const kind = String(form.get("kind") ?? "rescue");
  const urgency = String(form.get("urgency") ?? "medium");
  const note = String(form.get("note") ?? "");

  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: "No photo uploaded." }, { status: 400 });
  }
  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json({ error: "Photo is too large (max 8MB)." }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const mimeType = file.type || "image/jpeg";

  const prompt = `You are a disaster-response triage assistant reviewing a photo submitted with an SOS request.
Reported category: ${kind}
Self-reported urgency: ${urgency}
Reporter's note: ${note || "(none)"}

Look closely at what is actually visible in the photo (structural damage, visible injuries, flooding depth, fire or smoke, overcrowding, exposed hazards, etc). Base your assessment primarily on visible evidence in the image, not just the self-reported category or urgency — they may be wrong or exaggerated. If the photo shows nothing hazardous, say so and score it low.`;

  const geminiBody = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }, { inline_data: { mime_type: mimeType, data: base64 } }],
      },
    ],
    generationConfig: {
      responseFormat: {
        text: {
          mimeType: "application/json",
          schema: {
            type: "object",
            properties: {
              score: {
                type: "integer",
                minimum: 1,
                maximum: 10,
                description:
                  "Severity/urgency score from 1 (minor, no visible hazard) to 10 (life-threatening), based on what is visible in the photo.",
              },
              tags: {
                type: "array",
                items: { type: "string" },
                minItems: 2,
                maxItems: 4,
                description:
                  "2-4 short tags (2-4 words each) naming specific hazards or conditions actually visible in the photo, e.g. 'Structural Collapse', 'Visible Injury', 'Rising Floodwater'.",
              },
              reasoning: {
                type: "string",
                description: "One sentence explaining the score, referencing specifically what is visible in the photo.",
              },
            },
            required: ["score", "tags", "reasoning"],
          },
        },
      },
    },
  };

  let geminiRes: Response;
  try {
    geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify(geminiBody),
      }
    );
  } catch {
    return NextResponse.json({ error: "Could not reach the vision model API." }, { status: 502 });
  }

  if (!geminiRes.ok) {
    const errText = await geminiRes.text().catch(() => "");
    return NextResponse.json(
      { error: `Vision model API error (${geminiRes.status}): ${errText.slice(0, 300)}` },
      { status: 502 }
    );
  }

  const data = await geminiRes.json();
  const textPart: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!textPart) {
    return NextResponse.json({ error: "Model returned no usable response." }, { status: 502 });
  }

  let parsed: RawScanResponse;
  try {
    parsed = JSON.parse(textPart);
  } catch {
    return NextResponse.json({ error: "Could not parse model output as JSON." }, { status: 502 });
  }

  const score = Math.min(10, Math.max(1, Math.round(Number(parsed.score))));
  const tags = Array.isArray(parsed.tags)
    ? Array.from(new Set(parsed.tags.filter((t) => typeof t === "string" && t.trim()))).slice(0, 4)
    : [];

  if (!Number.isFinite(score)) {
    return NextResponse.json({ error: "Model returned an invalid score." }, { status: 502 });
  }

  return NextResponse.json({ score, tags, reasoning: parsed.reasoning ?? "" });
}
