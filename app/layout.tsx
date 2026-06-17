import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, Settings, BarChart3 } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lead-Generation-Bot Dashboard",
  description: "Internal AI-powered Lead Intelligence Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={cn(inter.className, "bg-gray-50 text-gray-900")}>
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <aside className="w-64 border-r bg-white flex flex-col fixed inset-y-0">
            <div className="p-6 border-b">
              <h1 className="text-xl font-bold text-blue-600">Lead-Generation-Bot</h1>
            </div>
            <nav className="flex-1 p-4 space-y-2">
              <a href="/" className="flex items-center space-x-3 p-2 bg-blue-50 text-blue-700 rounded-lg">
                <LayoutDashboard className="h-5 w-5" />
                <span className="font-medium">Dashboard</span>
              </a>
              <a href="#" className="flex items-center space-x-3 p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                <Users className="h-5 w-5" />
                <span className="font-medium">Leads</span>
              </a>
              <a href="#" className="flex items-center space-x-3 p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                <BarChart3 className="h-5 w-5" />
                <span className="font-medium">Analytics</span>
              </a>
            </nav>
            <div className="p-4 border-t">
              <a href="#" className="flex items-center space-x-3 p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                <Settings className="h-5 w-5" />
                <span className="font-medium">Settings</span>
              </a>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 ml-64 p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
