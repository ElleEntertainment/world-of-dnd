-- CreateTable
CREATE TABLE "game_sessions" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "userId" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "game_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "characters" (
    "id" SERIAL NOT NULL,
    "gameSessionId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "race" TEXT,
    "class" TEXT,
    "level" INTEGER NOT NULL DEFAULT 1,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "strength" INTEGER NOT NULL DEFAULT 10,
    "dexterity" INTEGER NOT NULL DEFAULT 10,
    "constitution" INTEGER NOT NULL DEFAULT 10,
    "intelligence" INTEGER NOT NULL DEFAULT 10,
    "wisdom" INTEGER NOT NULL DEFAULT 10,
    "charisma" INTEGER NOT NULL DEFAULT 10,
    "hitPoints" INTEGER NOT NULL DEFAULT 0,
    "maxHitPoints" INTEGER NOT NULL DEFAULT 0,
    "armorClass" INTEGER NOT NULL DEFAULT 10,
    "initiative" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "characters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skills" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "keyAbility" TEXT NOT NULL,
    "keyAbilityShort" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character_skills" (
    "id" SERIAL NOT NULL,
    "characterId" INTEGER NOT NULL,
    "skillId" INTEGER NOT NULL,
    "checked" BOOLEAN NOT NULL DEFAULT false,
    "checked2" BOOLEAN NOT NULL DEFAULT false,
    "ranks" INTEGER NOT NULL DEFAULT 0,
    "miscMod" INTEGER NOT NULL DEFAULT 0,
    "total" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "character_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spells" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 0,
    "school" TEXT,
    "castingTime" TEXT,
    "range" TEXT,
    "components" TEXT,
    "duration" TEXT,
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "spells_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character_spells" (
    "id" SERIAL NOT NULL,
    "characterId" INTEGER NOT NULL,
    "spellId" INTEGER NOT NULL,
    "isPrepared" BOOLEAN NOT NULL DEFAULT false,
    "timesUsed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "character_spells_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "talents" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "prerequisites" TEXT,
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "talents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character_talents" (
    "id" SERIAL NOT NULL,
    "characterId" INTEGER NOT NULL,
    "talentId" INTEGER NOT NULL,
    "acquiredAt" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "character_talents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "character_skills_characterId_skillId_key" ON "character_skills"("characterId", "skillId");

-- CreateIndex
CREATE UNIQUE INDEX "character_spells_characterId_spellId_key" ON "character_spells"("characterId", "spellId");

-- CreateIndex
CREATE UNIQUE INDEX "character_talents_characterId_talentId_key" ON "character_talents"("characterId", "talentId");

-- AddForeignKey
ALTER TABLE "game_sessions" ADD CONSTRAINT "game_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "characters" ADD CONSTRAINT "characters_gameSessionId_fkey" FOREIGN KEY ("gameSessionId") REFERENCES "game_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_skills" ADD CONSTRAINT "character_skills_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_skills" ADD CONSTRAINT "character_skills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_spells" ADD CONSTRAINT "character_spells_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_spells" ADD CONSTRAINT "character_spells_spellId_fkey" FOREIGN KEY ("spellId") REFERENCES "spells"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_talents" ADD CONSTRAINT "character_talents_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_talents" ADD CONSTRAINT "character_talents_talentId_fkey" FOREIGN KEY ("talentId") REFERENCES "talents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
