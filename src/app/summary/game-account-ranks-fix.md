# Chỉnh sửa hệ thống thứ hạng cho tài khoản game

Ngày: 20/06/2023
Cập nhật: 21/06/2023, 22/06/2023, 23/06/2023, 24/06/2023, 25/06/2023

## Vấn đề

Trang thêm tài khoản game đang gặp lỗi khi thêm thông tin thứ hạng (rank) do tất cả các loại rank (Solo, Flex, TFT) đang được gộp lại thành một mảng `ranks`. Điều này gây khó khăn trong việc phân biệt các loại thứ hạng và dẫn đến không thể thêm được các thứ hạng vào tài khoản.

Sau khi tách thành ba trường riêng biệt, phát hiện thêm lỗi: Component `<SelectItem />` không được phép có value là chuỗi rỗng ("") vì nó được dùng để xóa lựa chọn và hiển thị placeholder.

Sau khi sửa lỗi SelectItem, phát hiện thêm vấn đề: Giao diện đã được cập nhật để sử dụng 3 trường riêng biệt (solorank, flexrank, tftrank) nhưng API backend vẫn mong đợi một trường `ranks` dạng mảng, dẫn đến thông tin rank không được lưu vào database.

Sau khi gửi ranks dưới dạng mảng, phát hiện thêm vấn đề: Dù đã chọn rank từ giao diện, thông tin rank vẫn hiển thị là "UNRANKED" trong cơ sở dữ liệu. Điều này là do giá trị rank được gửi là tiếng Anh ("IRON", "BRONZE", v.v.), trong khi backend mong đợi giá trị tiếng Việt viết tắt ("SAT", "DONG", v.v.).

Sau khi kiểm tra console log, xác định backend đang chuyển đổi giá trị từ tiếng Anh sang tiếng Việt viết tắt trước khi lưu vào database:

- Khi gửi: `ranks: ["SILVER", "PLATINUM", "IRON"]`
- Khi nhận: `ranks: ["BAC", "BACH_KIM", "SAT"]`

## Giải pháp cuối cùng

Dựa trên phân tích console log, chúng ta đã xác định được chính xác vấn đề và cách giải quyết:

1. **Sử dụng giá trị tiếng Việt viết tắt** cho các tùy chọn rank:

   ```javascript
   const rankOptions = [
     { value: "SAT", label: "Sắt (Iron)" },
     { value: "DONG", label: "Đồng (Bronze)" },
     // ...và các giá trị khác
   ];
   ```

2. **Gửi dữ liệu dưới dạng mảng ranks**, không sử dụng các trường riêng lẻ:
   ```javascript
   const submitData = {
     ...formData,
     ranks, // Mảng chứa các giá trị rank đã chọn
     solorank: undefined,
     flexrank: undefined,
     tftrank: undefined,
     // ...và loại bỏ các trường khác không cần thiết
   };
   ```

Cách giải quyết này đảm bảo frontend và backend hoạt động nhất quán với nhau mà không cần thay đổi backend.

## Các thay đổi chi tiết

1. Cập nhật interface `GameAccount`:

   - Thay thế trường `ranks?: string[]` bằng:
     - `solorank?: string`
     - `flexrank?: string`
     - `tftrank?: string`

2. Cập nhật state cho form:

   - Thay thế `ranks: []` bằng:
     - `solorank: "NONE"`
     - `flexrank: "NONE"`
     - `tftrank: "NONE"`

3. Thay thế component `MultiSelect` bằng ba component `Select` riêng biệt:

   - Component cho thứ hạng đơn đấu (Solo/Duo)
   - Component cho thứ hạng linh hoạt (Flex)
   - Component cho thứ hạng Đấu Trường Chân Lý (TFT)

4. Thêm tùy chọn "Không có" với giá trị "NONE" (thay vì chuỗi rỗng) vào mỗi Select để cho phép bỏ trống thứ hạng

5. Sử dụng giá trị tiếng Việt viết tắt cho các tùy chọn rank:

   - "SAT" thay vì "IRON"
   - "DONG" thay vì "BRONZE"
   - "BAC" thay vì "SILVER"
   - "VANG" thay vì "GOLD"
   - "BACH_KIM" thay vì "PLATINUM"
   - "KIM_CUONG" thay vì "DIAMOND"
   - "CAO_THU" thay vì "MASTER"
   - "DAI_CAO_THU" thay vì "GRANDMASTER"
   - "THACH_DAU" thay vì "CHALLENGER"

6. Cập nhật hàm `handleSubmit`:
   - Tạo mảng ranks từ ba trường rank riêng biệt
   - Chỉ gửi dữ liệu dưới dạng mảng ranks
   - Loại bỏ tất cả các trường khác không cần thiết

## Kết quả

Với các thay đổi trên, người dùng có thể chọn thứ hạng cụ thể cho từng loại một cách riêng biệt trong giao diện, và dữ liệu được gửi đến backend theo định dạng mà backend mong đợi. Điều này đảm bảo thông tin rank được lưu chính xác vào database và hiển thị đúng trong các trang khác của ứng dụng.

Đã khắc phục các lỗi:

- Lỗi runtime error do sử dụng chuỗi rỗng trong component SelectItem
- Lỗi dữ liệu rank không được lưu vào database
- Lỗi giá trị rank không khớp với backend, hiển thị "UNRANKED" thay vì giá trị đã chọn

## Công việc tiếp theo

1. Cập nhật chức năng sửa tài khoản game với cách tiếp cận tương tự
2. Xem xét việc thống nhất quy ước đặt tên và giá trị giữa frontend và backend trong tương lai
3. Cân nhắc việc cập nhật các thành phần khác trong ứng dụng để sử dụng cách tiếp cận này
