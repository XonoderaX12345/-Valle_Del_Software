-- CreateTable
CREATE TABLE "HomeHero" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "highlighted" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "primaryCta" TEXT NOT NULL,
    "primaryHref" TEXT NOT NULL,
    "secondaryCta" TEXT NOT NULL,
    "secondaryHref" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeHero_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeKpi" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "suffix" TEXT,
    "order" INTEGER NOT NULL,

    CONSTRAINT "HomeKpi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeCapability" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "HomeCapability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeFocus" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "HomeFocus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeAudience" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "HomeAudience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeTimeline" (
    "id" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "HomeTimeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeSpotlight" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "HomeSpotlight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeNews" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "dateText" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "HomeNews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HomeKpi_label_key" ON "HomeKpi"("label");
