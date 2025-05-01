# Đánh giá và Cải thiện quản lý JWT token trong OAuth

## Hiện trạng đăng nhập OAuth

Hiện tại, dự án đã tích hợp xác thực OAuth thông qua Google theo hai cách tiếp cận:

### 1. Cách tiếp cận tự triển khai

- Sử dụng API routes trong Next.js để xử lý xác thực Google OAuth
- Các endpoints chính:
  - `GET /api/auth/google`: Khởi tạo quá trình xác thực Google
  - `POST /api/auth/google`: Xử lý token và trả về thông tin user
  - `GET /api/auth/google/callback`: Xử lý callback từ Google sau xác thực

Trong cách tiếp cận này, token được xử lý khá đơn giản:

```javascript
// Đoạn code trong /api/auth/google/callback/route.ts
const redirectUrl = new URL("/", request.nextUrl.origin);
redirectUrl.searchParams.append("token", "sample_jwt_token"); // Token thực sẽ được tạo dựa trên userData
```

### 2. Cách tiếp cận sử dụng NextAuth.js

- Cấu hình trong `/api/auth/[nextauth].ts`
- Sử dụng session strategy "jwt" và tích hợp Google Provider

## Vấn đề trong quản lý JWT hiện tại

1. **Không nhất quán trong phương pháp lưu trữ token**:

   - Tự triển khai: Truyền token thông qua query parameter, không an toàn
   - NextAuth: Lưu trong cookie HttpOnly (an toàn hơn)

2. **Thiếu các bước tạo JWT thực sự**:

   - Chưa có quá trình mã hóa và ký token JWT thực tế
   - Đang sử dụng "sample_jwt_token" thay vì tạo token thực

3. **Không rõ ràng trong việc phân biệt các loại token**:

   - Access token từ Google
   - JWT token nội bộ của ứng dụng
   - Refresh token (chưa được xử lý)

4. **Chưa có cơ chế kiểm tra và làm mới token**:
   - Không có middleware để kiểm tra tính hợp lệ của token
   - Không xử lý refresh token để duy trì phiên đăng nhập

## Đề xuất cải thiện

### 1. Thống nhất phương pháp xác thực

Nên sử dụng **NextAuth.js** như là phương pháp chính vì:

- Tích hợp sẵn các bước bảo mật cần thiết
- Xử lý cookie và session an toàn
- Dễ mở rộng với nhiều provider khác

### 2. Cải thiện cấu hình NextAuth

```javascript
// Cấu hình NextAuth cải tiến
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // Thêm các providers khác nếu cần
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 ngày
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    // Tùy chỉnh mã hóa và ký token nếu cần
  },
  callbacks: {
    async jwt({ token, account, user }) {
      // Ban đầu khi đăng nhập
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: account.expires_at * 1000,
          userId: user.id, // Lưu ID người dùng từ database
          role: user.role, // Lưu vai trò người dùng
        };
      }

      // Kiểm tra và refresh token nếu hết hạn
      if (Date.now() < token.accessTokenExpires) {
        return token;
      }

      // Nếu token hết hạn, refresh token
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      // Thêm thông tin token vào session
      session.user.id = token.userId;
      session.user.role = token.role;
      session.accessToken = token.accessToken;
      session.error = token.error;

      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
};
```

### 3. Thêm hàm refresh token

```javascript
async function refreshAccessToken(token) {
  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}
```

### 4. Tạo middleware để bảo vệ route

Tạo file `middleware.ts` ở thư mục gốc:

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const session = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Nếu không có session, redirect về trang login
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Kiểm tra các quyền truy cập dựa vào vai trò
  // (nếu cần)

  return NextResponse.next();
}

// Chỉ apply middleware cho các routes cần bảo vệ
export const config = {
  matcher: ["/products/:path*", "/profile/:path*", "/admin/:path*"],
};
```

### 5. Cải thiện trong component UI

Tạo hook riêng để xử lý đăng nhập và đăng xuất:

```typescript
// src/hooks/useAuth.ts
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const login = async (provider: string) => {
    await signIn(provider, { callbackUrl: "/" });
  };

  const logout = async () => {
    await signOut({ callbackUrl: "/auth/login" });
  };

  return {
    session,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    login,
    logout,
  };
}
```

### 6. Loại bỏ các phương pháp không an toàn

Nên loại bỏ các phương pháp lưu trữ token không an toàn:

- Không truyền token qua URL query
- Không lưu token vào localStorage
- Nên sử dụng httpOnly, secure cookie thông qua NextAuth
