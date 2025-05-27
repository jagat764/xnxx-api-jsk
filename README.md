# xnxx-api-jsk API (Cloudflare Workers)

This is a serverless API built with Cloudflare Workers to scrape video search results and video URLs from XNXX. It provides two main endpoints: one for searching videos by query and page, and another for extracting the direct video URL from a video page.

**Note**: Scraping websites may violate their terms of service or local laws. Ensure you have permission or legal clearance before using this API.

## Features

- **Search Endpoint**: Retrieve video metadata (title, URL, thumbnail, views, rating, duration, quality) based on a search query and page number.
- **Video URL Endpoint**: Extract the direct video URL from a specific XNXX video page.
- **CORS Support**: Accessible from any origin with proper CORS headers.
- **Deployed on Cloudflare Workers**: Fast, serverless, and scalable.

## Endpoints

1. **Root (`/`)**:
   - **Method**: GET
   - **Response**: Text message indicating the API is running.
   - **Example**: `https://your-worker.workers.dev/`
   - **Response**: `API is running! \n\n Api by:- Jsk`

2. **Search (`/api/search?q=<query>&page=<page>`)**:
   - **Method**: GET
   - **Parameters**:
     - `q`: Search query (required).
     - `page`: Page number (optional, defaults to 1).
   - **Response**: JSON array of video objects with `title`, `url`, `thumbnail`, `views`, `rating`, `duration`, and `quality`.
   - **Example**: `https://your-worker.workers.dev/api/search?q=test&page=1`
   - **Sample Response**:
     ```json
     [
       {
         "title": "1.2M 95% 10min - 720p",
         "url": "https://www.xnxx.com/video-abc123/title",
         "thumbnail": "https://img.example.com/thumb.jpg",
         "views": "1.2M",
         "rating": "95%",
         "duration": "10min",
         "quality": "720p"
       }
     ]
     ```

3. **Video URL (`/api/video?url=<video_page_url>`)**:
   - **Method**: GET
   - **Parameters**:
     - `url`: XNXX video page URL (required).
   - **Response**: JSON object with the direct video URL or an error.
   - **Example**: `https://your-worker.workers.dev/api/video?url=https://www.xnxx.com/video-abc123`
   - **Sample Response**:
     ```json
     { "url": "https://cdn.example.com/video.mp4" }
     ```

## Prerequisites

- A [Cloudflare account](https://dash.cloudflare.com) with Workers access.
- A [GitHub account](https://github.com) for hosting the repository.
- Node.js and npm installed locally (for testing or manual deployment).
- Cloudflare Wrangler CLI (`npm install -g @cloudflare/wrangler`).

## Setup

### 1. Clone the Repository

```bash
git clone https://github.com/jagat764/xnxx-api-jsk.git
cd xnxx-scraper
 
#### NOTE 

- Dear Web Owner, If You Have Any Problem Please Contact Me. I'll Delete This Repository immediately.
- Thanks For Your Understanding.
