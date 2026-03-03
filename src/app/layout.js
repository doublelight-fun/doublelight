import { Web3Provider } from "./providers";

export const metadata = {
  title: "DoubleLight — Private Swap on Republic AI",
  description:
    "Privacy-first decentralized token swap on Republic AI Network. Shield, swap, and unshield with zero-knowledge privacy.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&family=Manrope:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  );
}
