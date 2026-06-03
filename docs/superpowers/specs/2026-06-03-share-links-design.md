# Share Links Design

## Goal

Add public read-only dashboard sharing so a logged-in user can turn a saved
dashboard into a link and send it to someone who is not signed in.

## Scope

This version supports one active public link per dashboard. The owner can create
or reuse the active link and revoke it. Public visitors can view the shared
dashboard by token. Passwords, expiry dates, team permissions, editing, and share
analytics are intentionally out of scope for this slice.

## Backend Design

Add a `share_links` table with a random unique token, `dashboard_id`,
`owner_id`, `status`, `created_at`, and optional `revoked_at`. A partial unique
index keeps at most one active link per dashboard.

Backend endpoints:

- `POST /api/v1/dashboards/{dashboard_id}/share-link`
  - Requires auth.
  - Verifies the caller can access the dashboard.
  - Returns the existing active link or creates a new token.
- `DELETE /api/v1/dashboards/{dashboard_id}/share-link`
  - Requires auth.
  - Revokes the active link for that dashboard.
- `GET /api/v1/share/{token}`
  - Public.
  - Returns share metadata plus the dashboard, charts, and insights.
  - Returns 404 for missing or revoked tokens.

All private creation/revocation paths continue to use workspace membership. The
public path never accepts a user token and only reads dashboards reachable through
an active share token.

## Frontend Design

The saved dashboard row gains a `分享` action. Clicking it calls the private API,
builds `/share/{token}`, copies the URL to the clipboard when available, and
shows the link. The row also supports revoking an active share.

Add `/share/[token]` as a public read-only page. It fetches the public share API
without Supabase auth and renders:

- product label and dashboard title
- chart and insight counts
- charts using the same Recharts renderer as the workspace
- insight summaries in compact read-only panels
- a clear 404-style message for invalid or revoked links

## Testing

Backend unit tests cover token creation/reuse, revocation, and public lookup
behavior using fake repositories. Frontend build and Playwright smoke ensure the
new public route compiles without affecting existing public shell coverage.

## Follow-Ups

Later slices can add expiry timestamps, password-protected links, per-link audit
events, organization-level sharing policies, and GitHub CI authenticated E2E for
creating and opening a real share link.
