import AdminHeader from "../../components/admin/AdminHeader";
import AdminSidebar from "../../components/admin/AdminSidebar";
import "../../styles/admin.css";
import "../../styles/dashboard.css";

export default function AdminLayout({ title, subtitle, adminName, children }) {
  return (
    <div className="admin-shell">
      <AdminSidebar />
      <main className="admin-main">
        <AdminHeader title={title} subtitle={subtitle} adminName={adminName} />
        <section className="admin-content">{children}</section>
      </main>
    </div>
  );
}
