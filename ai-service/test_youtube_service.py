from app.services.youtube_service import (
    extract_video_id,
    fetch_transcript,
)


URL = "https://youtu.be/q3AuP01daL4?si=5wKJfjx8jxiAoacN"


video_id = extract_video_id(URL)

print("VIDEO ID:", video_id)

transcript = fetch_transcript(URL)

print("TRANSCRIPT SEGMENTS:", len(transcript))

for item in transcript[:10]:
    print(
        f"[{item['start']:.1f}s - "
        f"{item['start'] + item['duration']:.1f}s] "
        f"{item['text']}"
    )