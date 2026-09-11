from app.services.youtube_ingestion_service import ingest_youtube_lecture


URL = "https://youtu.be/q3AuP01daL4?si=5wKJfjx8jxiAoacN"

COURSE_ID = "e3cbdb44-c9fb-462b-91dc-7a7de82ac8bb"
LECTURE_ID = "af3fdfa5-2e04-425b-a34c-42047272a47a"


result = ingest_youtube_lecture(
    url=URL,
    course_id=COURSE_ID,
    lecture_id=LECTURE_ID,
)

print("\n--- INGESTION COMPLETE ---")
print("Course ID:", result["course_id"])
print("Lecture ID:", result["lecture_id"])
print("Transcript segments:", result["transcript_segments"])
print("Chunks created:", result["chunks_created"])