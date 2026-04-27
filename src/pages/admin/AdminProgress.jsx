import { useEffect, useState } from "react";
import ProgressTable from "../../components/admin/ProgressTable";
import QuizResultTable from "../../components/admin/QuizResultTable";
import AdminLayout from "./AdminLayout";
import { getCourseLessons } from "../../data/courseData";
import { watchAuthState } from "../../services/authService";
import { deleteProgress, getAllProgress, resetProgress, updateProgress } from "../../services/progressService";
import { getAllQuizResultSummary, getQuizHistoryByStudent } from "../../services/quizResultsService";
import { getUserDataByEmail } from "../../services/usersService";

function formatDateTime(timestampMs) {
  if (!timestampMs) return "-";
  return new Date(timestampMs).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function getAttemptQuestions(courseId, lessonId) {
  if (!courseId || !lessonId) return [];
  const lessons = getCourseLessons(courseId);
  if (!Array.isArray(lessons) || lessons.length === 0) return [];
  const lesson = lessons.find((item) => Number(item.id) === Number(lessonId));
  return Array.isArray(lesson?.quiz) ? lesson.quiz : [];
}

function getAttemptAnswerDetails(attempt = {}) {
  const questions = getAttemptQuestions(attempt.courseId, attempt.lessonId);
  const answers = attempt.answers && typeof attempt.answers === "object" ? attempt.answers : {};

  if (questions.length === 0) {
    const totalQuestions = Number(attempt.totalQuestions || 0);
    const correctCount = Number(attempt.score || 0);
    return {
      correctCount,
      wrongCount: Math.max(totalQuestions - correctCount, 0),
      totalQuestions,
      details: []
    };
  }

  const details = questions.map((question, index) => {
    const selectedAnswer = answers[question.id] || "-";
    const answerKey = question.answer || "-";
    const isCorrect = selectedAnswer === answerKey;
    return {
      id: question.id || `${attempt.id}-${index}`,
      questionText: question.question || `Soal ${index + 1}`,
      selectedAnswer,
      answerKey,
      isCorrect
    };
  });

  const correctCount = details.filter((item) => item.isCorrect).length;
  return {
    correctCount,
    wrongCount: Math.max(details.length - correctCount, 0),
    totalQuestions: details.length,
    details
  };
}

export default function AdminProgress() {
  const [adminName, setAdminName] = useState("Admin");
  const [rows, setRows] = useState([]);
  const [quizRows, setQuizRows] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [activeMenu, setActiveMenu] = useState("progress");
  const [loading, setLoading] = useState(true);
  const [loadingQuiz, setLoadingQuiz] = useState(true);
  const [pendingDeleteRow, setPendingDeleteRow] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyTarget, setHistoryTarget] = useState(null);
  const [historyRows, setHistoryRows] = useState([]);
  const [detailTarget, setDetailTarget] = useState(null);

  async function loadRows(keyword = "") {
    setLoading(true);
    const data = await getAllProgress(keyword);
    setRows(data);
    setLoading(false);
  }

  async function loadQuizRows(keyword = "") {
    setLoadingQuiz(true);
    try {
      const data = await getAllQuizResultSummary(keyword);
      setQuizRows(data);
    } catch (error) {
      console.error("[AdminProgress] gagal memuat hasil quiz:", error);
      setQuizRows([]);
      alert("Gagal memuat hasil quiz. Cek rules/index Firestore lalu coba lagi.");
    } finally {
      setLoadingQuiz(false);
    }
  }

  useEffect(() => {
    const unsub = watchAuthState(async (user) => {
      if (!user?.email) return;
      const profile = await getUserDataByEmail(user.email);
      setAdminName(profile?.name || "Admin");
      await Promise.all([loadRows(), loadQuizRows()]);
    });
    return () => unsub();
  }, []);

  async function confirmDeleteProgress() {
    const row = pendingDeleteRow;
    if (!row?.id) return;

    setIsDeleting(true);
    try {
      await deleteProgress(row.id);
      await loadRows(searchText);
      setPendingDeleteRow(null);
    } catch (error) {
      console.error("[AdminProgress] gagal hapus progress:", error);
      const message = typeof error?.message === "string" && error.message.trim()
        ? error.message
        : "Gagal menghapus progress.";
      alert(message);
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleSearch() {
    if (activeMenu === "quiz") {
      await loadQuizRows(searchText);
      return;
    }
    await loadRows(searchText);
  }

  async function handleOpenHistory(row) {
    setHistoryTarget(row);
    setHistoryOpen(true);
    setHistoryLoading(true);
    try {
      const history = await getQuizHistoryByStudent(row.email, row.courseId);
      setHistoryRows(history);
    } catch (error) {
      console.error("[AdminProgress] gagal memuat history quiz:", error);
      setHistoryRows([]);
      alert("Gagal memuat history quiz siswa.");
    } finally {
      setHistoryLoading(false);
    }
  }

  function closeHistoryPopup() {
    setHistoryOpen(false);
    setDetailTarget(null);
  }

  return (
    <AdminLayout title="Tracker Progress Siswa" subtitle="Pantau dan reset progress course siswa" adminName={adminName}>
      <div className="admin-tab-menu">
        <button
          type="button"
          className={`admin-tab-btn ${activeMenu === "progress" ? "active" : ""}`}
          onClick={() => setActiveMenu("progress")}
        >
          Progress Materi
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${activeMenu === "quiz" ? "active" : ""}`}
          onClick={() => setActiveMenu("quiz")}
        >
          Hasil Quiz
        </button>
      </div>

      <div className="admin-toolbar">
        <input
          className="admin-search"
          type="search"
          placeholder={activeMenu === "quiz" ? "Cari email/course/materi..." : "Cari email/course..."}
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
        />
        <button type="button" className="btn btn-outline" onClick={handleSearch}>Cari</button>
      </div>

      {activeMenu === "progress" ? (
        loading ? (
          <p>Memuat progress...</p>
        ) : (
          <ProgressTable
            rows={rows}
            onReset={async (row) => {
              await resetProgress(row.id);
              await loadRows(searchText);
            }}
            onUpdate={async (row, nextProgress) => {
              await updateProgress(row.id, { progress: nextProgress });
              await loadRows(searchText);
            }}
            onDelete={(row) => setPendingDeleteRow(row)}
          />
        )
      ) : (
        loadingQuiz ? (
          <p>Memuat hasil quiz...</p>
        ) : (
          <QuizResultTable rows={quizRows} onViewHistory={handleOpenHistory} />
        )
      )}

      {pendingDeleteRow && (
        <div className="admin-popup-overlay" role="dialog" aria-modal="true" aria-labelledby="delete-progress-title">
          <div className="admin-popup-card">
            <div className="admin-popup-icon admin-popup-icon-danger" aria-hidden="true">!</div>
            <h3 id="delete-progress-title">Hapus Progress</h3>
            <p>
              Hapus data progress untuk {pendingDeleteRow.email || "-"} ({pendingDeleteRow.courseId || "-"})?
            </p>
            <div className="admin-popup-actions">
              <button
                type="button"
                className="btn btn-outline"
                disabled={isDeleting}
                onClick={() => setPendingDeleteRow(null)}
              >
                Batal
              </button>
              <button
                type="button"
                className="btn btn-danger"
                disabled={isDeleting}
                onClick={confirmDeleteProgress}
              >
                {isDeleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      {historyOpen && (
        <div className="admin-popup-overlay" role="dialog" aria-modal="true" aria-labelledby="quiz-history-title">
          <div className="admin-popup-card admin-popup-card-wide">
            <h3 id="quiz-history-title">History Pengerjaan Quiz</h3>
            <p>{historyTarget?.email || "-"}</p>
            <p>Course: {historyTarget?.courseId || "-"}</p>

            {historyLoading ? (
              <p>Memuat history...</p>
            ) : (
              <div className="admin-table-wrap admin-history-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Waktu</th>
                      <th>Materi</th>
                      <th>Skor</th>
                      <th>Detail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyRows.map((item) => {
                      const answerDetails = getAttemptAnswerDetails(item);
                      return (
                        <tr key={item.id}>
                          <td>{formatDateTime(item.submittedAtMs)}</td>
                          <td>{item.lessonTitle || `Materi ${item.lessonId || "-"}`}</td>
                          <td>{item.score}/{item.totalQuestions}</td>
                          <td>
                            <div className="admin-quiz-detail-cell">
                              <span>{`Benar ${answerDetails.correctCount} | Salah ${answerDetails.wrongCount}`}</span>
                              <button
                                type="button"
                                className="btn btn-outline"
                                onClick={() => setDetailTarget(item)}
                              >
                                Lihat Detail
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {historyRows.length === 0 && (
                      <tr>
                        <td colSpan={4} className="admin-empty-cell">Belum ada history quiz.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            <button type="button" className="btn btn-outline" onClick={closeHistoryPopup}>
              Tutup
            </button>
          </div>
        </div>
      )}

      {detailTarget && (
        <div className="admin-popup-overlay" role="dialog" aria-modal="true" aria-labelledby="quiz-answer-detail-title">
          <div className="admin-popup-card admin-popup-card-wide">
            <h3 id="quiz-answer-detail-title">Detail Jawaban Quiz</h3>
            <p>{historyTarget?.email || "-"}</p>
            <p>{detailTarget.lessonTitle || `Materi ${detailTarget.lessonId || "-"}`}</p>
            {(() => {
              const details = getAttemptAnswerDetails(detailTarget);
              return (
                <>
                  <p>{`Skor ${details.correctCount}/${details.totalQuestions} • Salah ${details.wrongCount}`}</p>
                  {details.details.length > 0 ? (
                    <div className="admin-table-wrap admin-history-wrap">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Soal</th>
                            <th>Jawaban Siswa</th>
                            <th>Status</th>
                            <th>Kunci Jawaban</th>
                          </tr>
                        </thead>
                        <tbody>
                          {details.details.map((detail) => (
                            <tr key={detail.id}>
                              <td>{detail.questionText}</td>
                              <td>{detail.selectedAnswer}</td>
                              <td>{detail.isCorrect ? "Benar" : "Salah"}</td>
                              <td>{detail.answerKey}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p>Detail soal tidak tersedia untuk percobaan ini.</p>
                  )}
                </>
              );
            })()}

            <button type="button" className="btn btn-outline" onClick={() => setDetailTarget(null)}>
              Tutup Detail
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
