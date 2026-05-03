import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getConfig } from "@/lib/config"
import { getAdmins } from "@/lib/admins"
import AdminForms from "./AdminForms"
import { logout } from "./actions"

export default async function AdminPage() {
  const session = await auth()
  if (!session) redirect("/admin/login")

  const [config, { emails: admins }] = await Promise.all([getConfig(), getAdmins()])
  const userEmail = session.user?.email ?? ""

  return (
    <div style={{ minHeight: "100vh" }}>
      <header style={{
        background: "var(--green-800)",
        color: "var(--white)",
        padding: "0 32px",
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 50,
        boxShadow: "0 2px 12px rgba(0,0,0,.15)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: "1.4rem" }}>💊</span>
          <span style={{ fontWeight: 700, fontSize: "1rem", letterSpacing: "-.01em" }}>
            Kardinal <span style={{ color: "var(--gold)", fontWeight: 400 }}>Admin</span>
          </span>
        </div>

        <form action={logout}>
          <button
            type="submit"
            style={{
              background: "rgba(255,255,255,.12)",
              border: "1px solid rgba(255,255,255,.2)",
              color: "var(--white)",
              borderRadius: "50px",
              padding: "6px 16px",
              fontSize: "0.8rem",
              fontFamily: "var(--font)",
              cursor: "pointer",
            }}
          >
            Sign out
          </button>
        </form>
      </header>

      <AdminForms config={config} userEmail={userEmail} admins={admins} />
    </div>
  )
}
