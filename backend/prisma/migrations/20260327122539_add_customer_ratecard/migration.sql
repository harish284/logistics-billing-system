-- AlterTable
ALTER TABLE "RateCard" ADD COLUMN     "customerId" TEXT;

-- AddForeignKey
ALTER TABLE "RateCard" ADD CONSTRAINT "RateCard_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
