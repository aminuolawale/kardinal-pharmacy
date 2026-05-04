import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getConfig } from "@/lib/config"
import { getAdmins, SUPER_ADMIN } from "@/lib/admins"
import { getSiteAuditLogs } from "@/lib/audit"
import AdminForms from "../AdminForms"
import { logout } from "../actions"

export default async function AdminPage() {
  const session = await auth()
  const userEmail = session?.user?.email?.toLowerCase() ?? ""
  if (!userEmail) redirect("/admin/login")

  const [config, { emails: admins }] = await Promise.all([getConfig(), getAdmins()])
  const isAllowedAdmin =
    userEmail === SUPER_ADMIN.toLowerCase() ||
    admins.some((email) => email.toLowerCase() === userEmail)

  if (!isAllowedAdmin) redirect("/admin/login")

  const auditLogs = userEmail === SUPER_ADMIN.toLowerCase()
    ? await getSiteAuditLogs()
    : []

  return (
    <div style={{ minHeight: "100vh" }}>
      <header className="admin-panel-header">
        <div className="admin-panel-brand">
          <span style={{ fontSize: "1.4rem" }}>💊</span>
          <span className="admin-panel-brand-text">
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

      <AdminForms config={config} userEmail={userEmail} admins={admins} auditLogs={auditLogs} />
    </div>
  )
}
