import { useMemo, useState } from "react";

const PACKAGE_OPTIONS = [
  "Neratix RoboExplorer",
  "Neratix RoboExplorer Plus",
  "Neratix RoboBuilder",
  "Neratix RoboBuilder Plus",
  "Neratix RoboEngineer",
  "Neratix RoboEngineer Plus"
];

export default function StudentForm({
  initialValues = { name: "", email: "", password: "", packages: [] },
  onSubmit,
  submitLabel = "Simpan",
  hidePassword = false
}) {
  const [form, setForm] = useState(initialValues);
  const packageSet = useMemo(() => new Set(form.packages || []), [form.packages]);

  function togglePackage(pkg) {
    setForm((prev) => {
      const selected = new Set(prev.packages || []);
      if (selected.has(pkg)) selected.delete(pkg);
      else selected.add(pkg);
      return { ...prev, packages: [...selected] };
    });
  }

  return (
    <form
      className="admin-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(form);
      }}
    >
      <label>
        Nama
        <input
          type="text"
          value={form.name || ""}
          onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          required
        />
      </label>
      <label>
        Email
        <input
          type="email"
          value={form.email || ""}
          onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          required
        />
      </label>

      {!hidePassword && (
        <label>
          Password Awal
          <input
            type="password"
            minLength={6}
            value={form.password || ""}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            required
          />
        </label>
      )}

      <div>
        <p className="admin-field-title">Pilih Paket</p>
        <div className="admin-checkbox-grid">
          {PACKAGE_OPTIONS.map((pkg) => (
            <label key={pkg} className="admin-check-item">
              <input
                type="checkbox"
                checked={packageSet.has(pkg)}
                onChange={() => togglePackage(pkg)}
              />
              <span>{pkg}</span>
            </label>
          ))}
        </div>
      </div>

      <button type="submit" className="btn btn-primary">{submitLabel}</button>
    </form>
  );
}
