-- CreateTable
CREATE TABLE "gor" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "court" (
    "id" TEXT NOT NULL,
    "gorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "court_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "gor_ownerId_key" ON "gor"("ownerId");

-- CreateIndex
CREATE INDEX "court_gorId_idx" ON "court"("gorId");

-- AddForeignKey
ALTER TABLE "gor" ADD CONSTRAINT "gor_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "court" ADD CONSTRAINT "court_gorId_fkey" FOREIGN KEY ("gorId") REFERENCES "gor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
