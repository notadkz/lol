# Tóm tắt cập nhật xử lý JWT trong Next Auth

## Cách triển khai JWT hiện tại

Hệ thống hiện tại sử dụng NextAuth.js để xử lý quá trình xác thực với Google OAuth. Dưới đây là quy trình xử lý JWT trong hệ thống:

### 1. Thiết lập Type Definitions

File `types/next-auth.d.ts` định nghĩa các interface cho Session, User và JWT:

```typescript
import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    error?: string;
    user: {
      id?: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    userId?: string;
    email?: string;
    error?: string;
  }
}
```

### 2. Cấu hình NextAuth

File `src/app/api/auth/[nextauth].ts` thiết lập cấu hình NextAuth và các callback xử lý JWT:

```typescript
export const authOptions: NextAuthOptions = {
  // Cấu hình provider và các tùy chọn khác...

  callbacks: {
    async jwt({ token, account, user }) {
      // Khi đăng nhập lần đầu, lưu token và các thông tin cần thiết
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: account.expires_at
            ? account.expires_at * 1000
            : undefined,
          userId: user.id,
        };
      }

      // Kiểm tra token hết hạn và làm mới nếu cần
      if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
        return token;
      }

      // Làm mới token khi hết hạn
      return refreshAccessToken(token);
    },

    async session({ session, token }) {
      // Cập nhật thông tin session từ token cho client
      session.accessToken = token.accessToken;
      session.error = token.error;

      if (token.userId && session.user) {
        session.user.id = token.userId;
      }

      return session;
    },
  },
};
```

### 3. Hàm RefreshToken

```typescript
async function refreshAccessToken(token: JWT) {
  try {
    // Gọi API Google để làm mới token
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID || "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
        grant_type: "refresh_token",
        refresh_token: token.refreshToken || "",
      }),
    });

    const refreshedTokens = await response.json();

    // Trả về token đã cập nhật
    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    // Xử lý lỗi
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}
```

### 4. Sử dụng Session ở Client-side

Ở phía client, chúng ta sử dụng hook `useAuth` để truy cập session:

```typescript
export function useAuth() {
  const { data: session, status } = useSession();

  // Các chức năng đăng nhập, đăng xuất...

  return {
    session,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    // Các function khác...
  };
}
```

## Thay đổi đã thực hiện

1. **Loại bỏ định nghĩa trùng lặp**: Đã xóa các định nghĩa interface trùng lặp trong file `[nextauth].ts` vì chúng đã được định nghĩa trong file `types/next-auth.d.ts`.

2. **Đơn giản hóa file callback**: Đã cập nhật file `src/app/api/auth/google/callback/route.ts` để loại bỏ các comment thừa và code không cần thiết.

3. **Cải thiện tính nhất quán**: Đảm bảo các interface Session, User và JWT được định nghĩa nhất quán trong hệ thống.

## Cách truy cập JWT Token từ Client

Để sử dụng JWT token trong client, sử dụng `useAuth` hook:

```typescript
import { useAuth } from "@/hooks/useAuth";

function MyComponent() {
  const { session, isAuthenticated } = useAuth();

  if (isAuthenticated && session?.accessToken) {
    // Sử dụng token để gọi API
    // Ví dụ: Thêm Authorization header
    // headers: { Authorization: `Bearer ${session.accessToken}` }
  }

  return (
    // JSX component
  );
}
```
