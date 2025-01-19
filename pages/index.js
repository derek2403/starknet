import Image from "next/image";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function Home() {
  return (
    <div className={inter.className}>
      <h1>Hello Starknet</h1>
    </div>
  );
}
