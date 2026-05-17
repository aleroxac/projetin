import { Badge } from "@/components/ui/badge";

const sessions = [
  {
    day: "Mon",
    name: "Chest + Triceps",
    detail: "Bench Press 100kg 4×8 · PR",
    status: "done",
  },
  {
    day: "Tue",
    name: "Back + Biceps",
    detail: "Row 90kg 4×10 · PR",
    status: "done",
  },
  {
    day: "Wed",
    name: "Legs",
    detail: "Squat 120kg 5×5 · PR",
    status: "done",
  },
  {
    day: "Thu",
    name: "Shoulders + Traps",
    detail: "OHP 72kg 4×8",
    status: "done",
  },
  {
    day: "Fri",
    name: "Full Body / Cardio",
    detail: "Scheduled 13:30",
    status: "today",
  },
];

export default function SessionsListWidget() {
  return (
    <div>
      {sessions.map((s, i) => (
        <div
          key={s.day}
          className="flex justify-between items-center py-1.5"
          style={{
            borderBottom: i < sessions.length - 1 ? "0.5px solid var(--border)" : "none",
          }}
        >
          <div>
            <div className="text-[13px] font-medium">
              {s.day} — {s.name}
            </div>
            <div className="text-[11px] text-[var(--text3)]">{s.detail}</div>
          </div>
          {s.status === "done" ? (
            <Badge variant="green">Done</Badge>
          ) : (
            <Badge variant="blue">Today</Badge>
          )}
        </div>
      ))}
    </div>
  );
}
