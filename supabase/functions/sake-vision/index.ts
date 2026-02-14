import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "ANTHROPIC_API_KEY가 설정되지 않았습니다." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { image } = await req.json();
    if (!image) {
      return new Response(
        JSON.stringify({ error: "이미지 데이터가 필요합니다." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // base64 데이터 URL에서 실제 base64와 media type 추출
    let base64Data = image;
    let mediaType = "image/jpeg";
    const dataUrlMatch = image.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    if (dataUrlMatch) {
      mediaType = dataUrlMatch[1];
      base64Data = dataUrlMatch[2];
    }

    // Claude API 호출
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-opus-4-6",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mediaType,
                  data: base64Data,
                },
              },
              {
                type: "text",
                text: `당신은 일본 사케(日本酒) 라벨 OCR 전문가입니다.

## 절대 규칙
- 라벨에 실제로 보이는 글자만 읽으세요. 절대 추측하거나 유명 브랜드명으로 대체하지 마세요.
- 한자를 한 글자씩 정확히 읽으세요. 비슷한 한자를 혼동하지 마세요.
- 확실하지 않은 글자는 빈 문자열로 남기세요.

## 읽기 팁
- 사진이 90도/180도/270도 회전되어 있을 수 있습니다. 네 방향 모두 시도하세요.
- 세로쓰기(縦書き): 오른쪽에서 왼쪽으로, 위에서 아래로 읽습니다.
- 브랜드명은 보통 라벨에서 가장 큰 글씨입니다.
- 등급(純米大吟醸 등)은 브랜드명보다 작은 글씨로 쓰여 있습니다.
- 뒷면 라벨에 정미율, 원료, 양조장 정보가 있을 수 있습니다.

## 출력 형식 (JSON만 출력, 다른 텍스트 금지)
{
  "brand": "라벨에서 가장 큰 글씨로 쓰인 브랜드명 (한자 원문 그대로)",
  "product": "브랜드명 + 제품명 전체 (일본어 원문 그대로)",
  "grade": "純米大吟醸, 大吟醸, 純米吟醸, 吟醸, 特別純米, 純米, 特別本醸造, 本醸造 중 해당하는 것",
  "polishRate": "정미율 (예: 50%)",
  "rawText": "라벨에서 읽을 수 있는 모든 글자를 순서대로 나열"
}`,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Claude API error:", response.status, errorBody);
      return new Response(
        JSON.stringify({ error: `Claude API 오류 (${response.status})` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const claudeResult = await response.json();
    const textContent = claudeResult.content?.find(
      (c: { type: string }) => c.type === "text"
    );
    if (!textContent) {
      return new Response(
        JSON.stringify({ error: "Claude로부터 응답을 받지 못했습니다." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Claude 응답에서 JSON 추출
    let parsedResult;
    try {
      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("JSON not found in response");
      }
    } catch {
      // JSON 파싱 실패 시 원본 텍스트 반환
      parsedResult = {
        brand: "",
        product: "",
        grade: "",
        polishRate: "",
        rawText: textContent.text,
      };
    }

    return new Response(JSON.stringify(parsedResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({ error: "서버 오류가 발생했습니다: " + (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
