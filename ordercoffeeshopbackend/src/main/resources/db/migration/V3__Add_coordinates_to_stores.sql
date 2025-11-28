-- 1. Thêm cột tọa độ
ALTER TABLE public.stores ADD COLUMN latitude double precision;
ALTER TABLE public.stores ADD COLUMN longitude double precision;

-- 2. Cập nhật dữ liệu thật (Ví dụ tọa độ ở Hà Nội)
-- Cầu Giấy
UPDATE public.stores SET latitude = 21.0356, longitude = 105.7936 WHERE id = 1; 
-- Hoàn Kiếm
UPDATE public.stores SET latitude = 21.0285, longitude = 105.8542 WHERE id = 2; 
-- Hà Đông
UPDATE public.stores SET latitude = 20.9723, longitude = 105.7762 WHERE id = 3; 
-- Các quán HCM/Đà Nẵng (bạn tự lấy thêm hoặc copy đại tọa độ nào đó xa xa)
UPDATE public.stores SET latitude = 10.7769, longitude = 106.7009 WHERE id = 4; -- Quận 1
UPDATE public.stores SET latitude = 10.8016, longitude = 106.7115 WHERE id = 5; -- Bình Thạnh
UPDATE public.stores SET latitude = 16.0544, longitude = 108.2022 WHERE id = 6; -- Đà Nẵng