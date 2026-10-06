import { prismaClient } from "../../lib/prisma";

export type CreatePostcardBatchInput = {
  userId: string;
  haikuId: string;
  haikuTitle: string;
  haikuBody: string;
  senderName: string;
  senderEmail: string;
  message: string;
  frontPng?: Buffer;
  recipientCount: number;
};

export type PostcardBatchForSend = {
  id: string;
  haikuTitle: string;
  haikuBody: string;
  senderName: string;
  senderEmail: string;
  message: string;
  frontPng: Buffer | null;
};

/** Clears the stored front once every recipient has been sent or permanently failed. */
const releaseFrontIfFinished = (id: string) =>
  prismaClient.$executeRaw`
    UPDATE "PostcardShareBatch"
    SET "frontPng" = NULL
    WHERE "id" = ${id}::uuid
      AND "frontPng" IS NOT NULL
      AND "sentCount" + "failedCount" >= "recipientCount"`;

export const postcardBatchRepository = {
  async create(input: CreatePostcardBatchInput): Promise<{ id: string }> {
    return prismaClient.postcardShareBatch.create({
      data: {
        userId: input.userId,
        haikuId: input.haikuId,
        haikuTitle: input.haikuTitle,
        haikuBody: input.haikuBody,
        senderName: input.senderName,
        senderEmail: input.senderEmail,
        message: input.message,
        frontPng: input.frontPng ? new Uint8Array(input.frontPng) : null,
        recipientCount: input.recipientCount,
      },
      select: { id: true },
    });
  },

  async deleteById(id: string): Promise<void> {
    await prismaClient.postcardShareBatch.deleteMany({ where: { id } });
  },

  async findForSend(id: string): Promise<PostcardBatchForSend | null> {
    const row = await prismaClient.postcardShareBatch.findUnique({
      where: { id },
      select: {
        id: true,
        haikuTitle: true,
        haikuBody: true,
        senderName: true,
        senderEmail: true,
        message: true,
        frontPng: true,
      },
    });
    if (!row) return null;
    return { ...row, frontPng: row.frontPng ? Buffer.from(row.frontPng) : null };
  },

  async markSent(id: string): Promise<void> {
    await prismaClient.postcardShareBatch.updateMany({ where: { id }, data: { sentCount: { increment: 1 } } });
    await releaseFrontIfFinished(id);
  },

  async markFailed(id: string): Promise<void> {
    await prismaClient.postcardShareBatch.updateMany({ where: { id }, data: { failedCount: { increment: 1 } } });
    await releaseFrontIfFinished(id);
  },

  async deleteCreatedBefore(cutoff: Date): Promise<number> {
    const { count } = await prismaClient.postcardShareBatch.deleteMany({ where: { createdAt: { lt: cutoff } } });
    return count;
  },
};
