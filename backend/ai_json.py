# ai_json.py
# Model çıktısından güvenli şekilde JSON dizi/parçası ayıklama yardımcıları.

from __future__ import annotations
import json
import re
from typing import List, Optional, Sequence, Any

_CODE_FENCE_RE = re.compile(r"^```(?:json)?\s*|\s*```$", flags=re.I | re.M | re.S)

def _dedupe_keep_order(items: Sequence[str]) -> List[str]:
    seen = set()
    out: List[str] = []
    for s in items:
        s = " ".join(str(s).split()).strip(" \t\r\n-:;,.")
        if not s or s in seen:
            continue
        out.append(s)
        seen.add(s)
    return out

def strip_code_fences(text: str) -> str:
    """```json ... ``` gibi code fence'leri temizler."""
    if not text:
        return ""
    return _CODE_FENCE_RE.sub("", text).strip()

def extract_json_block(text: str) -> Optional[str]:
    """
    Metin içinde geçen ilk geçerli JSON dizisi/objesini yakalamayı dener.
    Önce dizi [...], olmazsa obje {...}.
    """
    if not text:
        return None
    t = strip_code_fences(text)

    m = re.search(r"\[[\s\S]*\]", t)
    if m:
        return m.group(0)

    m = re.search(r"\{[\s\S]*\}", t)
    if m:
        return m.group(0)

    return None

def _normalize_strings(items: Sequence[Any], max_len: Optional[int]) -> List[str]:
    out: List[str] = []
    for x in items:
        s = str(x)
        if max_len is not None:
            s = s[:max_len]
        out.append(s)
    return _dedupe_keep_order(out)

def parse_json_array_of_strings(
    raw_text: str,
    *,
    max_len: Optional[int] = None,
    fallback_lines: bool = True,
) -> List[str]:
    """
    Çeşitli olası model çıktılarından "string listesi" üretir.

    Kabul edilen biçimler:
      - Doğrudan JSON dizi: ["a", "b", ...]
      - JSON obje içinde liste: {"titles":[...]} / {"suggestions":[...]} / {"items":[...]} / {"results":[...]}
      - Metin içinde gömülü JSON (code fence'li veya düz)
      - (Opsiyon) JSON çıkmadıysa satır satır bölerek fallback

    Dönüş: normalize edilmiş, tekilleştirilmiş string listesi.
    """
    if not raw_text:
        return []

    text = strip_code_fences(raw_text)

    # 1) Direkt JSON parse
    try:
        data = json.loads(text)
        if isinstance(data, list):
            return _normalize_strings(data, max_len)
        if isinstance(data, dict):
            for key in ("titles", "suggestions", "items", "results"):
                if key in data and isinstance(data[key], list):
                    return _normalize_strings(data[key], max_len)
    except Exception:
        pass

    # 2) Gömülü JSON bloğunu ayıkla
    block = extract_json_block(text)
    if block:
        try:
            data = json.loads(block)
            if isinstance(data, list):
                return _normalize_strings(data, max_len)
            if isinstance(data, dict):
                for key in ("titles", "suggestions", "items", "results"):
                    if key in data and isinstance(data[key], list):
                        return _normalize_strings(data[key], max_len)
        except Exception:
            pass

    # 3) Fallback: satır satır
    if fallback_lines:
        lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
        return _normalize_strings(lines, max_len)

    return []
