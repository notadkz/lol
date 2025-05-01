import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  const body = await req.json();
  const { name, email, phone, subject, message } = body;

  console.log("👉 Nhận được request gửi mail:", body); // log thông tin nhận được

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"Website Contact" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_RECEIVER, // hoặc process.env.GMAIL_USER nếu bạn test
      subject: `📨 Liên hệ từ website của bạn: ${subject}`,
      html: `
  <div style="background: linear-gradient(to bottom right, #ff6b00, #ff9900); padding: 40px 0;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 12px; overflow: hidden; font-family: Arial, sans-serif; box-shadow: 0 5px 25px rgba(0,0,0,0.1);">

      <div style="background-color: #fff3e0; padding: 30px; text-align: center;">
        <h1 style="color: #e65100; font-size: 22px;">Bạn có tin nhắn mới!</h1>
        <p style="color: #555;">Thông tin từ form liên hệ trên website của bạn.</p>
      </div>

      <div style="padding: 30px;">
        <table style="width: 100%; font-size: 15px; line-height: 1.6;">
          <tr>
            <td style="font-weight: bold;">👤 Họ tên:</td>
            <td>${name}</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">📧 Email:</td>
            <td>${email}</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">📞 Số điện thoại:</td>
            <td>${phone}</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">📌 Chủ đề:</td>
            <td>${subject}</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">💬 Tin nhắn:</td>
            <td>${message}</td>
          </tr>
        </table>

        <div style="text-align: center; margin-top: 30px;">
          <a href="http://localhost:3000/" style="background: #ff6b00; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold;">Truy cập quản lý phản hồi</a>
        </div>
      </div>

      <div style="background-color: #f5f5f5; text-align: center; padding: 20px; font-size: 13px; color: #999;">
        © ${new Date().getFullYear()} YourCompany. Email này được gửi từ hệ thống tự động.
      </div>
    </div>
  </div>
`,
    });

    console.log("✅ Email đã được gửi:", info); // kiểm tra phản hồi

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Lỗi khi gửi mail:", error); // rất quan trọng để xem lý do
    return NextResponse.json(
      { success: false, error: "Gửi email thất bại." },
      { status: 500 }
    );
  }
}
