export interface Product {
  id: string;
  name: string;
  level: number;
  skins: number;
  blueEssence: number;
  orangeEssence: number;
  rp: number;
  tftPets: number;
  price: number;
  status: "available" | "sold";
  images: string[];
  description: string;
  rank?: string;
  champions?: number;
  featured?: boolean;
}
