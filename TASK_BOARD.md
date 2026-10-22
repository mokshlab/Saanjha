# Saanjha Task Board

Public-safe project tracking for the evaluator demo. Do not add credentials, private academic notes, API keys, or personal contact information here.

## Statuses

- `BACKLOG` - understood but not started.
- `IN PROGRESS` - one teammate is actively working on it.
- `REVIEW` - implementation exists and needs another teammate to verify it.
- `HUMAN VERIFICATION PENDING` - automated checks pass, but the owning teammate must manually test the real workflow.
- `DONE` - tested and ready to demonstrate.
- `BLOCKED` - needs a decision or external dependency.

## Working Areas

| ID | Area | Owner | Current focus |
|---|---|---|---|
| UI-01 | Frontend and UX | N | Auth screens, listing form, browse/search, responsive evaluator flow |
| API-01 | Backend and data | M | Reservation correctness, expiry, handover, notifications |
| EXP-01 | Experiments and integration | H | Tests, concurrency experiment, search experiment, demo evidence |

## Current Backlog

| ID | Task | Area | Status | Acceptance check |
|---|---|---|---|---|
| AUTH-01 | Build student registration/login/OTP screens | UI/API | BACKLOG | Campus email validation and OTP flow work end to end |
| LIST-01 | Build listing creation and edit form | UI | BACKLOG | At least two images, categories, books fields, and zero price work |
| LIST-03 | Add listing edit approval rules | API | REVIEW | Sensitive edits leave discovery until admin approval |
| LIST-02 | Add Cloudinary backend media upload | API | BACKLOG | Backend validates and stores accepted media safely |
| MOD-01 | Build admin moderation screen | UI/API | BACKLOG | Admin can approve/reject and see pending listings |
| RES-01 | Design Reservation and ItemJourney models | API | REVIEW | Schema supports one active reservation, expiry, and history |
| RES-02 | Implement atomic first-come-first-served reservation | API | REVIEW | Concurrent attempts produce at most one winner |
| RES-03 | Add expiry and cancellation notifications | API | REVIEW | Expired/cancelled listing reopens and buyer is notified |
| HAND-01 | Add buyer code and seller confirmation | API/UI | REVIEW | Successful code entry marks listing sold and records handover |
| TEST-01 | Add core reservation tests | EXP | REVIEW | Core listing, reservation, and handover invariants are tested |
| EXP-01 | Run reservation concurrency experiment | EXP | BACKLOG | Raw results and limitations are recorded |
| EXP-02 | Add campus-word search comparison | EXP | BACKLOG | Held-out queries produce transparent metrics |
| WANT-01 | Build Wanted Board | UI/API | BACKLOG | Only start after reservation flow is reliable |
| DEMO-01 | Prepare five-day evaluator demo script | EXP | BACKLOG | Register/list/approve/search/reserve/handover path is rehearsed |

## Team Rules

- One active task per person at a time.
- Keep tasks small enough to finish in one working session where possible.
- Update status before starting and after verification.
- Every completed task must state the proving command or manual check in its pull request or issue.
- Multi-file and user-facing features must remain `HUMAN VERIFICATION PENDING` until the owning teammate confirms the real workflow.
- Do not mark a backend route `DONE` until the connected user workflow is verified.
- Keep the current demo path more important than optional polish.
- M, N, and H may work on any area when coordinated; the named owner remains responsible for final integration and verification.

## Mid-term Delivery Rules

- AI reports each teammate's milestone with task IDs, changed files, proving commands, manual checks, and remaining gaps.
- A feature stays `REVIEW` or `HUMAN VERIFICATION PENDING` until the owner confirms the connected workflow. AI must not claim teammate satisfaction.
- Keep commits small and truthful. Push a verified milestone soon after it is complete instead of combining many days of work or inventing dates.
- Before a push, review the staged file list and exclude secrets, `.local/`, dependencies, builds, uploads, and unrelated pending work.
- Every feature demo must state the expected user result, run its narrowest automated check, run the real workflow where possible, and record pass/fail/blocker evidence.

## Four-day Mid-term Plan

| Date | M - Backend/Data | N - Frontend/UX | H - Tests/Integration |
|---|---|---|---|
| 22 Oct | Stabilize auth, listing, reservation, expiry, and handover contracts. | Start auth and listing screens around the current browse shell. | Prepare clean demo data, API smoke checks, and a blocker list. |
| 23 Oct | Finish data consistency, edit approval, notifications, and privacy rules. | Complete the smallest login, listing, reservation, and handover states. | Run register/list/approve/search/reserve checks and record failures. |
| 24 Oct | Fix connected-workflow defects only and avoid optional architecture. | Add admin moderation and the minimum activity view. | Run the full evaluator path and verify mobile/desktop basics. |
| 25 Oct | Freeze backend behavior and review demo configuration. | Polish the evaluator path and remove misleading placeholders. | Rehearse the five-minute demo and prepare evidence for the report. |

Defer Cloudinary, Wanted Board, and search experiments if the core evaluator path is unstable.
