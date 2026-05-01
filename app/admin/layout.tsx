import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin — Kardinal Pharmacy",
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--green-50)", minHeight: "100vh" }}>
      {children}
    </div>
  )
}
