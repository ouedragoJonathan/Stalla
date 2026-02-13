export function StatusBadge({
  status,
}: {
  status: string;
}) {
  const normalized = status.toUpperCase();
  const tone = normalized === "OCCUPIED" ? "warning" : normalized === "AVAILABLE" ? "success" : "neutral";
  return <span className={`status-badge ${tone}`}>{status}</span>;
}
