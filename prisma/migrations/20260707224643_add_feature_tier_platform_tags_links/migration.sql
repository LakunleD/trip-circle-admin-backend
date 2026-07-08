-- CreateTable
CREATE TABLE "circle_submissions" (
    "id" TEXT NOT NULL,
    "ticketNumber" TEXT NOT NULL,
    "submitterEmail" TEXT NOT NULL,
    "submitterName" TEXT,
    "submissionType" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "productArea" TEXT,
    "rating" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'new',
    "replySent" BOOLEAN NOT NULL DEFAULT false,
    "replySentAt" TIMESTAMP(3),
    "followUpInvited" BOOLEAN NOT NULL DEFAULT false,
    "source" TEXT NOT NULL DEFAULT 'widget',
    "flowContext" TEXT,
    "sessionId" TEXT,
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "circle_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "features" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'backlog',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "originTag" TEXT,
    "phase" TEXT,
    "workType" TEXT NOT NULL DEFAULT 'App Feature',
    "assignee" TEXT,
    "specLink" TEXT,
    "tier" TEXT NOT NULL DEFAULT 'free',
    "platform" TEXT NOT NULL DEFAULT 'web',
    "tags" TEXT[],
    "links" JSONB NOT NULL DEFAULT '[]',
    "createdBy" TEXT NOT NULL,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_history" (
    "id" TEXT NOT NULL,
    "featureId" TEXT NOT NULL,
    "fieldChanged" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "changedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feature_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_comments" (
    "id" TEXT NOT NULL,
    "featureId" TEXT NOT NULL,
    "authorEmail" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feature_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_members" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_spec_drafts" (
    "id" TEXT NOT NULL,
    "featureId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_spec_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "circle_submissions_ticketNumber_key" ON "circle_submissions"("ticketNumber");

-- CreateIndex
CREATE UNIQUE INDEX "team_members_email_key" ON "team_members"("email");

-- AddForeignKey
ALTER TABLE "feature_history" ADD CONSTRAINT "feature_history_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "features"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feature_comments" ADD CONSTRAINT "feature_comments_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "features"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_spec_drafts" ADD CONSTRAINT "ai_spec_drafts_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "features"("id") ON DELETE CASCADE ON UPDATE CASCADE;
