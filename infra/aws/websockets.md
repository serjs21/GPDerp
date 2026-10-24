# WebSockets on Lightsail

WebSockets only **notify** connected tabs; PostgreSQL stays the source of truth and every piece of pushed data can be
re-read over REST. The API runs as **one container**; see [Multiple replicas](#multiple-replicas-limitations) before
changing that.

## Endpoint and protocol (unchanged for the frontend)

- `GET /ws` on the same Fastify server and port as REST (`@fastify/websocket`); there is no separate socket server.
  On Lightsail: `wss://api.gpderp.party/ws`, TLS terminated by the public endpoint.
- Tab identity: `Sec-WebSocket-Protocol: tabId.<uuid>` (per-tab `sessionStorage` id). Missing → close `1008 tabId required`.
- Authentication: the existing `access_token` cookie, verified **once at the handshake** (JWT + one active-session lookup).
  Invalid / missing cookies still connect as an anonymous socket (receives nothing user-specific).
- Server → client events (unchanged names and payloads):

| Event | Sent to | Trigger |
|---|---|---|
| `{id, kind: "start" \| "delta" \| "saved" \| "complete", data}` | sockets of the tab in `x-tab-id` | `POST /beer_me_haiku` streaming |
| `{kind: "generation_credits", data: {credits}}` | every authenticated socket of the user | generation, purchase confirmation |
| `{kind: "share_link" \| "share_link_deleted", data}` | the user's sockets subscribed to `share-links` | share-link create / update / delete |
| `{kind: "pong", data: {authenticated, serverTime}}` | the pinging socket | client `{type: "ping"}` (new, additive) |

- Client → server: `{type: "subscribe" | "unsubscribe", channel: "share-links"}` (existing) and `{type: "ping"}` (new).
  Neither ever triggers a database query or an AI call: subscriptions use the identity resolved at the handshake.
- Haiku stream routing is by tab id (a random per-tab UUID) exactly as before; generation itself requires an
  authenticated `POST`.
- **SSE:** the API has no SSE routes (`text/event-stream`); streamed output is the WebSocket `delta` sequence above.

## Handshake rules (checked before the upgrade)

| Rule | Response |
|---|---|
| Handshake carries an auth cookie but `Origin` is missing or not in `CLIENT_URL` (cross-site WebSocket hijacking) | HTTP 403 |
| Cookie-less handshake with a foreign `Origin` | HTTP 403 (also enforced by CORS) |
| More than 60 sockets per client IP, 20 per user, or 2 per tab id | HTTP 429 |

Limits live in [apps/api/src/consts/webSocket.ts](../../apps/api/src/consts/webSocket.ts). The client IP comes from
`X-Forwarded-For`, trusting exactly `TRUST_PROXY_HOPS` proxies (default `1`, the Lightsail load balancer), so clients
cannot spoof it. Verify after a deploy: `curl https://api.gpderp.party/ws-check` must echo your public IP in `clientIp`
(if it shows a private 10.x / 172.x address, raise `TRUST_PROXY_HOPS`).

## Liveness

- **Server heartbeat:** a protocol ping to every socket every 25 s; a socket that has not answered the previous ping is
  terminated (half-open connections are cleaned up within ~50 s) and removed from every registry. The pings also
  keep idle sockets alive through the load balancer's idle timeout. Protocol pongs never reach application code.
- **Client watchdog:** browsers cannot see protocol pings, so the web client sends `{type:"ping"}` every 25 s and
  treats a missing `pong` within 10 s as a dead connection (laptop sleep, network switch) and reconnects.

## Web client

[sharedSocketManager.ts](../../apps/web/src/utils/webSocket/sharedSocketManager.ts) keeps **one socket per tab** shared
by every hook (`useHaikuSocket`, `useShareLinkSocket`, `GenerationCreditsSocket`); hooks attach through
[useWebSocket](../../apps/web/src/hooks/useWebSocket.ts).

- Connects once the auth state is known and re-establishes the socket on login / logout (new cookies).
- Reconnect: full jitter over an exponential window (500 ms base, 30 s cap; the attempt counter only resets after 30 s
  of stable connection). After `1012` (server restart) reconnects are spread over 1–5 s. While `navigator.onLine` is
  false no attempts are spent; `online` or the tab becoming visible reconnects (or probes) immediately.
- After a reconnect (not the first connect) it refreshes from REST: credits (`GET /payments/credits`), share-link
  lists (query invalidation), and — if a generation was streaming when the socket dropped — the haiku lists, while
  ignoring the rest of that interrupted stream.
- `POST /beer_me_haiku` waits up to 3 s for the socket to be open so a stream is not lost right after a reconnect.

## Shutdown

`SIGTERM` → `app.close()`: every socket is closed with **1012 `server_restart`** (sockets that do not complete the close
handshake are terminated after 5 s), the heartbeat and metrics timers stop, then pg-boss and Prisma close — all within
the 25 s shutdown cap. Tabs reconnect with jitter to the new container. In-flight generations lose the rest of their
stream; the client recovers the saved haiku over REST.

## Metrics and logging

- `GET /ws-check` → `{ ok, pid, clientIp, ws }` and a `WS metrics` log line every 60 s (only when values changed), with:
  `active`, `authenticated`, `peakActive`, `opened`;
  `closed.{normal (1000/1001), serverRestart (1012), heartbeatTimeout, policy (1008), abnormal (1006 and others)}`;
  `rejected.{origin, ipLimit, userLimit, tabLimit, tabMissing}`; `messagesIn`, `appPings`, `handshakeAuthChecks`.
  Counts only — no user, session or tab ids.
- Watch for: `closed.abnormal` / `heartbeatTimeout` growing faster than `opened` (network or load-balancer trouble),
  any `rejected.origin` (hijacking attempts or a misconfigured `CLIENT_URL`), `rejected.*Limit` (abuse or limits too low).
- Logs never contain cookies, `Authorization`, `x-csrf-token`, `x-tab-id` or `Sec-WebSocket-Protocol` (pino redaction),
  and socket connect/close log lines carry counts only.

## Integration test

[scripts/ws-integration-test.mjs](scripts/ws-integration-test.mjs) checks: `/healthz`; anonymous upgrade; client ping →
server pong; Origin enforcement; two authenticated tabs; streamed generation arriving progressively (WebSocket deltas);
two tabs receiving the same authorized notification while an anonymous socket receives nothing; idle sockets over the
5 / 30 / 120 minute checkpoints (still open, server pings received, pong OK, no unsolicited messages, no handshake auth
checks caused by heartbeats); and reconnection after an abrupt connection loss.

```bash
# Local container (part of local-docker-test.sh; disposable local user, writes allowed, isolated metrics)
infra/aws/scripts/ws-integration-test.mjs --api http://localhost:18080 --origin http://localhost:3000 \
  --duration 5m --provision-local-user --allow-writes --generate --expect-isolated

# Production, read-only, full idle run (~2 h); prompts for the password (or TEST_PASSWORD_FILE, chmod 600)
TEST_EMAIL=you@example.com infra/aws/scripts/ws-integration-test.mjs \
  --api https://api.gpderp.party --origin https://gpderp.party --duration 125m

# Production including notifications and one real (OpenAI, one credit) generation
TEST_EMAIL=you@example.com TEST_PASSWORD_FILE=~/.gpderp-test-password \
  infra/aws/scripts/ws-integration-test.mjs --api https://api.gpderp.party --origin https://gpderp.party \
  --duration 10m --allow-writes --generate
```

`--allow-writes` creates a share link for the account's newest haiku and deletes it again — only if this run created it
(HTTP 201); an existing link is left untouched. Exit code 1 on any failed check.

## Multiple replicas: limitations

All socket state is **in process memory**: the tab map, the user and share-link registries, the connection limits and
the metrics. With more than one container behind the Lightsail load balancer:

- A REST mutation handled by container A only notifies sockets connected to A; tabs whose socket landed on B miss the
  `share_link` / `generation_credits` event (they would see the change only after a reconnect or a refetch).
- Haiku streaming needs the tab's socket and its `POST /beer_me_haiku` on the same container. They are separate
  connections, so the load balancer may route them differently; sticky sessions do not guarantee it either.
- Per-IP / per-user limits and the metrics become per container (effective limits multiply by the replica count).
- A deploy already runs old and new containers side by side briefly; the `1012` close plus client reconnects and the
  REST refresh on reconnect cover that window.

Keep the service at **scale 1** (scale up power instead). If horizontal scaling becomes necessary without adding Redis,
fan events out through PostgreSQL `LISTEN/NOTIFY` (every container listens and delivers to its own sockets); haiku
streams would then be published per request id the same way. Until then, the multiple-replica setup is unsupported.
