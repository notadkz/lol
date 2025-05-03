"use client";

import { useState, useEffect } from "react";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { useAuth } from "@/hooks/useAuth";

export default function AvatarDropdown() {
  const [openDropdown, setOpenDropdown] = useState(false);
  const { session } = useAuth();

  // Log khi dropdown mở/đóng
  useEffect(() => {
    console.log("AvatarDropdown: dropdown state changed:", openDropdown);
  }, [openDropdown]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    if (!openDropdown) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        !target.closest("#avatar-dropdown") &&
        !target.closest("#avatar-btn")
      ) {
        console.log("AvatarDropdown: closing due to outside click");
        setOpenDropdown(false);
      }
    };

    console.log("AvatarDropdown: adding click listener");
    document.addEventListener("click", handleClickOutside);

    return () => {
      console.log("AvatarDropdown: removing click listener");
      document.removeEventListener("click", handleClickOutside);
    };
  }, [openDropdown]);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="nav-item p-0 hover:bg-none"
        id="avatar-btn"
        onClick={() => {
          console.log("AvatarDropdown: toggle dropdown");
          setOpenDropdown((v) => !v);
        }}
        aria-haspopup="true"
        aria-expanded={openDropdown}
      >
        {session && session.user?.image ? (
          <img
            src={session.user.image}
            alt="Avatar"
            className="w-10 h-10 rounded-full object-cover border"
          />
        ) : (
          <span className="w-10 h-10 flex items-center justify-center rounded-full bg-purple-600">
            <User className="h-6 w-6 text-white" />
          </span>
        )}
      </Button>

      {openDropdown && (
        <div
          className="absolute right-0 mt-2 w-56 bg-white dark:bg-black rounded-lg shadow-lg py-2 z-50 border"
          id="avatar-dropdown"
        >
          <a
            href="/account"
            className="block w-full text-left px-4 py-2 hover:bg-gray-100 hover:text-black"
            onClick={(e) => {
              console.log("AvatarDropdown: account clicked");
              // Không ngăn chặn hành vi mặc định để cho phép chuyển hướng
            }}
          >
            Tài khoản
          </a>
          <a
            href="/account/topup-history"
            className="block w-full text-left px-4 py-2 hover:bg-gray-100 hover:text-black"
            onClick={(e) => {
              console.log("AvatarDropdown: topup history clicked");
              // Không ngăn chặn hành vi mặc định để cho phép chuyển hướng
            }}
          >
            Lịch sử nạp tiền
          </a>
          <a
            href="/account/purchased"
            className="block w-full text-left px-4 py-2 hover:bg-gray-100 hover:text-black"
            onClick={(e) => {
              console.log("AvatarDropdown: purchased accounts clicked");
              // Không ngăn chặn hành vi mặc định để cho phép chuyển hướng
            }}
          >
            Tài khoản đã mua
          </a>
          <button
            className="w-full text-left px-4 py-2 hover:bg-gray-100 hover:text-red-600 text-red-600"
            onClick={() => {
              console.log("AvatarDropdown: logout clicked");
              setOpenDropdown(false);
              signOut({ callbackUrl: "/auth/login" });
            }}
          >
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}
