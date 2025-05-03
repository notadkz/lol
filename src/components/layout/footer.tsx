import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-bold">LOL Accounts</h3>
            <p className="text-muted-foreground text-sm">
              Chuyên cung cấp tài khoản Liên Minh Huyền Thoại chất lượng, uy
              tín, giá tốt nhất thị trường.
            </p>
            <div className="flex space-x-4">
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary"
              >
                <Facebook className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary"
              >
                <Instagram className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary"
              >
                <Twitter className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold">Liên kết</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-primary text-sm"
                >
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="text-muted-foreground hover:text-primary text-sm"
                >
                  Tài khoản
                </Link>
              </li>
              <li>
                <Link
                  href="/warranty"
                  className="text-muted-foreground hover:text-primary text-sm"
                >
                  Bảo hành
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-primary text-sm"
                >
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold">Chính sách</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/warranty"
                  className="text-muted-foreground hover:text-primary text-sm"
                >
                  Chính sách bảo hành
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-primary text-sm"
                >
                  Điều khoản sử dụng
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-primary text-sm"
                >
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-primary text-sm"
                >
                  Phương thức thanh toán
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold">Liên hệ</h3>
            <ul className="space-y-2">
              <li className="text-muted-foreground text-sm">
                Email: phancongchau80fm@gmail.com
              </li>
              <li className="text-muted-foreground text-sm">
                Hotline: 0783.324.234
              </li>
              <li className="text-muted-foreground text-sm">
                Giờ làm việc: 8:00 - 22:00
              </li>
              <li className="text-muted-foreground text-sm">Hỗ trợ: 24/7</li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-muted-foreground text-sm">
          <p>
            © {new Date().getFullYear()} LOL Accounts. Tất cả các quyền được bảo
            lưu.
          </p>
        </div>
      </div>
    </footer>
  );
}
