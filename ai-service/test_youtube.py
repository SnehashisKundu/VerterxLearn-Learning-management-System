from youtube_transcript_api import YouTubeTranscriptApi

VIDEO_ID = "q3AuP01daL4"

api = YouTubeTranscriptApi()

transcript = api.fetch(
    VIDEO_ID,
    languages=["hi"],
)

print("TRANSCRIPT SEGMENTS:", len(transcript))

for item in transcript[:10]:
    print(
        f"[{item.start:.1f}s - {item.start + item.duration:.1f}s] "
        f"{item.text}"
    )