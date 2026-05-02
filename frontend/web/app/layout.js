import "./globals.css";

export const metadata = {
  title: "Uncognito",
  description: "Opt-in browser accountability roasts for hackathon demos.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
