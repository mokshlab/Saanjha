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
| API-01 | Backend and data | M | Backend, data, connected workflow integration, and final evaluator readiness |
| EXP-01 | Experiments and integration | H | Tests, concurrency experiment, search experiment, demo evidence |

## M Contribution Record

This record describes the work merged from **M** and the latest local implementation staged for the next push. User-facing features remain subject to human verification.

### Authentication and account safety

- Implemented campus-domain registration validation.
- Implemented password rules requiring at least eight characters, a letter, and a number.
- Implemented four-digit OTP generation, hashing, expiry, terminal development fallback, and OTP resend handling.
- Implemented JWT login, OTP verification, logout/session handling, invalid-payload handling, and duplicate-registration handling.
- Added login, registration, and OTP rate limiting.
- Added a five-attempt OTP verification limit.
- Added production checks for required JWT and administrator configuration.
- Removed the default production administrator password fallback.

### Listing and media backend

- Implemented authenticated listing creation and editing.
- Enforced at least two accepted images and non-negative prices, including free listings priced at zero.
- Added safe JSON validation for book details and tags.
- Integrated Multer image validation and local storage.
- Integrated optional Cloudinary image storage with local fallback.
- Implemented sensitive listing-edit approval rules.
- Implemented protected seller deletion and admin listing management.
- Added safe admin approval/rejection state transitions.

### Reservation and handover system

- Implemented Reservation and ItemJourney data models and active-reservation indexes.
- Implemented atomic reservation creation and one-active-reservation enforcement.
- Added MongoDB transaction protection for reservation creation, cancellation, expiry, and handover.
- Implemented expiry release, cancellation release, notifications, and item history events.
- Implemented hashed four-digit handover codes and seller-only handover confirmation.
- Added seller active-reservation retrieval for the My Listings handover flow.
- Added frontend reservation creation, cancellation, reservation status, expiry, notifications, and handover integration.
- Added participant-only pickup/contact privacy locally: public listing responses show only a general area; active participants receive exact pickup and the other participant's contact; historical access is redacted.
- Added a temporary five-minute reservation option for manual expiry testing.
- Seller handover cards now display the active buyer's contact email.

### Verification and evaluator support

- Added HTTP integration tests for reservation, cancellation, expiry, notification, duplicate protection, handover, and OTP limits.
- Added transaction rollback testing.
- Added privacy and reservation-activity integration tests.
- Repeatedly validated backend tests, backend syntax, frontend lint, frontend production builds, and diff checks.
- Updated the project README, task board, and AI project context with final-phase priorities and contribution evidence.

### Current contribution evidence

- Backend automated suite currently passes **17/17 tests**.
- Frontend lint and production build currently pass.
- Manual verification on 14 November 2026 passed public privacy, reservation creation, buyer access, seller access, seller activity, cancellation privacy, five-minute expiry, expiry notification visibility, handover, unauthorized access, admin approval, admin rejection, the complete evaluator workflow, and the final backend security review.
- Cloudinary code is integrated, but a real credential-backed upload remains to be verified.

## Current Backlog

| ID | Task | Area | Status | Acceptance check |
|---|---|---|---|---|
| AUTH-01 | Build student registration/login/OTP screens | UI/API | HUMAN VERIFICATION PENDING | Backend registration, campus email validation, 8-character password policy, four-digit OTP, JWT session, and logout are connected |
| LIST-01 | Build listing creation and edit form | UI | HUMAN VERIFICATION PENDING | Authenticated submission accepts at least two images, categories, condition, and zero price |
| LIST-03 | Add listing edit approval rules | API | REVIEW | Sensitive edits leave discovery until admin approval |
| LIST-02 | Add Cloudinary backend media upload | API | REVIEW | Configured Cloudinary stores accepted media; blank credentials use the local fallback |
| MOD-01 | Build admin moderation screen | UI/API | HUMAN VERIFICATION PENDING | Admin can load pending listings and approve/reject them through the API |
| RES-01 | Design Reservation and ItemJourney models | API | REVIEW | Schema supports one active reservation, expiry, and history |
| RES-02 | Implement atomic first-come-first-served reservation | API | REVIEW | Concurrent attempts produce at most one winner |
| RES-03 | Add expiry and cancellation notifications | API/UI | HUMAN VERIFICATION PENDING | Backend expiry/cancellation notifications are surfaced in My Reservations and refreshed automatically |
| HAND-01 | Add buyer code and seller confirmation | API/UI | HUMAN VERIFICATION PENDING | Seller enters the buyer's code through My Listings; successful entry marks listing sold and records handover |
| TEST-01 | Add core reservation tests | EXP | REVIEW | Core listing, reservation, handover, expiry, and transaction rollback invariants are tested |
| EXP-01 | Run reservation concurrency experiment | EXP | REVIEW | Runner reports raw status counts and winner count for supplied tokens |
| EXP-02 | Add campus-word search comparison | EXP | BACKLOG | Held-out queries produce transparent metrics |
| WANT-01 | Build Wanted Board | UI/API | BACKLOG | Only start after reservation flow is reliable |
| DEMO-01 | Prepare five-day evaluator demo script | EXP | HUMAN VERIFICATION PENDING | Register/list/approve/search/reserve/handover path is rehearsed |

