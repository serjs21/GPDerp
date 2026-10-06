-- Purchase-confirmation copy shown to the user (hand-written or generated).

ALTER TABLE "GenerationPurchase" ADD COLUMN "confirmationMessage" TEXT;
