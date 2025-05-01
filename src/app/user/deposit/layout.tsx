import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Nạp tiền vào tài khoản",
  description: "Nạp tiền vào tài khoản để mua tài khoản game",
};

export default function DepositLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
