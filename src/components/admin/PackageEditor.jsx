import { useState } from "react";

const PACKAGE_OPTIONS = [
  "Neratix RoboExplorer",
  "Neratix RoboExplorer Plus",
  "Neratix RoboBuilder",
  "Neratix RoboBuilder Plus",
  "Neratix RoboEngineer",
  "Neratix RoboEngineer Plus"
];

export default function PackageEditor({ student, onSave }) {
  const [packages, setPackages] = useState(Array.isArray(student.packages) ? student.packages : []);
  const [saving, setSaving] = useState(false);

  function togglePackage(pkg) {
    setPackages((prev) => {
      const selected = new Set(prev);
      if (selected.has(pkg)) selected.delete(pkg);
      else selected.add(pkg);
      return [...selected];
    });
  }

  async function handleSave() {
    setSaving(true);
    await onSave(student, packages);
    setSaving(false);
  }

  return (
    <div className="admin-card">
      <h3>{student.name || student.email}</h3>
      <p>{student.email}</p>
      <div className="admin-checkbox-grid">
        {PACKAGE_OPTIONS.map((pkg) => (
          <label key={pkg} className="admin-check-item">
            <input type="checkbox" checked={packages.includes(pkg)} onChange={() => togglePackage(pkg)} />
            <span>{pkg}</span>
          </label>
        ))}
      </div>
      <button type="button" className="btn btn-primary" disabled={saving} onClick={handleSave}>
        {saving ? "Menyimpan..." : "Simpan Paket"}
      </button>
    </div>
  );
}
