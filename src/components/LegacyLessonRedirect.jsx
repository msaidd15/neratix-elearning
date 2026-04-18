import { Navigate, useLocation } from "react-router-dom";

export default function LegacyLessonRedirect({ courseKey }) {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const id = Number(params.get("id"));
  const safeId = Number.isInteger(id) && id > 0 ? id : 1;

  return <Navigate to={`/paket/${courseKey}/materi/${safeId}`} replace />;
}
