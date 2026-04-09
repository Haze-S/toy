-- CreateTable
CREATE TABLE "ranking_collections" (
    "id" BIGSERIAL NOT NULL,
    "game_id" VARCHAR(50) NOT NULL DEFAULT 'aion2',
    "server" VARCHAR(20) NOT NULL DEFAULT 'KR',
    "ranking_type" VARCHAR(50) NOT NULL,
    "contents_type" VARCHAR(50),
    "total_count" INTEGER,
    "collected_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ranking_collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ranking_snapshots" (
    "id" BIGSERIAL NOT NULL,
    "collection_id" BIGINT NOT NULL,
    "rank" INTEGER NOT NULL,
    "character_name" VARCHAR(100) NOT NULL,
    "class_name" VARCHAR(50) NOT NULL,
    "level" INTEGER,
    "guild_name" VARCHAR(100),
    "score" BIGINT,
    "raw_data" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ranking_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character_snapshots" (
    "id" BIGSERIAL NOT NULL,
    "collection_id" BIGINT,
    "character_name" VARCHAR(100) NOT NULL,
    "class_name" VARCHAR(50) NOT NULL,
    "level" INTEGER,
    "equipment" JSONB,
    "stats" JSONB,
    "skills" JSONB,
    "raw_data" JSONB,
    "snapshot_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "character_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_collection_collected_at" ON "ranking_collections"("collected_at" DESC);

-- CreateIndex
CREATE INDEX "idx_snapshot_collection_class" ON "ranking_snapshots"("collection_id", "class_name");

-- CreateIndex
CREATE INDEX "idx_snapshot_character_name" ON "ranking_snapshots"("character_name");

-- CreateIndex
CREATE INDEX "idx_char_snapshot_name_time" ON "character_snapshots"("character_name", "snapshot_at" DESC);

-- AddForeignKey
ALTER TABLE "ranking_snapshots" ADD CONSTRAINT "ranking_snapshots_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "ranking_collections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_snapshots" ADD CONSTRAINT "character_snapshots_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "ranking_collections"("id") ON DELETE SET NULL ON UPDATE CASCADE;
