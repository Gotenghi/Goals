-- 샘플 작업 데이터 삽입

-- 우디의 작업들
INSERT INTO tasks (member_id, title, progress, status, priority) 
SELECT id, '대중적 관심사 콘텐츠 기획', 75, 'in-progress', 'high' FROM team_members WHERE name = '우디';

INSERT INTO tasks (member_id, title, progress, status, priority) 
SELECT id, '영상 간 연계성 스토리텔링', 60, 'in-progress', 'high' FROM team_members WHERE name = '우디';

INSERT INTO tasks (member_id, title, progress, status, priority) 
SELECT id, '이슈 탐색 및 기획', 80, 'in-progress', 'medium' FROM team_members WHERE name = '우디';

-- 민보의 작업들
INSERT INTO tasks (member_id, title, progress, status, priority) 
SELECT id, '주 3회 영상 제작', 65, 'in-progress', 'high' FROM team_members WHERE name = '민보';

INSERT INTO tasks (member_id, title, progress, status, priority) 
SELECT id, '편집량 최적화', 45, 'in-progress', 'medium' FROM team_members WHERE name = '민보';

INSERT INTO tasks (member_id, title, progress, status, priority) 
SELECT id, '롱폼 시청 지속시간 개선', 30, 'pending', 'medium' FROM team_members WHERE name = '민보';

-- 하지의 작업들
INSERT INTO tasks (member_id, title, progress, status, priority) 
SELECT id, '주 7회 숏폼 제작', 85, 'in-progress', 'high' FROM team_members WHERE name = '하지';

INSERT INTO tasks (member_id, title, progress, status, priority) 
SELECT id, 'SNS 플랫폼별 최적화', 70, 'in-progress', 'medium' FROM team_members WHERE name = '하지';

INSERT INTO tasks (member_id, title, progress, status, priority) 
SELECT id, '숏폼 도달률 증대', 55, 'in-progress', 'high' FROM team_members WHERE name = '하지';

-- 단하의 작업들
INSERT INTO tasks (member_id, title, progress, status, priority) 
SELECT id, '편집 워크플로우 개선', 40, 'in-progress', 'medium' FROM team_members WHERE name = '단하';

INSERT INTO tasks (member_id, title, progress, status, priority) 
SELECT id, '이탈률 감소 편집', 25, 'pending', 'high' FROM team_members WHERE name = '단하';

INSERT INTO tasks (member_id, title, progress, status, priority) 
SELECT id, '편집량 정량화 시스템', 15, 'pending', 'low' FROM team_members WHERE name = '단하';

-- 승끼의 작업들
INSERT INTO tasks (member_id, title, progress, status, priority) 
SELECT id, '콘텐츠 다양성 확보', 60, 'in-progress', 'medium' FROM team_members WHERE name = '승끼';

INSERT INTO tasks (member_id, title, progress, status, priority) 
SELECT id, '캐릭터 영향력 증대', 50, 'in-progress', 'medium' FROM team_members WHERE name = '승끼';

INSERT INTO tasks (member_id, title, progress, status, priority) 
SELECT id, '멤버 추가 호출 방안', 20, 'pending', 'low' FROM team_members WHERE name = '승끼';

-- 최맹의 작업들
INSERT INTO tasks (member_id, title, progress, status, priority) 
SELECT id, '채널 지표 분석', 90, 'in-progress', 'high' FROM team_members WHERE name = '최맹';

INSERT INTO tasks (member_id, title, progress, status, priority) 
SELECT id, '경쟁 채널 모니터링', 70, 'in-progress', 'medium' FROM team_members WHERE name = '최맹';

INSERT INTO tasks (member_id, title, progress, status, priority) 
SELECT id, '데이터 기반 최적화', 65, 'in-progress', 'high' FROM team_members WHERE name = '최맹';

-- 이브의 작업들
INSERT INTO tasks (member_id, title, progress, status, priority) 
SELECT id, '저자 사인회 이벤트 기획', 80, 'in-progress', 'high' FROM team_members WHERE name = '이브';

INSERT INTO tasks (member_id, title, progress, status, priority) 
SELECT id, '책읽는 코뿔소 프로모션', 60, 'in-progress', 'medium' FROM team_members WHERE name = '이브';

INSERT INTO tasks (member_id, title, progress, status, priority) 
SELECT id, '미래엔 연계 콘텐츠', 45, 'in-progress', 'medium' FROM team_members WHERE name = '이브';

-- 고탱의 작업들
INSERT INTO tasks (member_id, title, progress, status, priority) 
SELECT id, '광고 파트너십 확대', 35, 'in-progress', 'high' FROM team_members WHERE name = '고탱';

INSERT INTO tasks (member_id, title, progress, status, priority) 
SELECT id, '브랜딩 협찬 유치', 25, 'pending', 'high' FROM team_members WHERE name = '고탱';

INSERT INTO tasks (member_id, title, progress, status, priority) 
SELECT id, '광고 수익 최적화', 30, 'in-progress', 'medium' FROM team_members WHERE name = '고탱';

