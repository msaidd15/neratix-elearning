import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/shared/ProtectedRoute";
import LegacyLessonRedirect from "../components/LegacyLessonRedirect";
import CoursePage from "../pages/CoursePage";
import FaktaRobotikPage from "../pages/FaktaRobotikPage";
import LessonPage from "../pages/LessonPage";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminEnrollments from "../pages/admin/AdminEnrollments";
import AdminLiveSessions from "../pages/admin/AdminLiveSessions";
import AdminLogin from "../pages/admin/AdminLogin";
import AdminPackages from "../pages/admin/AdminPackages";
import AdminProgress from "../pages/admin/AdminProgress";
import AdminStudentForm from "../pages/admin/AdminStudentForm";
import AdminStudents from "../pages/admin/AdminStudents";
import CourseDetail from "../pages/student/CourseDetail";
import StudentDashboard from "../pages/student/Dashboard";
import StudentLogin from "../pages/student/Login";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<StudentLogin />} />
      <Route path="/login/login.html" element={<Navigate to="/login" replace />} />
      <Route path="/admin/login" element={<AdminLogin />} />

      <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/dashboard/index.html" element={<Navigate to="/dashboard" replace />} />
        <Route path="/course/:courseId" element={<CourseDetail />} />

        <Route path="/paket/:courseKey" element={<CoursePage />} />
        <Route path="/paket/:courseKey/materi/:id" element={<LessonPage />} />
        <Route path="/paket/faktarobotik/materi" element={<FaktaRobotikPage />} />
        <Route path="/paket/faktarobotik" element={<Navigate to="/paket/faktarobotik/materi" replace />} />
        <Route path="/paket/faktarobotik/faktarobotik.html" element={<Navigate to="/paket/faktarobotik/materi" replace />} />
        <Route path="/paket/faktarobotik/materi/index.html" element={<Navigate to="/paket/faktarobotik/materi" replace />} />
        <Route path="/paket/robobuilder/robobuilder.html" element={<Navigate to="/paket/robobuilder" replace />} />
        <Route path="/paket/roboexplorer/roboexplorer.html" element={<Navigate to="/paket/roboexplorer" replace />} />
        <Route path="/paket/roboengineer/roboengineer.html" element={<Navigate to="/paket/roboengineer" replace />} />
        <Route path="/paket/robobuilder/materi/lesson.html" element={<LegacyLessonRedirect courseKey="robobuilder" />} />
        <Route path="/paket/roboexplorer/materi/lesson.html" element={<LegacyLessonRedirect courseKey="roboexplorer" />} />
        <Route path="/paket/roboengineer/materi/lesson.html" element={<LegacyLessonRedirect courseKey="roboengineer" />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/students" element={<AdminStudents />} />
        <Route path="/admin/students/new" element={<AdminStudentForm />} />
        <Route path="/admin/packages" element={<AdminPackages />} />
        <Route path="/admin/progress" element={<AdminProgress />} />
        <Route path="/admin/live-sessions" element={<AdminLiveSessions />} />
        <Route path="/admin/enrollments" element={<AdminEnrollments />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
