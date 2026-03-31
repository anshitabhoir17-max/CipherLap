const MAX_BODY_SIZE = 15 * 1024 * 1024;

export async function POST(request) {
  if (!process.env.SIGHTENGINE_API_USER || !process.env.SIGHTENGINE_API_SECRET) {
    return Response.json(
      {
        error:
          "AI detection API is not configured. Set SIGHTENGINE_API_USER and SIGHTENGINE_API_SECRET in the Vercel project environment.",
      },
      { status: 501 },
    );
  }

  try {
    const bodyText = await request.text();
    if (bodyText.length > MAX_BODY_SIZE) {
      return Response.json({ error: "Request body is too large." }, { status: 413 });
    }

    const { filename, mimeType, base64 } = bodyText ? JSON.parse(bodyText) : {};
    if (!base64 || typeof base64 !== "string") {
      return Response.json({ error: "Missing image payload." }, { status: 400 });
    }

    const fileBuffer = Buffer.from(base64, "base64");
    const form = new FormData();
    form.append("models", "genai");
    form.append("api_user", process.env.SIGHTENGINE_API_USER);
    form.append("api_secret", process.env.SIGHTENGINE_API_SECRET);
    form.append(
      "media",
      new Blob([fileBuffer], { type: mimeType || "application/octet-stream" }),
      filename || "upload.jpg",
    );

    const apiResponse = await fetch("https://api.sightengine.com/1.0/check.json", {
      method: "POST",
      body: form,
    });

    const apiPayload = await apiResponse.json();
    if (!apiResponse.ok) {
      return Response.json(
        {
          error: apiPayload?.error?.message || "The upstream AI detection service returned an error.",
        },
        { status: 502 },
      );
    }

    const score = Number(apiPayload?.type?.ai_generated ?? 0);
    return Response.json({
      provider: "Sightengine",
      score: Number.isFinite(score) ? score : 0,
      raw: apiPayload,
    });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "The AI detection request failed.",
      },
      { status: 500 },
    );
  }
}
