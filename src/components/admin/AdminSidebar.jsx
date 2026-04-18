import { NavLink } from "react-router-dom";

const menuItems = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/students", label: "Daftar Siswa" },
  { to: "/admin/students/new", label: "Tambah Siswa" },
  { to: "/admin/packages", label: "Paket" },
  { to: "/admin/progress", label: "Progress" },
  { to: "/admin/live-sessions", label: "Live Sessions" },
  { to: "/admin/enrollments", label: "Enrollments" }
];

export default function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <div className="admin-brand">Neratix Admin</div>
      <nav className="admin-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `admin-nav-link ${isActive ? "active" : ""}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
