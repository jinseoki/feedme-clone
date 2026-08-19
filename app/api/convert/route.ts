import { NextResponse } from "next/server";

import { ConversionError, convertUrlToMarkdown } from "@/lib/feedme/convert";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const url = typeof body?.url === "string" ? body.url.trim() : "";

  if (!url) {
    return NextResponse.json({ error: "변환할 URL을 입력해 주세요." }, { status: 400 });
  }

  try {
    const result = await convertUrlToMarkdown(url);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ConversionError) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }
    return NextResponse.json(
      { error: "알 수 없는 오류로 변환에 실패했어요." },
      { status: 500 }
    );
  }
}
