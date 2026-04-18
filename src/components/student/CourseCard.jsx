import { getUiIconSvg } from "../../data/icons";
import { SvgIcon } from "../SvgIcon";

export default function CourseCard({ course, unlocked, onOpen }) {
  const statusText = unlocked ? "Terbuka" : "Terkunci";
  const iconHtml = unlocked ? getUiIconSvg("play") : getUiIconSvg("lock");

  return (
    <article
      className={`course-card ${unlocked ? "unlocked" : "locked"}`}
      onClick={() => unlocked && onOpen(course)}
    >
      <img className="course-thumb" src={course.thumbnail} alt={course.title} />
      <div className="course-body">
        <h4 className="course-title">{course.title}</h4>
        <div className="course-status">
          <span className={`status-badge ${unlocked ? "status-unlocked" : "status-locked"}`}>{statusText}</span>
          <button
            className="course-action"
            type="button"
            disabled={!unlocked}
            aria-label={`Kursus ${statusText}`}
            onClick={(event) => {
              event.stopPropagation();
              if (unlocked) onOpen(course);
            }}
          >
            <SvgIcon html={iconHtml} />
          </button>
        </div>
      </div>
    </article>
  );
}
