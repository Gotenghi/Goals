-- 웃소 목표 대시보드 데이터베이스 스키마

-- UUID 생성을 위한 확장 기능 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 스키마 마이그레이션: goal_sections 테이블에 order 컬럼 추가
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'goal_sections' AND column_name = 'order'
    ) THEN
        ALTER TABLE goal_sections ADD COLUMN "order" INTEGER DEFAULT 1;
    END IF;
END $$;

-- 목표 섹션 테이블 (예: "2025년 3분기 목표")
CREATE TABLE IF NOT EXISTS goal_sections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL DEFAULT '2025년 3분기 목표',
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    "order" INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 목표 테이블 (확장된 구조)
CREATE TABLE IF NOT EXISTS goals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    section_id UUID REFERENCES goal_sections(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    target BIGINT NOT NULL,
    current BIGINT DEFAULT 0,
    unit TEXT NOT NULL,
    color TEXT NOT NULL,
    icon_type TEXT NOT NULL DEFAULT 'target',
    category TEXT NOT NULL,
    description TEXT,
    deadline TEXT,
    expanded BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 하위 목표 테이블
CREATE TABLE IF NOT EXISTS sub_goals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    target BIGINT NOT NULL,
    current BIGINT DEFAULT 0,
    unit TEXT NOT NULL,
    priority TEXT CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
    completed BOOLEAN DEFAULT false,
    deadline DATE,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 채널 지표 테이블
CREATE TABLE IF NOT EXISTS channel_metrics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    metric_name TEXT NOT NULL,
    target BIGINT NOT NULL,
    current BIGINT DEFAULT 0,
    unit TEXT NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 팀원 테이블
CREATE TABLE IF NOT EXISTS team_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    avatar TEXT NOT NULL,
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    max_xp INTEGER DEFAULT 1000,
    achievements TEXT[] DEFAULT '{}',
    weekly_goals_completed INTEGER DEFAULT 0,
    weekly_goals_total INTEGER DEFAULT 0,
    videos_created INTEGER DEFAULT 0,
    views_generated BIGINT DEFAULT 0,
    engagement_rate DECIMAL(5,2) DEFAULT 0,
    rank INTEGER DEFAULT 1,
    is_online BOOLEAN DEFAULT false,
    status TEXT CHECK (status IN ('active', 'warning', 'inactive')) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 팀 목표 테이블
CREATE TABLE IF NOT EXISTS team_goals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    progress BIGINT DEFAULT 0,
    target BIGINT NOT NULL,
    deadline DATE,
    category TEXT NOT NULL,
    reward TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 작업 테이블
CREATE TABLE IF NOT EXISTS tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    member_id UUID REFERENCES team_members(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    status TEXT CHECK (status IN ('completed', 'in-progress', 'pending')) DEFAULT 'pending',
    priority TEXT CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 업적 정의 테이블 (완전한 단일 테이블 구조)
CREATE TABLE IF NOT EXISTS achievement_definitions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    achievement_id TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT 'Target',
    category TEXT NOT NULL DEFAULT '',
    target_value BIGINT NOT NULL DEFAULT 0,
    tier TEXT CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')) DEFAULT 'bronze',
    row INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    
    -- 진행 상황 및 달성 정보 (통합)
    current_value BIGINT DEFAULT 0,
    unlocked BOOLEAN DEFAULT false,
    unlocked_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 업적 달성 기록 테이블
CREATE TABLE IF NOT EXISTS achievement_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    achievement_id TEXT NOT NULL,
    unlocked BOOLEAN DEFAULT false,
    current_value BIGINT DEFAULT 0,
    unlocked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    FOREIGN KEY (achievement_id) REFERENCES achievement_definitions(achievement_id) ON DELETE CASCADE
);

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 생성
CREATE TRIGGER update_goal_sections_updated_at BEFORE UPDATE ON goal_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sub_goals_updated_at BEFORE UPDATE ON sub_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_channel_metrics_updated_at BEFORE UPDATE ON channel_metrics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON team_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_team_goals_updated_at BEFORE UPDATE ON team_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_achievement_definitions_updated_at BEFORE UPDATE ON achievement_definitions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_achievement_records_updated_at BEFORE UPDATE ON achievement_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) 활성화
ALTER TABLE goal_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievement_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievement_records ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽을 수 있도록 정책 설정 (내부 팀용이므로)
CREATE POLICY "Enable read access for all users" ON goal_sections FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON goals FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON sub_goals FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON channel_metrics FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON team_members FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON team_goals FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON tasks FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON achievement_definitions FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON achievement_records FOR SELECT USING (true);

