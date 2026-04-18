import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function CourseDetail() {
  const navigate = useNavigate();
  const { courseId } = useParams();

  useEffect(() => {
    if (!courseId) {
      navigate("/dashboard", { replace: true });
      return;
    }

    navigate(`/paket/${courseId}`, { replace: true });
  }, [courseId, navigate]);

  return <div className="app-shell" />;
}
