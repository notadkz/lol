"use client";

import { useState } from "react";
import { useApiDebug } from "@/hooks/useApiDebug";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

export default function ApiDebugPanel() {
  const [visible, setVisible] = useState(false);
  const latestApiUrl =
    "/api/products?limit=4&sortBy=createdAt&sortOrder=desc&status=AVAILABLE";
  const featuredApiUrl = "/api/products?limit=4&featured=true&status=AVAILABLE";
  const [testUrl, setTestUrl] = useState("");
  const [runTest, setRunTest] = useState(false);

  const {
    data: latestData,
    structure: latestStructure,
    loading: latestLoading,
    error: latestError,
  } = useApiDebug(latestApiUrl);

  const {
    data: featuredData,
    structure: featuredStructure,
    loading: featuredLoading,
    error: featuredError,
  } = useApiDebug(featuredApiUrl);

  const {
    data: testData,
    structure: testStructure,
    loading: testLoading,
    error: testError,
  } = useApiDebug(runTest && testUrl ? testUrl : "");

  // Kiểm tra cấu trúc dữ liệu
  const checkDataStructure = (data: any) => {
    if (!data) return { valid: false, message: "Dữ liệu trống" };

    // Kiểm tra nếu data có trường data là array
    if (data.data && Array.isArray(data.data)) {
      return { valid: true, message: "Cấu trúc chuẩn có data là array" };
    }

    // Kiểm tra nếu data.data tồn tại nhưng không phải array
    if (data.data && !Array.isArray(data.data)) {
      if (data.data.items && Array.isArray(data.data.items)) {
        return { valid: true, message: "Có mảng trong data.items" };
      }

      // Kiểm tra các keys trong data.data
      if (typeof data.data === "object") {
        const arrayKeys = Object.keys(data.data).filter((key) =>
          Array.isArray(data.data[key])
        );
        if (arrayKeys.length > 0) {
          return { valid: true, message: `Có mảng trong data.${arrayKeys[0]}` };
        }
      }

      return {
        valid: false,
        message: "data tồn tại nhưng không phải array hoặc không chứa mảng",
      };
    }

    // Kiểm tra nếu data chính là array
    if (Array.isArray(data)) {
      return { valid: true, message: "Dữ liệu là array trực tiếp" };
    }

    // Kiểm tra các keys xem có array không
    if (typeof data === "object") {
      const arrayKeys = Object.keys(data).filter((key) =>
        Array.isArray(data[key])
      );
      if (arrayKeys.length > 0) {
        return { valid: true, message: `Có mảng trong ${arrayKeys[0]}` };
      }
    }

    return { valid: false, message: "Không tìm thấy cấu trúc mảng nào" };
  };

  const latestStructureCheck = latestData
    ? checkDataStructure(latestData)
    : { valid: false, message: "Đang tải" };
  const featuredStructureCheck = featuredData
    ? checkDataStructure(featuredData)
    : { valid: false, message: "Đang tải" };
  const testStructureCheck = testData
    ? checkDataStructure(testData)
    : { valid: false, message: "Chưa kiểm tra" };

  if (!visible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setVisible(true)}
          variant="outline"
          className="bg-destructive/20 text-destructive"
        >
          Debug API
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 overflow-auto p-4">
      <Card className="max-w-4xl mx-auto mb-20">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>API Debug Panel - Kiểm tra chi tiết API</CardTitle>
          <Button variant="outline" onClick={() => setVisible(false)}>
            Đóng
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Thêm kiểm tra API tùy chỉnh */}
            <div className="space-y-4 mb-6 p-4 bg-muted rounded-md">
              <h3 className="font-bold">Kiểm tra API tùy chỉnh:</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={testUrl}
                  onChange={(e) => setTestUrl(e.target.value)}
                  placeholder="Nhập URL API cần kiểm tra"
                  className="flex-1 px-3 py-2 border rounded-md"
                />
                <Button
                  onClick={() => {
                    setRunTest(false);
                    setTimeout(() => setRunTest(true), 100);
                  }}
                  disabled={!testUrl}
                >
                  Kiểm tra
                </Button>
              </div>

              {runTest && testUrl && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span>Kết quả: </span>
                    {testLoading ? (
                      <span className="text-muted-foreground">
                        Đang kiểm tra...
                      </span>
                    ) : testError ? (
                      <div className="flex items-center text-destructive gap-1">
                        <XCircle className="h-4 w-4" />
                        <span>Lỗi: {testError}</span>
                      </div>
                    ) : (
                      <div
                        className="flex items-center gap-1"
                        style={{
                          color: testStructureCheck.valid ? "green" : "orange",
                        }}
                      >
                        {testStructureCheck.valid ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <AlertCircle className="h-4 w-4" />
                        )}
                        <span>{testStructureCheck.message}</span>
                      </div>
                    )}
                  </div>

                  {testData && (
                    <Accordion type="single" collapsible>
                      <AccordionItem value="test-data">
                        <AccordionTrigger>
                          Xem chi tiết dữ liệu
                        </AccordionTrigger>
                        <AccordionContent>
                          <pre className="text-xs whitespace-pre-wrap">
                            {JSON.stringify(testData, null, 2)}
                          </pre>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-muted p-4 rounded-md">
                <h3 className="font-bold mb-2">Latest Accounts API:</h3>
                <div className="flex items-center gap-2 mb-2">
                  <span>Tình trạng: </span>
                  {latestLoading ? (
                    <span className="text-muted-foreground">Đang tải...</span>
                  ) : latestError ? (
                    <div className="flex items-center text-destructive gap-1">
                      <XCircle className="h-4 w-4" />
                      <span>Lỗi</span>
                    </div>
                  ) : (
                    <div
                      className="flex items-center gap-1"
                      style={{
                        color: latestStructureCheck.valid ? "green" : "orange",
                      }}
                    >
                      {latestStructureCheck.valid ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <AlertCircle className="h-4 w-4" />
                      )}
                      <span>{latestStructureCheck.message}</span>
                    </div>
                  )}
                </div>
                <div className="text-xs overflow-hidden text-ellipsis">
                  <strong>URL:</strong> {latestApiUrl}
                </div>
              </div>

              <div className="bg-muted p-4 rounded-md">
                <h3 className="font-bold mb-2">Featured Accounts API:</h3>
                <div className="flex items-center gap-2 mb-2">
                  <span>Tình trạng: </span>
                  {featuredLoading ? (
                    <span className="text-muted-foreground">Đang tải...</span>
                  ) : featuredError ? (
                    <div className="flex items-center text-destructive gap-1">
                      <XCircle className="h-4 w-4" />
                      <span>Lỗi</span>
                    </div>
                  ) : (
                    <div
                      className="flex items-center gap-1"
                      style={{
                        color: featuredStructureCheck.valid
                          ? "green"
                          : "orange",
                      }}
                    >
                      {featuredStructureCheck.valid ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <AlertCircle className="h-4 w-4" />
                      )}
                      <span>{featuredStructureCheck.message}</span>
                    </div>
                  )}
                </div>
                <div className="text-xs overflow-hidden text-ellipsis">
                  <strong>URL:</strong> {featuredApiUrl}
                </div>
              </div>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="latest">
                <AccordionTrigger>
                  <div className="flex justify-between w-full">
                    <span>Chi tiết Latest Accounts API</span>
                    {latestLoading ? (
                      <span className="text-muted-foreground">Loading...</span>
                    ) : latestError ? (
                      <span className="text-destructive">Error</span>
                    ) : (
                      <span className="text-green-500">✓</span>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="p-4 rounded bg-muted overflow-x-auto">
                    <h3 className="font-bold mb-2">API URL:</h3>
                    <pre className="text-xs mb-4">{latestApiUrl}</pre>

                    {latestError && (
                      <div className="mb-4 p-2 bg-destructive/20 text-destructive rounded">
                        <h3 className="font-bold">Error:</h3>
                        <pre className="text-xs">{latestError}</pre>
                      </div>
                    )}

                    {latestStructure && (
                      <div className="mb-4">
                        <h3 className="font-bold mb-2">Response Structure:</h3>
                        <pre className="text-xs whitespace-pre-wrap">
                          {latestStructure}
                        </pre>
                      </div>
                    )}

                    {latestData && (
                      <div>
                        <h3 className="font-bold mb-2">Raw Response:</h3>
                        <pre className="text-xs whitespace-pre-wrap">
                          {JSON.stringify(latestData, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="featured">
                <AccordionTrigger>
                  <div className="flex justify-between w-full">
                    <span>Chi tiết Featured Accounts API</span>
                    {featuredLoading ? (
                      <span className="text-muted-foreground">Loading...</span>
                    ) : featuredError ? (
                      <span className="text-destructive">Error</span>
                    ) : (
                      <span className="text-green-500">✓</span>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="p-4 rounded bg-muted overflow-x-auto">
                    <h3 className="font-bold mb-2">API URL:</h3>
                    <pre className="text-xs mb-4">{featuredApiUrl}</pre>

                    {featuredError && (
                      <div className="mb-4 p-2 bg-destructive/20 text-destructive rounded">
                        <h3 className="font-bold">Error:</h3>
                        <pre className="text-xs">{featuredError}</pre>
                      </div>
                    )}

                    {featuredStructure && (
                      <div className="mb-4">
                        <h3 className="font-bold mb-2">Response Structure:</h3>
                        <pre className="text-xs whitespace-pre-wrap">
                          {featuredStructure}
                        </pre>
                      </div>
                    )}

                    {featuredData && (
                      <div>
                        <h3 className="font-bold mb-2">Raw Response:</h3>
                        <pre className="text-xs whitespace-pre-wrap">
                          {JSON.stringify(featuredData, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="space-y-2">
              <h3 className="font-bold">Các trường hợp cần kiểm tra:</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  Kiểm tra cấu trúc dữ liệu trả về từ API có đúng định dạng
                  không
                </li>
                <li>
                  Xác nhận API trả về mảng <code>data</code> hay không
                </li>
                <li>
                  Kiểm tra các trường dữ liệu cần thiết (id, level, price, etc.)
                </li>
                <li>Xác nhận tham số query API đúng không</li>
                <li>
                  Kiểm tra nếu cấu trúc không chuẩn, app có thể phục hồi không
                </li>
              </ul>
            </div>

            <div className="bg-muted/50 p-4 rounded-md text-sm">
              <h3 className="font-bold mb-2">
                Giải pháp nếu API không đúng cấu trúc:
              </h3>
              <ol className="list-decimal pl-6 space-y-1">
                <li>Kiểm tra endpoint API có chính xác không</li>
                <li>Xác nhận API server đang hoạt động</li>
                <li>Kiểm tra cấu trúc JSON từ API server</li>
                <li>
                  Cải thiện xử lý lỗi trong code client để handle bất cứ cấu
                  trúc dữ liệu nào
                </li>
                <li>Liên hệ đội backend để thống nhất cấu trúc API</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
