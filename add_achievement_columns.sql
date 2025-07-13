-- achievement_definitions 테이블에 진행 상황 컬럼 추가
ALTER TABLE achievement_definitions 
ADD COLUMN IF NOT EXISTS current_value BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS unlocked BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS unlocked_at TIMESTAMP WITH TIME ZONE;

-- 기존 데이터 호환성을 위한 컬럼 추가
ALTER TABLE achievement_definitions 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS row INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- target_value 컬럼이 없으면 추가 (기존 threshold를 사용)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='achievement_definitions' AND column_name='target_value') THEN
        -- threshold 컬럼이 있으면 target_value로 복사
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='achievement_definitions' AND column_name='threshold') THEN
            ALTER TABLE achievement_definitions ADD COLUMN target_value BIGINT;
            UPDATE achievement_definitions SET target_value = threshold WHERE threshold IS NOT NULL;
        ELSE
            ALTER TABLE achievement_definitions ADD COLUMN target_value BIGINT DEFAULT 0;
        END IF;
    END IF;
END $$;

-- tier 컬럼이 없으면 추가 (기존 rarity를 사용)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='achievement_definitions' AND column_name='tier') THEN
        -- rarity 컬럼이 있으면 tier로 복사
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='achievement_definitions' AND column_name='rarity') THEN
            ALTER TABLE achievement_definitions ADD COLUMN tier TEXT DEFAULT 'bronze';
            UPDATE achievement_definitions SET tier = 
                CASE 
                    WHEN rarity = 'common' THEN 'bronze'
                    WHEN rarity = 'rare' THEN 'silver'
                    WHEN rarity = 'epic' THEN 'gold'
                    WHEN rarity = 'legendary' THEN 'platinum'
                    ELSE 'bronze'
                END;
        ELSE
            ALTER TABLE achievement_definitions ADD COLUMN tier TEXT DEFAULT 'bronze';
        END IF;
    END IF;
END $$;

-- 컬럼 확인용 쿼리
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'achievement_definitions' 
ORDER BY ordinal_position;
