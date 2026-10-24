import type { PgBoss, Queue } from "pg-boss" with { "resolution-mode": "import" };
import {
  POSTCARD_BATCH_CLEANUP_CRON,
  POSTCARD_BATCH_CLEANUP_QUEUE,
  POSTCARD_BATCH_RETENTION_DAYS,
  POSTCARD_EMAIL_DLQ,
  POSTCARD_EMAIL_EXPIRE_SECONDS,
  POSTCARD_EMAIL_LOCAL_CONCURRENCY,
  POSTCARD_EMAIL_QUEUE,
  POSTCARD_EMAIL_RETRY_DELAY_MAX_SECONDS,
  POSTCARD_EMAIL_RETRY_DELAY_SECONDS,
  POSTCARD_EMAIL_RETRY_LIMIT,
  POSTCARD_QUEUE_SCHEMA,
} from "../../consts/postcardQueue";
import { PG_BOSS_POOL_MAX } from "../../consts/database";
import { postgresConnectionString } from "../../lib/postgresConnectionString";
import { sanitizeDbError } from "../../utils/databaseUrl";
import { postcardBatchRepository } from "./postcardBatch.repository";
import {
  processPostcardEmailDeadLetter,
  processPostcardEmailJob,
  type PostcardEmailJobData,
} from "./postcardEmail.worker";

const LOG_PREFIX = "[postcardQueue]";
const DAY_MS = 24 * 60 * 60 * 1000;

let boss: PgBoss | null = null;

type QueueOptions = Omit<Queue, "name">;

const EMAIL_QUEUE_OPTIONS: QueueOptions = {
  deadLetter: POSTCARD_EMAIL_DLQ,
  retryLimit: POSTCARD_EMAIL_RETRY_LIMIT,
  retryDelay: POSTCARD_EMAIL_RETRY_DELAY_SECONDS,
  retryBackoff: true,
  retryDelayMax: POSTCARD_EMAIL_RETRY_DELAY_MAX_SECONDS,
  expireInSeconds: POSTCARD_EMAIL_EXPIRE_SECONDS,
};

/** The DLQ handler only logs + counts, so a couple of quick retries is enough. */
const DLQ_OPTIONS: QueueOptions = { retryLimit: 2, retryDelay: 10, expireInSeconds: 60 };
const CLEANUP_OPTIONS: QueueOptions = { retryLimit: 1, expireInSeconds: 300 };

const ensureQueue = async (instance: PgBoss, name: string, options: QueueOptions) => {
  if (await instance.getQueue(name)) await instance.updateQueue(name, options);
  else await instance.createQueue(name, options);
};

const requireBoss = (): PgBoss => {
  if (!boss) throw new Error("Postcard queue is not started");
  return boss;
};

export async function startPostcardQueue(): Promise<void> {
  if (boss) return;
  // pg-boss is ESM-only; the API compiles to CommonJS.
  const { PgBoss: PgBossClass } = await import("pg-boss");
  // pg-boss's own pool defaults (10s connect timeout, pg's 10s idle timeout) already sit well inside Neon's suspend window.
  const instance = new PgBossClass({
    connectionString: postgresConnectionString(),
    schema: POSTCARD_QUEUE_SCHEMA,
    max: PG_BOSS_POOL_MAX,
  });
  instance.on("error", (err) => console.error(LOG_PREFIX, sanitizeDbError(err)));
  await instance.start();

  await ensureQueue(instance, POSTCARD_EMAIL_DLQ, DLQ_OPTIONS);
  await ensureQueue(instance, POSTCARD_EMAIL_QUEUE, EMAIL_QUEUE_OPTIONS);
  await ensureQueue(instance, POSTCARD_BATCH_CLEANUP_QUEUE, CLEANUP_OPTIONS);

  await instance.work<PostcardEmailJobData>(
    POSTCARD_EMAIL_QUEUE,
    { localConcurrency: POSTCARD_EMAIL_LOCAL_CONCURRENCY },
    async ([job]) => processPostcardEmailJob(job.data),
  );
  await instance.work<PostcardEmailJobData>(POSTCARD_EMAIL_DLQ, async ([job]) =>
    processPostcardEmailDeadLetter(job.data),
  );
  await instance.work(POSTCARD_BATCH_CLEANUP_QUEUE, async () => {
    const deleted = await postcardBatchRepository.deleteCreatedBefore(
      new Date(Date.now() - POSTCARD_BATCH_RETENTION_DAYS * DAY_MS),
    );
    if (deleted > 0) console.log(LOG_PREFIX, `cleaned up ${deleted} postcard batches`);
  });
  await instance.schedule(POSTCARD_BATCH_CLEANUP_QUEUE, POSTCARD_BATCH_CLEANUP_CRON);

  boss = instance;
  console.log(LOG_PREFIX, "started");
}

export async function stopPostcardQueue(): Promise<void> {
  if (!boss) return;
  const instance = boss;
  boss = null;
  await instance.stop({ graceful: true });
}

/** One job per recipient; the singleton key keeps a recipient from being queued twice for a batch. */
export async function enqueuePostcardEmails(batchId: string, recipients: string[]): Promise<number> {
  const instance = requireBoss();
  await instance.insert(
    POSTCARD_EMAIL_QUEUE,
    recipients.map((recipient) => ({
      data: { batchId, recipient } satisfies PostcardEmailJobData,
      singletonKey: `${batchId}:${recipient}`,
    })),
  );
  return recipients.length;
}
