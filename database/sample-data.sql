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