export default function ProgressCard({ progressRows = [] }) {
  const totalCourses = progressRows.length;
  const totalProgress = progressRows.reduce((sum, row) => sum + Number(row.progress || 0), 0);
  const averageProgress = totalCourses > 0 ? Math.round(totalProgress / totalCourses) : 0;

  return (
    <section className="package-section section-card">
      <p className="section-label">Progress Belajar</p>
      <div className="package-badge">{averageProgress}% rata-rata</div>
      <p className="section-subtitle">
        {totalCourses > 0
          ? `Terpantau dari ${totalCourses} course aktif.`
          : "Progress akan muncul setelah mulai belajar."}
      </p>
    </section>
  );
}
