const measurements = [
  { label: "Waist", value: "82 cm" },
  { label: "Abdomen", value: "86 cm" },
  { label: "Chest", value: "108 cm" },
  { label: "Right Arm", value: "40 cm" },
  { label: "Right Thigh", value: "62 cm" },
];

export default function MeasurementsWidget() {
  return (
    <div>
      {measurements.map((m, i) => (
        <div
          key={m.label}
          className="flex justify-between items-center py-1.5 text-[12px]"
          style={{
            borderBottom: i < measurements.length - 1 ? "0.5px solid var(--border)" : "none",
          }}
        >
          <span className="text-[var(--text2)]">{m.label}</span>
          <span className="font-medium font-mono">{m.value}</span>
        </div>
      ))}
    </div>
  );
}
