# Copilot / Agent Instructions for minimal-demo ✅

## Quick summary
- Minimal FastAPI app that serves a tiny SPA and an in-memory activities API. The app is intentionally simple and primarily for demos/tests.
- Key files: `src/app.py` (API + data), `src/static/index.html`, `src/static/app.js` (frontend), `src/static/styles.css` (styling).

---

## Big picture / architecture 🔧
- Single FastAPI application (`app` object in `src/app.py`).
- Static frontend (vanilla JS) mounted at `/static` and the root (`/`) redirects to `/static/index.html`.
- Data is an in-memory Python dict `activities` in `src/app.py`. There is no persistence; restart clears data.
- Frontend and backend are tightly coupled by expected JSON shape (see "Data model" below).

---

## Developer workflows & commands ⚙️
- Create a venv and install deps:
  - `python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt`
- Run the server (preferred):
  - ` .venv/bin/uvicorn src.app:app --reload`
- Tests: there are no tests currently; `pytest` will run with `pythonpath = .` from `pytest.ini` if you add tests.
- Debugging: The README suggests VS Code debugging; the app runs as a standard FastAPI app so configure the debug target to `src.app:app` or run the uvicorn command.

> Note: `src/README.md` mentions `python app.py` but `src/app.py` doesn't contain a `if __name__ == '__main__'` runner. Use `uvicorn src.app:app` instead.

---

## Important project-specific conventions and patterns 📋
- Activities are keyed by **activity name** (e.g. `"Chess Club"`) in the `activities` dict. The activity name is the canonical identifier.
- Students are identified by **email address strings** (e.g. `michael@mergington.edu`).
- Frontend expects each activity object to have these keys: `description`, `schedule`, `max_participants`, `participants` (list of emails). Do not rename these fields without updating `src/static/app.js`.
- The frontend computes availability as `max_participants - participants.length`. The backend currently does NOT enforce max participants or de-duplicate signups — it simply appends the email to `participants`.

---

## API surface (examples) 🔍
- GET /activities
  - Returns the full `activities` dict. Example: `curl http://localhost:8000/activities`
- POST /activities/{activity_name}/signup?email=student@example.com
  - Signs up `email` for the activity named `activity_name` (path component). Example:
    - `curl -X POST "http://localhost:8000/activities/Chess%20Club/signup?email=new@mergington.edu"`
  - If `activity_name` is not found, server returns HTTP 404 with `detail: "Activity not found"`.
  - Successful signup returns JSON like `{ "message": "Signed up ..." }` with status 200.

---

## Implementation notes & gotchas ⚠️
- Because activity names are used as dictionary keys and are human-readable strings containing spaces, URL-encoding/decoding occurs (the frontend uses `encodeURIComponent`). Ensure exact name matching.
- No persistence: any change to `activities` is ephemeral. For long-running changes add a persistence layer (DB or file) and update both API and frontend expectations.
- No input validation beyond existence of the activity. Email format is not validated by the backend.
- If adding new endpoints, mirror the lightweight, explicit style used in `src/app.py` and update `src/static/app.js` if the frontend consumes new fields.

---

## Where to change behavior (quick guides) 🔧
- Seed or change activities: edit `activities` in `src/app.py`.
- Add validation / business rules (e.g., enforce `max_participants`): change `signup_for_activity()` in `src/app.py` and add tests.
- Change the UI/UX: edit files under `src/static/` (`index.html`, `app.js`, `styles.css`). The app relies on specific keys in the activity objects.

---

## Tests & CI notes 🧪
- No tests currently exist. Add tests under a `tests/` directory and run via `pytest`.
- `pytest.ini` sets `pythonpath = .`, so tests can import modules from `src` directly (e.g., `from src.app import app, activities`).

---

## Extra guidance for AI agents 🤖
- Prefer minimal, easily-reviewable changes: this is a tiny demo repo.
- When modifying API contracts, update `src/static/app.js` and `src/README.md` to keep documentation and front-end in sync.
- Add unit tests for any behavioral changes (especially signup rules, validation, or any persistence layer).

---

If anything here is unclear or you'd like additional detail for a particular workflow (tests, debugging, or how to add persistence), tell me which section to expand and I will update this file. 👋