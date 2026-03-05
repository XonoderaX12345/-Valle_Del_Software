-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "authUserId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "documentId" TEXT,
    "phone" TEXT,
    "faculty" TEXT,
    "program" TEXT,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_authUserId_key" ON "UserProfile"("authUserId");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_documentId_key" ON "UserProfile"("documentId");

-- CreateIndex
CREATE INDEX "UserProfile_lastName_idx" ON "UserProfile"("lastName");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_key_key" ON "Permission"("key");
