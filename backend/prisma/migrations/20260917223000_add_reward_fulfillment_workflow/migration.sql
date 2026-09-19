CREATE TYPE "RewardType" AS ENUM ('DIGITAL', 'PHYSICAL');

ALTER TYPE "RewardRedemptionStatus"
ADD VALUE 'PROCESSING';

ALTER TYPE "RewardRedemptionStatus"
ADD VALUE 'SHIPPED';

ALTER TYPE "RewardRedemptionStatus"
ADD VALUE 'IN_TRANSIT';

ALTER TYPE "RewardRedemptionStatus"
ADD VALUE 'DELIVERED';

ALTER TYPE "RewardRedemptionStatus"
ADD VALUE 'CLAIMED';

ALTER TABLE "rewards"
ADD COLUMN "type" "RewardType" NOT NULL DEFAULT 'DIGITAL';

ALTER TABLE "reward_redemptions"
ADD COLUMN "tracking_number" VARCHAR(100),
ADD COLUMN "carrier" VARCHAR(100),
ADD COLUMN "shipped_at" TIMESTAMPTZ(6),
ADD COLUMN "delivered_at" TIMESTAMPTZ(6),
ADD COLUMN "claimed_at" TIMESTAMPTZ(6),
ADD COLUMN "fulfilled_at" TIMESTAMPTZ(6);

CREATE INDEX "reward_redemptions_status_idx"
ON "reward_redemptions"("status");