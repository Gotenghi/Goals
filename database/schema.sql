-- 웃소 목표 대시보드 데이터베이스 스키마

-- 목표 테이블
CREATE TABLE IF NOT EXISTS goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    target BIGINT NOT NULL,
    current BIGINT DEFAULT 0,
    unit TEXT NOT NULL,
    color TEXT NOT NULL,
    description TEXT,
    deadline TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 채널 지표 테이블
CREATE TABLE IF NOT EXISTS channel_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    avatar TEXT NOT NULL,
    status TEXT CHECK (status IN ('active', 'warning', 'inactive')) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 작업 테이블
CREATE TABLE IF NOT EXISTS tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id UUID REFERENCES team_members(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    status TEXT CHECK (status IN ('completed', 'in-progress', 'pending')) DEFAULT 'pending',
    priority TEXT CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
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
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_channel_metrics_updated_at BEFORE UPDATE ON channel_metrics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON team_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) 활성화
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽을 수 있도록 정책 설정 (내부 팀용이므로)
CREATE POLICY "Enable read access for all users" ON goals FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON channel_metrics FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON team_members FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON tasks FOR SELECT USING (true);

-- 모든 사용자가 업데이트할 수 있도록 정책 설정
CREATE POLICY "Enable update access for all users" ON goals FOR UPDATE USING (true);
CREATE POLICY "Enable update access for all users" ON channel_metrics FOR UPDATE USING (true);
CREATE POLICY "Enable update access for all users" ON team_members FOR UPDATE USING (true);
CREATE POLICY "Enable update access for all users" ON tasks FOR UPDATE USING (true);

-- 모든 사용자가 삽입할 수 있도록 정책 설정
CREATE POLICY "Enable insert access for all users" ON goals FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert access for all users" ON channel_metrics FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert access for all users" ON team_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert access for all users" ON tasks FOR INSERT WITH CHECK (true);

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