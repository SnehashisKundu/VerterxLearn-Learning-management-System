from urllib.parse import urlparse, parse_qs

from youtube_transcript_api import YouTubeTranscriptApi


def extract_video_id(url: str) -> str:
    """
    Extract YouTube video ID from common YouTube URL formats.
    """

    if not url.strip():
        raise ValueError("YouTube URL cannot be empty")

    parsed = urlparse(url)

    # https://www.youtube.com/watch?v=VIDEO_ID
    if parsed.hostname in {"youtube.com", "www.youtube.com"}:
        video_id = parse_qs(parsed.query).get("v", [None])[0]

        if video_id:
            return video_id

    # https://youtu.be/VIDEO_ID
    if parsed.hostname == "youtu.be":
        video_id = parsed.path.strip("/")

        if video_id:
            return video_id

    raise ValueError("Invalid YouTube URL")


def fetch_transcript(url: str) -> list[dict]:
    """
    Fetch the best available YouTube transcript.

    We intentionally do not hardcode a language.
    YouTube may provide manually created or auto-generated
    transcripts in different languages.
    """

    video_id = extract_video_id(url)

    api = YouTubeTranscriptApi()

    transcript_list = api.list(video_id)

    # Prefer manually created transcripts.
    for transcript in transcript_list:
        if not transcript.is_generated:
            fetched = transcript.fetch()

            return [
                {
                    "text": item.text,
                    "start": float(item.start),
                    "duration": float(item.duration),
                }
                for item in fetched
            ]

    # Fall back to auto-generated transcript.
    for transcript in transcript_list:
        if transcript.is_generated:
            fetched = transcript.fetch()

            return [
                {
                    "text": item.text,
                    "start": float(item.start),
                    "duration": float(item.duration),
                }
                for item in fetched
            ]

    raise RuntimeError("No transcript available for this video")