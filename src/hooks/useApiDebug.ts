import { useState, useEffect } from "react";

export function useApiDebug(url: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [structure, setStructure] = useState<string | null>(null);

  useEffect(() => {
    const debugApi = async () => {
      try {
        setLoading(true);
        console.log("Đang gọi API debug:", url);

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        // Lưu kết quả
        setData(result);

        // Phân tích cấu trúc
        const analyzeStructure = (obj: any, path = ""): string => {
          if (obj === null) return `${path}: null\n`;
          if (obj === undefined) return `${path}: undefined\n`;

          if (Array.isArray(obj)) {
            if (obj.length === 0) return `${path}: [] (empty array)\n`;
            return `${path}: Array[${obj.length}]\n${analyzeStructure(
              obj[0],
              `${path}[0]`
            )}`;
          }

          if (typeof obj === "object") {
            return Object.keys(obj)
              .map((key) =>
                analyzeStructure(obj[key], path ? `${path}.${key}` : key)
              )
              .join("");
          }

          return `${path}: ${typeof obj} (${String(obj).substring(0, 30)}${
            String(obj).length > 30 ? "..." : ""
          })\n`;
        };

        setStructure(analyzeStructure(result));
      } catch (err) {
        console.error("Debug API error:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    debugApi();
  }, [url]);

  return { data, loading, error, structure };
}
