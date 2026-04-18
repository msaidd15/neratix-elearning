import { useEffect, useState } from "react";

const initialState = {
  courseId: "roboexplorer_plus",
  batchNumber: 1,
  title: "",
  sessionNumber: 1,
  description: "",
  thumbnail: "",
  date: "",
  time: "",
  mentor: "",
  zoomLink: "",
  status: "upcoming",
  sessionType: "batch"
};

export default function LiveSessionForm({ onSubmit, initialValues = null, submitLabel = "Simpan Session" }) {
  const [form, setForm] = useState(initialState);
  const isOneOnOne = form.sessionType === "one_on_one";

  useEffect(() => {
    if (initialValues) {
      setForm({ ...initialState, ...initialValues });
    } else {
      setForm(initialState);
    }
  }, [initialValues]);

  return (
    <form
      className="admin-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({
          ...form,
          batchNumber: isOneOnOne ? null : Number(form.batchNumber || 1),
          sessionNumber: Number(form.sessionNumber || 1)
        });
      }}
    >
      <label>
        Course ID Plus
        <select value={form.courseId} onChange={(event) => setForm((prev) => ({ ...prev, courseId: event.target.value }))}>
          <option value="roboexplorer_plus">RoboExplorer Plus</option>
          <option value="robobuilder_plus">RoboBuilder Plus</option>
          <option value="roboengineer_plus">RoboEngineer Plus</option>
        </select>
      </label>

      {!isOneOnOne && (
        <label>
          Batch Number
          <input
            type="number"
            value={form.batchNumber}
            min={1}
            onChange={(event) => setForm((prev) => ({ ...prev, batchNumber: event.target.value }))}
            required
          />
        </label>
      )}

      <label>
        Judul
        <input type="text" value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} required />
      </label>

      <label>
        Session Number
        <input type="number" value={form.sessionNumber} min={1} onChange={(event) => setForm((prev) => ({ ...prev, sessionNumber: event.target.value }))} required />
      </label>

      <label>
        Deskripsi
        <textarea value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} />
      </label>

      <label>
        Thumbnail URL
        <input type="url" value={form.thumbnail} onChange={(event) => setForm((prev) => ({ ...prev, thumbnail: event.target.value }))} />
      </label>

      <label>
        Tanggal
        <input type="date" value={form.date} onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))} required />
      </label>

      <label>
        Jam
        <input type="text" value={form.time} placeholder="16:00 WIB" onChange={(event) => setForm((prev) => ({ ...prev, time: event.target.value }))} required />
      </label>

      <label>
        Mentor
        <input type="text" value={form.mentor} onChange={(event) => setForm((prev) => ({ ...prev, mentor: event.target.value }))} />
      </label>

      <label>
        Zoom Link
        <input type="url" value={form.zoomLink} onChange={(event) => setForm((prev) => ({ ...prev, zoomLink: event.target.value }))} required />
      </label>

      <label>
        Status
        <select value={form.status} onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}>
          <option value="upcoming">upcoming</option>
          <option value="completed">completed</option>
        </select>
      </label>

      <label>
        Session Type
        <select
          value={form.sessionType}
          onChange={(event) => {
            const sessionType = event.target.value;
            setForm((prev) => ({
              ...prev,
              sessionType,
              batchNumber: sessionType === "one_on_one" ? "" : prev.batchNumber || 1
            }));
          }}
        >
          <option value="batch">batch</option>
          <option value="one_on_one">one_on_one</option>
        </select>
      </label>

      <button type="submit" className="btn btn-primary">{submitLabel}</button>
    </form>
  );
}
