import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import StudentForm from "../../components/admin/StudentForm";
import AdminLayout from "./AdminLayout";
import { createStudentAuthAccount, watchAuthState } from "../../services/authService";
import { createInitialProgressForStudent } from "../../services/progressService";
import {
  createStudentProfile,
  getUserById,
  getUserDataByEmail,
  updateStudentProfile
} from "../../services/usersService";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function AdminStudentForm() {
  const query = useQuery();
  const editId = query.get("edit");
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState("Admin");
  const [initialValues, setInitialValues] = useState({
    name: "",
    email: "",
    password: "",
    packages: []
  });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const unsub = watchAuthState(async (user) => {
      if (!user?.email) return;
      const profile = await getUserDataByEmail(user.email);
      setAdminName(profile?.name || "Admin");
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    async function loadEditData() {
      if (!editId) return;
      const user = await getUserById(editId);
      if (!user) return;
      setInitialValues({
        name: user.name || "",
        email: user.email || "",
        password: "",
        packages: Array.isArray(user.packages) ? user.packages : []
      });
    }

    loadEditData();
  }, [editId]);

  async function handleSubmit(formValues) {
    setLoading(true);

    try {
      if (editId) {
        console.log("[AdminStudentForm] Step 1: update profile", formValues.email);
        await updateStudentProfile(editId, {
          name: formValues.name,
          email: formValues.email,
          packages: formValues.packages
        });
        console.log("[AdminStudentForm] Step 2: sync initial progress", formValues.email);
        await createInitialProgressForStudent(formValues.email, formValues.packages);
      } else {
        console.log("[AdminStudentForm] Step 1: create auth account", formValues.email);
        await createStudentAuthAccount(formValues.email, formValues.password);
        console.log("[AdminStudentForm] Step 2: create firestore profile", formValues.email);
        await createStudentProfile({
          name: formValues.name,
          email: formValues.email,
          packages: formValues.packages
        });
        console.log("[AdminStudentForm] Step 3: create initial progress", formValues.email);
        await createInitialProgressForStudent(formValues.email, formValues.packages);
      }

      setSuccessMessage(editId ? "Data siswa berhasil diperbarui." : "Siswa berhasil ditambahkan.");
    } catch (error) {
      console.error("[AdminStudentForm] gagal menyimpan siswa:", error);
      const code = typeof error?.code === "string" ? error.code : "";
      let message = "Gagal menyimpan data siswa.";

      if (code === "auth/email-already-in-use") {
        message = "Email sudah terdaftar di Firebase Auth.";
      } else if (code === "auth/weak-password") {
        message = "Password terlalu lemah (minimal 6 karakter).";
      } else if (code === "permission-denied") {
        message = "Akses Firestore ditolak (permission-denied). Cek security rules.";
      } else if (code === "auth/operation-not-allowed") {
        message = "Email/Password Auth belum aktif di Firebase Authentication.";
      } else if (typeof error?.message === "string" && error.message.trim()) {
        message = `${message} ${error.message}`;
      }

      alert(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminLayout
      title={editId ? "Edit Siswa" : "Tambah Siswa Baru"}
      subtitle="Buat akun student, set paket, dan generate progress awal"
      adminName={adminName}
    >
      <div className="admin-card">
        {loading && <p>Memproses...</p>}
        <StudentForm
          initialValues={initialValues}
          onSubmit={handleSubmit}
          submitLabel={editId ? "Update Siswa" : "Simpan Siswa"}
          hidePassword={Boolean(editId)}
        />
      </div>

      {successMessage && (
        <div className="admin-popup-overlay" role="dialog" aria-modal="true" aria-labelledby="success-popup-title">
          <div className="admin-popup-card">
            <div className="admin-popup-icon" aria-hidden="true">
              ✓
            </div>
            <h3 id="success-popup-title">Berhasil</h3>
            <p>{successMessage}</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate("/admin/students", { replace: true })}
            >
              Lihat Daftar Siswa
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