-- 지다의 작업들
INSERT INTO tasks (member_id, title, progress, status, priority) 
SELECT id, '굿즈 2,000세트 준비', 70, 'in-progress', 'high' FROM team_members WHERE name = '지다';

INSERT INTO tasks (member_id, title, progress, status, priority) 
SELECT id, '캐릭터 상품 기획', 55, 'in-progress', 'medium' FROM team_members WHERE name = '지다';

INSERT INTO tasks (member_id, title, progress, status, priority) 
SELECT id, '객단가 2.5만원 달성', 40, 'in-progress', 'high' FROM team_members WHERE name = '지다';

-- 혜경의 작업들
INSERT INTO tasks (member_id, title, progress, status, priority) 
SELECT id, '인스타 3,200명 목표', 45, 'in-progress', 'high' FROM team_members WHERE name = '혜경';

INSERT INTO tasks (member_id, title, progress, status, priority) 
SELECT id, '팔로워 2,400명 증가', 35, 'in-progress', 'high' FROM team_members WHERE name = '혜경';

INSERT INTO tasks (member_id, title, progress, status, priority) 
SELECT id, 'SNS 콘텐츠 기획', 65, 'in-progress', 'medium' FROM team_members WHERE name = '혜경';

-- 웃소 목표 대시보드 샘플 데이터

-- 1. 목표 섹션 먼저 생성
INSERT INTO goal_sections (title, description, is_active) VALUES
('2025년 3분기 목표', '2025년 3분기 주요 수익 목표', true)
ON CONFLICT DO NOTHING;

-- 2. 목표 섹션 ID 가져오기 위한 변수 (PostgreSQL에서는 WITH 절 사용)
WITH section_data AS (
  SELECT id as section_id FROM goal_sections WHERE title = '2025년 3분기 목표' LIMIT 1
)
-- 3. 목표 데이터 삽입
INSERT INTO goals (section_id, title, target, current, unit, color, icon_type, category, description, deadline, sort_order)
SELECT 
  section_data.section_id,
  goal_info.title,
  goal_info.target,
  goal_info.current,
  goal_info.unit,
  goal_info.color,
  goal_info.icon_type,
  goal_info.category,
  goal_info.description,
  goal_info.deadline,
  goal_info.sort_order
FROM section_data,
(VALUES
  ('애드센스 수익', 264000000, 0, '원', 'bg-red-500', 'target', '수익', '3억 3천만원에서 20% 하향 조정', '2025년 3분기', 1),
  ('광고 수익', 75000000, 0, '원', 'bg-blue-500', 'trending-up', '수익', '광고 협찬 및 브랜딩', '2025년 3분기', 2),
  ('인세 수익', 80000000, 0, '원', 'bg-green-500', 'book', '수익', '책읽는 코뿔소 4000만 + 미래엔 4000만', '2025년 3분기', 3),
  ('상품 판매', 50000000, 0, '원', 'bg-purple-500', 'shopping-cart', '수익', '굿즈 및 상품 판매', '2025년 3분기', 4)
) AS goal_info(title, target, current, unit, color, icon_type, category, description, deadline, sort_order)
ON CONFLICT DO NOTHING;

-- 4. 채널 지표 데이터
INSERT INTO channel_metrics (metric_name, target, current, unit) VALUES
('월간 조회수', 50000000, 0, '회'),
('일일 발행량', 25, 0, '개'),
('구독자 증가', 100000, 0, '명'),
('인스타 팔로워', 3200, 800, '명')
ON CONFLICT DO NOTHING;

-- 5. 팀원 데이터
INSERT INTO team_members (name, role, avatar, level, xp, max_xp, weekly_goals_completed, weekly_goals_total, videos_created, views_generated, engagement_rate, rank, is_online, status) VALUES
('우디', '콘텐츠 기획', '🎬', 5, 2800, 3000, 8, 10, 45, 12500000, 8.5, 1, true, 'active'),
('민보', '영상 제작', '🎥', 4, 2200, 2500, 7, 9, 38, 10200000, 7.8, 2, true, 'active'),
('하지', '숏폼 제작', '📱', 6, 3200, 3500, 9, 10, 52, 8900000, 9.2, 3, false, 'active'),
('단하', '편집', '✂️', 3, 1800, 2000, 5, 8, 28, 6700000, 6.4, 4, true, 'warning'),
('승끼', '콘텐츠 제작', '🎭', 4, 2400, 2500, 6, 8, 35, 9100000, 7.6, 5, true, 'active'),
('최맹', '기술 & 분석', '📊', 5, 2900, 3000, 8, 9, 25, 5800000, 8.9, 6, true, 'active'),
('이브', '출판 & 인세', '📚', 4, 2100, 2500, 7, 8, 15, 4200000, 7.2, 7, false, 'active'),
('고탱', '광고 영업', '💼', 3, 1600, 2000, 4, 7, 12, 3500000, 6.8, 8, true, 'warning'),
('지다', '상품 개발', '🛍️', 4, 2300, 2500, 6, 8, 18, 4800000, 7.4, 9, true, 'active'),
('혜경', 'SNS 마케팅', '📸', 5, 2700, 3000, 8, 9, 22, 6300000, 8.1, 10, true, 'active')
ON CONFLICT DO NOTHING;

