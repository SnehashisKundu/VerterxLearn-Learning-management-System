def chunk_transcript(
    transcript: list[dict],
    chunk_duration: int = 120,
) -> list[dict]:
    if not transcript:
        return []

    if chunk_duration <= 0:
        raise ValueError("chunk_duration must be greater than 0")

    chunks = []

    current_text: list[str] = []
    chunk_start: float | None = None
    chunk_end: float | None = None
    chunk_index = 0

    for item in transcript:
        text = item["text"].strip()

        if not text:
            continue

        start = float(item["start"])
        end = start + float(item["duration"])

        if chunk_start is None:
            chunk_start = start

        current_text.append(text)

        if chunk_end is None or end > chunk_end:
            chunk_end = end

        if chunk_end - chunk_start >= chunk_duration:
            chunks.append(
                {
                    "chunk_index": chunk_index,
                    "content": " ".join(current_text),
                    "start_seconds": int(chunk_start),
                    "end_seconds": int(chunk_end),
                }
            )

            chunk_index += 1
            current_text = []
            chunk_start = None
            chunk_end = None

    # Add remaining transcript
    if current_text and chunk_start is not None and chunk_end is not None:
        chunks.append(
            {
                "chunk_index": chunk_index,
                "content": " ".join(current_text),
                "start_seconds": int(chunk_start),
                "end_seconds": int(chunk_end),
            }
        )

    return chunks