-- 모든 사용자가 업데이트할 수 있도록 정책 설정
CREATE POLICY "Enable update access for all users" ON goal_sections FOR UPDATE USING (true);
CREATE POLICY "Enable update access for all users" ON goals FOR UPDATE USING (true);
CREATE POLICY "Enable update access for all users" ON sub_goals FOR UPDATE USING (true);
CREATE POLICY "Enable update access for all users" ON channel_metrics FOR UPDATE USING (true);
CREATE POLICY "Enable update access for all users" ON team_members FOR UPDATE USING (true);
CREATE POLICY "Enable update access for all users" ON team_goals FOR UPDATE USING (true);
CREATE POLICY "Enable update access for all users" ON tasks FOR UPDATE USING (true);
CREATE POLICY "Enable update access for all users" ON achievement_definitions FOR UPDATE USING (true);
CREATE POLICY "Enable update access for all users" ON achievement_records FOR UPDATE USING (true);

-- 모든 사용자가 삽입할 수 있도록 정책 설정
CREATE POLICY "Enable insert access for all users" ON goal_sections FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert access for all users" ON goals FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert access for all users" ON sub_goals FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert access for all users" ON channel_metrics FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert access for all users" ON team_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert access for all users" ON team_goals FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert access for all users" ON tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert access for all users" ON achievement_definitions FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert access for all users" ON achievement_records FOR INSERT WITH CHECK (true);

-- 모든 사용자가 삭제할 수 있도록 정책 설정
CREATE POLICY "Enable delete access for all users" ON goal_sections FOR DELETE USING (true);
CREATE POLICY "Enable delete access for all users" ON goals FOR DELETE USING (true);
CREATE POLICY "Enable delete access for all users" ON sub_goals FOR DELETE USING (true);
CREATE POLICY "Enable delete access for all users" ON channel_metrics FOR DELETE USING (true);
CREATE POLICY "Enable delete access for all users" ON team_members FOR DELETE USING (true);
CREATE POLICY "Enable delete access for all users" ON team_goals FOR DELETE USING (true);
CREATE POLICY "Enable delete access for all users" ON tasks FOR DELETE USING (true);
CREATE POLICY "Enable delete access for all users" ON achievement_definitions FOR DELETE USING (true);
CREATE POLICY "Enable delete access for all users" ON achievement_records FOR DELETE USING (true);

-- 초기 데이터 삽입
INSERT INTO goals (title, target, current, unit, color, description, deadline) VALUES
('애드센스 수익', 264000000, 0, '원', 'bg-usso-primary', '3억 3천만원에서 20% 하향 조정', '2025년 3분기'),
('광고 수익', 75000000, 0, '원', 'bg-usso-secondary', '광고 협찬 및 브랜딩', '2025년 3분기'),
('인세 수익', 80000000, 0, '원', 'bg-usso-accent', '책읽는 코뿔소 4000만 + 미래엔 4000만', '2025년 3분기'),
('상품 판매', 50000000, 0, '원', 'bg-purple-500', '굿즈 및 상품 판매', '2025년 3분기');

INSERT INTO channel_metrics (metric_name, target, current, unit) VALUES
('월간 조회수', 50000000, 0, '회'),
('일일 발행량', 25, 0, '개'),
('구독자 증가', 100000, 0, '명'),
('인스타 팔로워', 3200, 800, '명');

INSERT INTO team_members (name, role, avatar, status) VALUES
('우디', '콘텐츠 기획', '🎬', 'active'),
('민보', '영상 제작', '🎥', 'active'),
('하지', '숏폼 제작', '📱', 'active'),
('단하', '편집', '✂️', 'warning'),
('승끼', '콘텐츠 제작', '🎭', 'active'),
('최맹', '기술 & 분석', '📊', 'active'),
('이브', '출판 & 인세', '📚', 'active'),
('고탱', '광고 영업', '💼', 'warning'),
('지다', '상품 개발', '🛍️', 'active'),
('혜경', 'SNS 마케팅', '📸', 'active');

-- 작업 데이터는 별도 스크립트에서 추가 