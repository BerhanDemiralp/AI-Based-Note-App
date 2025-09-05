# ai_client.py
# Tek sorumluluk: OpenAI Responses API'ye (sync client) istek atmak.
# FastAPI tarafında async uyum için, çağrı asyncio.to_thread ile yapılmalı.

import os
import asyncio
from typing import Optional, Dict, Any
from google import genai
from dotenv import load_dotenv
load_dotenv()

_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

async def call_responses_api(
    system_prompt: str,
    content: str,
) -> str:
    if _client is None:
        raise RuntimeError("GEMINI_API_KEY yok veya Gemini SDK kurulu değil.")

    prompt = f"{system_prompt}\n\nCONTENT START\n{content}\nCONTENT END"

    response = _client.models.generate_content(
      model=MODEL,
      contents=[prompt]
    )

    return response.text
