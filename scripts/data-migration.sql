-- Script hỗ trợ chuyển đổi dữ liệu từ cấu trúc cũ sang cấu trúc mới
-- CẢNH BÁO: Sao lưu dữ liệu trước khi chạy scripts này
-- Sử dụng: Chạy từng khối lệnh một sau khi đã tạo migration và cập nhật cấu trúc bảng

-- 1. Tạo bảng tạm để lưu trữ dữ liệu ranks của các tài khoản
CREATE TABLE IF NOT EXISTS `_temp_game_account_ranks` (
  `id` INT NOT NULL,
  `ranks` TEXT,
  PRIMARY KEY (`id`)
);

-- 2. Tạo bảng tạm để lưu trữ dữ liệu hình ảnh của các tài khoản
CREATE TABLE IF NOT EXISTS `_temp_game_account_images` (
  `id` INT NOT NULL,
  `images` TEXT,
  PRIMARY KEY (`id`)
);

-- 3. Sao chép dữ liệu ranks từ bảng hiện tại vào bảng tạm
-- LƯU Ý: Thay 'GameAccount' bằng tên bảng thực tế nếu khác
INSERT INTO `_temp_game_account_ranks` (`id`, `ranks`)
SELECT `id`, `ranks` FROM `GameAccount`;

-- 4. Sao chép dữ liệu images từ bảng hiện tại vào bảng tạm
-- LƯU Ý: Thay 'GameAccount' bằng tên bảng thực tế nếu khác
INSERT INTO `_temp_game_account_images` (`id`, `images`) 
SELECT `id`, `images` FROM `GameAccount`;

-- 5. Cập nhật soloRank, flexRank, tftRank dựa trên dữ liệu từ bảng tạm
-- LƯU Ý: Điều chỉnh cú pháp JSON phù hợp với cơ sở dữ liệu của bạn
-- Dưới đây là ví dụ cho MySQL
UPDATE `GameAccount` GA
JOIN `_temp_game_account_ranks` TR ON GA.`id` = TR.`id`
SET 
  GA.`soloRank` = CASE 
    WHEN JSON_EXTRACT(TR.`ranks`, '$[0]') IS NOT NULL THEN JSON_UNQUOTE(JSON_EXTRACT(TR.`ranks`, '$[0]'))
    ELSE 'UNRANKED' 
  END,
  GA.`flexRank` = CASE 
    WHEN JSON_EXTRACT(TR.`ranks`, '$[1]') IS NOT NULL THEN JSON_UNQUOTE(JSON_EXTRACT(TR.`ranks`, '$[1]'))
    ELSE 'UNRANKED' 
  END,
  GA.`tftRank` = CASE 
    WHEN JSON_EXTRACT(TR.`ranks`, '$[2]') IS NOT NULL THEN JSON_UNQUOTE(JSON_EXTRACT(TR.`ranks`, '$[2]'))
    ELSE 'UNRANKED' 
  END
WHERE TR.`ranks` IS NOT NULL;

-- 6. Cập nhật imageUrls dựa trên dữ liệu từ bảng tạm
UPDATE `GameAccount` GA
JOIN `_temp_game_account_images` TI ON GA.`id` = TI.`id`
SET GA.`imageUrls` = TI.`images`
WHERE TI.`images` IS NOT NULL;

-- 7. Cập nhật các giá trị mặc định cho các trường mới
UPDATE `GameAccount`
SET 
  `blueEssence` = 0,
  `riotPoints` = 0,
  `championCount` = 0,
  `skinCount` = 0,
  `chromaCount` = 0
WHERE `blueEssence` IS NULL OR `riotPoints` IS NULL OR `championCount` IS NULL OR `skinCount` IS NULL OR `chromaCount` IS NULL;

-- 8. Xóa bảng tạm sau khi hoàn tất
DROP TABLE IF EXISTS `_temp_game_account_ranks`;
DROP TABLE IF EXISTS `_temp_game_account_images`;

-- 9. Kiểm tra dữ liệu sau khi chuyển đổi
SELECT id, username, soloRank, flexRank, tftRank, imageUrls FROM `GameAccount` LIMIT 10; 