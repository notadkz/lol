import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
// import { PrismaAdapter } from "@auth/prisma-adapter"; // Comment out PrismaAdapter
import { prisma } from "@/lib/prisma";
// Xóa import CSRF không cần thiết
// import { csrf } from "@/lib/csrf";

// Định nghĩa kiểu Token thay vì sử dụng JWT
interface Token {
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpires?: number;
  error?: string;
  user?: {
    id: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
    isAdmin?: boolean;
    balance?: number;
    accountType?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

// Hàm để làm mới access token khi hết hạn
async function refreshAccessToken(token: Token) {
  try {
    if (!token.refreshToken) {
      throw new Error("No refresh token available");
    }

    const url = "https://oauth2.googleapis.com/token";

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID || "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      }),
    });

    const responseText = await response.text();
    let refreshedTokens;
    try {
      refreshedTokens = JSON.parse(responseText);
    } catch (e) {
      console.error("Không thể phân tích phản hồi JSON:", responseText);
      throw new Error("Invalid JSON response from token endpoint");
    }

    if (!response.ok) {
      console.error("Lỗi làm mới token");
      throw new Error(refreshedTokens.error || "Failed to refresh token");
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      // Chỉ thay thế refresh token nếu có một token mới được trả về
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error("Lỗi làm mới token");
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

// Định nghĩa các loại người dùng nếu cần
interface AdapterUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export const authOptions: NextAuthOptions = {
  // adapter: PrismaAdapter(prisma), // Xóa adapter để không phụ thuộc vào database
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile",
        },
      },
    }),
    // Thêm CredentialsProvider để hỗ trợ đăng nhập bằng email/password
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Mật khẩu", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Vui lòng nhập email và mật khẩu");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("Email hoặc mật khẩu không đúng");
        }

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordCorrect) {
          throw new Error("Email hoặc mật khẩu không đúng");
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          image: user.image,
          isAdmin: user.isAdmin,
          accountType: user.accountType,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 giờ thay vì 30 ngày
  },
  jwt: {
    maxAge: 8 * 60 * 60, // 8 giờ
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "strict", // Thay đổi từ "lax" thành "strict" để tăng cường bảo mật
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    csrfToken: {
      name: "next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "strict", // Bảo vệ CSRF
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  callbacks: {
    async jwt({ token, account, user }) {
      // Initial sign in
      if (account && user) {
        // Thêm thời gian hết hạn
        const nowInSeconds = Math.floor(Date.now() / 1000);
        const expiryTime = nowInSeconds + 8 * 60 * 60; // 8 giờ

        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: account.expires_at
            ? account.expires_at * 1000
            : Date.now() + 8 * 60 * 60 * 1000,
          exp: expiryTime,
          user,
        };
      }

      // Check if token is expired or about to expire
      // If token will expire in less than 1 day, refresh it
      const nowInSeconds = Math.floor(Date.now() / 1000);
      const tokenExp = token.exp as number;
      const tokenRemainingTime = tokenExp - nowInSeconds;

      // Nếu token còn hạn dưới 1 giờ hoặc đã hết hạn
      if (tokenRemainingTime < 60 * 60) {
        // Tạo thời gian mới (thêm 8 giờ)
        const newExpiryTime = nowInSeconds + 8 * 60 * 60;
        token.exp = newExpiryTime;

        // Nếu có refresh token, thử refresh
        if (token.refreshToken) {
          return refreshAccessToken(token);
        }
      }

      // Token vẫn còn hiệu lực và không cần làm mới
      if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
        return token;
      }

      return token;
    },
    async session({ session, token }: { session: any; token: Token }) {
      // Thêm thông tin từ token vào session
      if (token.user) {
        session.user.id = token.user.id;
        session.user.email = token.user.email;
        session.user.name = token.user.name;
        session.user.image = token.user.image;

        // Thêm thông tin custom nếu có
        if (token.user.isAdmin !== undefined) {
          session.user.isAdmin = token.user.isAdmin;
        }

        if (token.user.balance !== undefined) {
          session.user.balance = token.user.balance;
        }

        if (token.user.accountType !== undefined) {
          session.user.accountType = token.user.accountType;
        }
      }

      return session;
    },
    async redirect({ url, baseUrl }) {
      try {
        // Kiểm tra nếu là đường dẫn nội bộ thì nối với baseUrl
        if (url.startsWith("/")) {
          return `${baseUrl}${url}`;
        }

        // Nếu đã là URL đầy đủ và hợp lệ cùng domain, cho phép
        const parsedUrl = new URL(url);
        if (parsedUrl.origin === baseUrl) {
          return parsedUrl.href;
        }

        // Nếu không hợp lệ → fallback về baseUrl
        return baseUrl;
      } catch (err) {
        console.warn("⚠️ redirect callback lỗi URL:", url);
        return baseUrl;
      }
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
    signOut: "/auth/logout",
  },
  debug: process.env.NODE_ENV === "development",
  logger: {
    error(code, metadata) {
      console.error("NextAuth Error:", code, metadata);
    },
    warn(code) {
      console.warn("NextAuth Warning:", code);
    },
    debug(code, metadata) {
      console.log("NextAuth Debug:", code, metadata);
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
