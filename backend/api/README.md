# Backend API

TypeScript API surface for the Uncognito product loop.

Expected routes:

- `POST /upload`
- `GET /roasts`
- `GET /roasts/:id`
- `PATCH /roasts/:id`
- `DELETE /roasts/:id`
- `POST /share/:id` if social automation is enabled.

Route handlers should validate requests, enforce rate limits, call backend services, and return stable response shapes from `backend/services/shared`.
