const COURSE_ID_TO_LABEL = {
  roboexplorer_plus: "RoboExplorer Plus",
  robobuilder_plus: "RoboBuilder Plus",
  roboengineer_plus: "RoboEngineer Plus"
};

export function getLiveSessionCourseLabel(courseId) {
  if (typeof courseId !== "string") return "Course Tidak Diketahui";
  const key = courseId.trim().toLowerCase();
  return COURSE_ID_TO_LABEL[key] || courseId;
}

