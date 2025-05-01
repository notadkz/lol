import { Shield, CheckCircle, AlertCircle } from "lucide-react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function WarrantyPage() {
  return (
    <div className="container mx-auto px-4 py-24 mt-10">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Chính sách bảo hành</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Chúng tôi cam kết bảo vệ quyền lợi của khách hàng với chính sách bảo hành rõ ràng và minh bạch.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <Card className="border border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-col items-center text-center">
            <Shield className="h-12 w-12 text-primary mb-4" />
            <CardTitle>Bảo hành 30 ngày</CardTitle>
            <CardDescription>Tất cả tài khoản đều được bảo hành trong 30 ngày kể từ ngày mua.</CardDescription>
          </CardHeader>
        </Card>

        <Card className="border border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-col items-center text-center">
            <CheckCircle className="h-12 w-12 text-primary mb-4" />
            <CardTitle>Cam kết chất lượng</CardTitle>
            <CardDescription>Tài khoản đúng như mô tả, hoàn tiền 100% nếu không đúng.</CardDescription>
          </CardHeader>
        </Card>

        <Card className="border border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-col items-center text-center">
            <AlertCircle className="h-12 w-12 text-primary mb-4" />
            <CardTitle>Hỗ trợ 24/7</CardTitle>
            <CardDescription>Đội ngũ hỗ trợ luôn sẵn sàng giúp đỡ bạn mọi lúc mọi nơi.</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Câu hỏi thường gặp</h2>

        <Accordion type="single" collapsible className="mb-8">
          <AccordionItem value="item-1">
            <AccordionTrigger>Làm thế nào để kích hoạt bảo hành?</AccordionTrigger>
            <AccordionContent>
              Để kích hoạt bảo hành, bạn chỉ cần liên hệ với chúng tôi qua hotline hoặc email với mã đơn hàng. Chúng tôi
              sẽ xử lý yêu cầu của bạn trong vòng 24 giờ.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>Những trường hợp nào được bảo hành?</AccordionTrigger>
            <AccordionContent>
              Chúng tôi bảo hành trong các trường hợp: tài khoản bị khóa, thông tin tài khoản không đúng như mô tả,
              không thể đăng nhập, mất quyền truy cập, thiếu trang phục hoặc tướng so với mô tả.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger>Những trường hợp nào không được bảo hành?</AccordionTrigger>
            <AccordionContent>
              Chúng tôi không bảo hành trong các trường hợp: tài khoản bị khóa do vi phạm điều khoản của Riot Games,
              thay đổi thông tin tài khoản mà không thông báo, chia sẻ tài khoản cho người khác sử dụng, hết thời hạn
              bảo hành 30 ngày.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger>Quy trình bảo hành diễn ra như thế nào?</AccordionTrigger>
            <AccordionContent>
              Quy trình bảo hành gồm 3 bước: (1) Tiếp nhận yêu cầu bảo hành, (2) Kiểm tra và xác minh thông tin, (3) Xử
              lý bảo hành (cung cấp tài khoản mới hoặc hoàn tiền). Quy trình này thường mất 1-3 ngày làm việc.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5">
            <AccordionTrigger>Làm thế nào để bảo vệ tài khoản của tôi?</AccordionTrigger>
            <AccordionContent>
              Để bảo vệ tài khoản, bạn nên: thay đổi mật khẩu ngay sau khi nhận tài khoản, bật xác thực 2 lớp, không
              chia sẻ thông tin đăng nhập với người khác, không sử dụng phần mềm bên thứ ba không đáng tin cậy, và
              thường xuyên kiểm tra hoạt động đăng nhập.
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="bg-muted/50 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Liên hệ bảo hành</h3>
          <p className="text-muted-foreground mb-4">
            Nếu bạn cần hỗ trợ hoặc có thắc mắc về chính sách bảo hành, vui lòng liên hệ với chúng tôi qua:
          </p>
          <ul className="space-y-2">
            <li className="flex items-center">
              <span className="font-medium mr-2">Email:</span>
              <span className="text-primary">support@lolaccounts.vn</span>
            </li>
            <li className="flex items-center">
              <span className="font-medium mr-2">Hotline:</span>
              <span className="text-primary">0123.456.789</span>
            </li>
            <li className="flex items-center">
              <span className="font-medium mr-2">Giờ làm việc:</span>
              <span>8:00 - 22:00 (Thứ 2 - Chủ nhật)</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
