import "./globals.css";

export const metadata = {
  title: "ICT Day Papers Quiz | 2028",
  description: "Practice all 126 questions from ICT Day Papers PHY 01–21 in their original order.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="si">
      <body>{children}</body>
    </html>
  );
}