## Final-Phase M Priority

The mid-term phase is complete. M should now focus on feature completion for the final working-project evaluation, not broad refactoring or optimization.

| Priority | M task | Status | Definition of done |
|---|---|---|---|
| P0 | Complete the real reservation evaluator workflow | DONE | Two student accounts and one admin completed registration, listing approval, reservation, cancellation, five-minute expiry, notification, handover, and sold-state checks |
| P0 | Verify private pickup and contact visibility | DONE | Public, buyer, seller, cancelled, and expired account checks passed manually on 14 November 2026 |
| P1 | Add user reports and admin review | BACKLOG | Students can report a listing/user and admins can review, resolve, reject, and audit reports |
| P1 | Complete reservation activity and notification visibility | DONE | Buyer and seller can see relevant reservation, cancellation, expiry, and handover history; expiry notification visibility passed manual verification |
| P1 | Verify and harden Cloudinary media flow | REVIEW | Real Cloudinary upload, local fallback, failure cleanup, and accepted image limits are manually verified |
| P1 | Run reservation concurrency evidence | REVIEW | Concurrent attempts produce one winner and a consistent final listing state, with raw results recorded |
| P2 | Final deployment and demo readiness | BACKLOG | Environment, Atlas persistence, admin access, media storage, clean demo data, and final evidence are ready |

Video upload is deliberately deferred. Implement it only if the final evaluation rubric explicitly requires it.

## Remaining Important M Tasks

1. Verify real Cloudinary upload, local fallback, file limits, and failed-upload cleanup.
2. Run the reservation concurrency experiment and save truthful raw results.
3. Prepare deployment readiness: Atlas persistence, production environment, admin setup, media, and clean demo data.

Reports and admin review are intentionally deferred.

Video upload, Wanted Board, search experiments, bundle optimization, and broad refactoring remain deferred.

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
- When a dated push is requested, ask for the exact date, time, timezone, branch, files, and short commit message. Never infer or fabricate a timeline.

## Four-day Mid-term Plan

| Date | M - Backend/Data | N - Frontend/UX | H - Tests/Integration |
|---|---|---|---|
| 22 Oct | Stabilize auth, listing, reservation, expiry, and handover contracts. | Start auth and listing screens around the current browse shell. | Prepare clean demo data, API smoke checks, and a blocker list. |
| 23 Oct | Finish data consistency, edit approval, notifications, and privacy rules. | Complete the smallest login, listing, reservation, and handover states. | Run register/list/approve/search/reserve checks and record failures. |
| 24 Oct | Fix connected-workflow defects only and avoid optional architecture. | Add admin moderation and the minimum activity view. | Run the full evaluator path and verify mobile/desktop basics. |
| 25 Oct | Freeze backend behavior and review demo configuration. | Polish the evaluator path and remove misleading placeholders. | Rehearse the five-minute demo and prepare evidence for the report. |

Defer Cloudinary, Wanted Board, and search experiments if the core evaluator path is unstable.

For the final phase, Cloudinary verification remains useful after the P0 workflow is stable. Wanted Board and search experiments remain deferred.

## Pushed Scope Check

The current merged scope contains the reservation models, atomic reservation endpoint, expiry/cancellation/handover implementation, notifications, database-readiness fix, listing-edit rules, focused tests, optional Cloudinary storage, the concurrency runner, admin listing management, seller deletion protection, contact messaging, password policy, four-digit OTP handling, and frontend reservation/handover API integration. These remain `REVIEW` or `HUMAN VERIFICATION PENDING` until owner verification.

No task in this scope is marked `DONE` without owner verification.

## Current Evaluator Boundary

The merged project contains the backend reservation and handover APIs, backend tests, the concurrency runner, frontend-connected authentication, listing, reservation, and handover flows, password guidance, four-digit OTP handling, contact messaging, admin listing management, and API-connected admin moderation. The frontend reservation and handover screens are connected but remain outside the verified evaluator path until the owning teammate checks them.