-- 6. 팀 목표 데이터
INSERT INTO team_goals (title, description, progress, target, deadline, category, reward) VALUES
('월간 콘텐츠 제작', '매월 200개 이상의 콘텐츠 제작', 156, 200, '2025-12-31', '콘텐츠', '팀 회식'),
('구독자 성장', '연말까지 구독자 100만 달성', 850000, 1000000, '2025-12-31', '성장', '보너스 지급'),
('수익 목표 달성', '분기별 수익 목표 100% 달성', 75, 100, '2025-09-30', '수익', '개인별 인센티브'),
('팀 협업 개선', '팀원 간 협업 만족도 90% 이상', 85, 90, '2025-12-31', '협업', '팀 워크샵')
ON CONFLICT DO NOTHING;

-- 7. 업적 정의 데이터
INSERT INTO achievement_definitions (achievement_id, title, description, icon, type, threshold, rarity) VALUES
('first_goal', '첫 목표 달성', '첫 번째 목표를 달성했습니다!', 'Target', 'milestone', 1, 'common'),
('goal_master', '목표 마스터', '10개의 목표를 달성했습니다!', 'Trophy', 'milestone', 10, 'rare'),
('speed_demon', '스피드 데몬', '1주일 내에 목표를 달성했습니다!', 'Zap', 'speed', 1, 'epic'),
('consistent_achiever', '꾸준한 달성자', '한 달 동안 매일 목표를 달성했습니다!', 'Calendar', 'consistency', 30, 'legendary'),
('team_player', '팀 플레이어', '팀 목표에 기여했습니다!', 'Users', 'collaboration', 1, 'common'),
('revenue_hero', '수익 영웅', '수익 목표를 달성했습니다!', 'DollarSign', 'revenue', 1000000, 'rare'),
('content_creator', '콘텐츠 크리에이터', '100개의 콘텐츠를 제작했습니다!', 'Video', 'content', 100, 'epic'),
('engagement_king', '참여도 왕', '참여도 90% 이상을 달성했습니다!', 'Heart', 'engagement', 90, 'legendary')
ON CONFLICT DO NOTHING;

-- 8. 업적 달성 기록 데이터
INSERT INTO achievement_records (achievement_id, unlocked, current_value, unlocked_at) VALUES
('first_goal', true, 1, NOW() - INTERVAL '10 days'),
('team_player', true, 5, NOW() - INTERVAL '5 days'),
('revenue_hero', false, 750000, NULL),
('content_creator', false, 45, NULL),
('goal_master', false, 3, NULL),
('speed_demon', false, 0, NULL),
('consistent_achiever', false, 12, NULL),
('engagement_king', false, 78, NULL)
ON CONFLICT DO NOTHING;

-- 9. 작업 데이터 (팀원 ID와 연결)
WITH member_data AS (
  SELECT id, name FROM team_members
)
INSERT INTO tasks (member_id, title, progress, status, priority)
SELECT 
  member_data.id,
  task_info.title,
  task_info.progress,
  task_info.status,
  task_info.priority
FROM member_data,
(VALUES
  ('우디', '콘텐츠 기획서 작성', 80, 'in-progress', 'high'),
  ('우디', '다음 주 촬영 스케줄 조정', 100, 'completed', 'medium'),
  ('민보', '메인 채널 영상 편집', 60, 'in-progress', 'high'),
  ('민보', '썸네일 디자인 완료', 100, 'completed', 'medium'),
  ('하지', '숏폼 10개 제작', 90, 'in-progress', 'high'),
  ('하지', '인스타 릴스 업로드', 100, 'completed', 'low'),
  ('단하', '영상 편집 완료', 40, 'in-progress', 'medium'),
  ('단하', '편집 프로그램 업데이트', 0, 'pending', 'low'),
  ('승끼', '게스트 섭외', 70, 'in-progress', 'medium'),
  ('승끼', '대본 검토', 100, 'completed', 'high'),
  ('최맹', '분석 리포트 작성', 85, 'in-progress', 'high'),
  ('최맹', '대시보드 업데이트', 100, 'completed', 'medium'),
  ('이브', '출판사 미팅', 50, 'in-progress', 'medium'),
  ('이브', '원고 검토', 100, 'completed', 'high'),
  ('고탱', '광고주 제안서 작성', 30, 'in-progress', 'high'),
  ('고탱', '계약서 검토', 0, 'pending', 'medium'),
  ('지다', '굿즈 샘플 확인', 75, 'in-progress', 'medium'),
  ('지다', '온라인 스토어 업데이트', 100, 'completed', 'low'),
  ('혜경', 'SNS 콘텐츠 제작', 95, 'in-progress', 'high'),
  ('혜경', '인플루언서 협업', 100, 'completed', 'medium')
) AS task_info(member_name, title, progress, status, priority)
WHERE member_data.name = task_info.member_name
ON CONFLICT DO NOTHING; 