# ai_client.py
# Tek sorumluluk: OpenAI Responses API'ye (sync client) istek atmak.
# FastAPI tarafında async uyum için, çağrı asyncio.to_thread ile yapılmalı.

import os
import asyncio
from typing import Optional, Dict, Any
from openai import OpenAI

_CLIENT: Optional[OpenAI] = None

def get_client() -> Optional[OpenAI]:
    """Lazy-init OpenAI sync client. OPENAI_API_KEY yoksa None döner."""
    global _CLIENT
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return None
    if _CLIENT is None:
        _CLIENT = OpenAI(api_key=api_key)
    return _CLIENT

DEFAULT_MODEL = os.getenv("AI_MODEL", "gpt-5")
DEFAULT_MAX_TOKENS = int(os.getenv("AI_MAX_TOKENS", "200"))
DEFAULT_TEMPERATURE = float(os.getenv("AI_TEMPERATURE", "0.7"))

async def call_responses_api(
    *,
    system_prompt: str,
    content: str,
    model: Optional[str] = None,
    max_tokens: Optional[int] = None,
    temperature: Optional[float] = None,
    extra_create_kwargs: Optional[Dict[str, Any]] = None,
) -> str:
    """
    Responses API'ye tek 'input' string'iyle istek atar ve düz metin döner.
    Kullanım: raw_text = await call_responses_api(system_prompt=..., content=...)
    """
    client = get_client()
    if client is None:
        raise RuntimeError("OPENAI_API_KEY yok veya OpenAI SDK kurulu değil.")

    prompt = f"{system_prompt}\n\nCONTENT START\n{content}\nCONTENT END"

    def _call() -> str:
        kwargs = dict(
            model=(model or DEFAULT_MODEL),
            input=prompt,
            max_tokens=(DEFAULT_MAX_TOKENS if max_tokens is None else max_tokens),
            temperature=(DEFAULT_TEMPERATURE if temperature is None else temperature),
        )
        if extra_create_kwargs:
            kwargs.update(extra_create_kwargs)
        resp = client.responses.create(**kwargs)
        return (resp.output_text or "").strip()

    return await asyncio.to_thread(_call)
