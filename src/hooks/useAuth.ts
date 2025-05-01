import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Đăng nhập với provider (Google, Facebook, ...)
  const login = async (provider: string, options = {}) => {
    try {
      await signIn(provider, {
        callbackUrl: "/",
        ...options,
      });
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
    }
  };

  // Đăng nhập với email và mật khẩu (nếu có provider credentials)
  const loginWithCredentials = async (
    email: string,
    password: string,
    callbackUrl = "/"
  ) => {
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        return { success: false, error: result.error };
      }

      router.push(callbackUrl);
      return { success: true };
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      return { success: false, error: "Đã xảy ra lỗi khi đăng nhập" };
    }
  };

  // Đăng xuất
  const logout = async (callbackUrl = "/auth/login") => {
    try {
      await signOut({ callbackUrl });
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
    }
  };

  return {
    session,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    login,
    loginWithCredentials,
    logout,
  };
}
