# Tóm tắt sửa lỗi chuyển hướng trong dropdown

## Vấn đề

Các button trong dropdown của header không thực hiện chuyển hướng khi được nhấn vào, mặc dù các trang đích đã tồn tại.

## Nguyên nhân

Vấn đề nằm ở cách triển khai router.push() trong Next.js. Trong phiên bản Next.js 15+ (dự án đang sử dụng 15.2.4), router.push() có thể không hoạt động đúng cách trong một số trường hợp, đặc biệt là khi được gọi từ sự kiện onClick của button.

## Giải pháp

Thay thế việc sử dụng button + router.push() bằng component Link từ Next.js:

1. Thay đổi từ:

```tsx
<button
  onClick={() => {
    setOpenDropdown(false);
    router.push("/account");
  }}
>
  Tài khoản
</button>
```

2. Sang:

```tsx
<Link href="/account" onClick={() => setOpenDropdown(false)}>
  Tài khoản
</Link>
```

## Lợi ích của giải pháp

1. Sử dụng `Link` là cách được khuyến nghị chính thức trong Next.js
2. Link hoạt động với client-side navigation, cải thiện UX
3. Link được Next.js tối ưu hóa với prefetching

## Đã áp dụng thay đổi cho

1. Link đến `/account`
2. Link đến `/account/topup-history`
3. Link đến `/account/purchased`

Riêng nút "Đăng xuất" vẫn giữ là `button` vì nó sử dụng hàm signOut() từ next-auth mà không thực hiện chuyển hướng trực tiếp.
