def build_rag_context(chunks: list[dict]) -> str:
    if not chunks:
        return ""

    context_parts = []

    for chunk in chunks:
        start = chunk.get("start_seconds")
        end = chunk.get("end_seconds")
        content = chunk.get("content", "").strip()

        if not content:
            continue

        if start is not None and end is not None:
            timestamp = f"[{start}s - {end}s]"
        elif start is not None:
            timestamp = f"[{start}s]"
        else:
            timestamp = "[Timestamp unavailable]"

        context_parts.append(
            f"{timestamp}\n{content}"
        )

    return "\n\n".join(context_parts)