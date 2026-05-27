export function ProfessionalCardSkeleton() {
  return (
    <div
      className="rounded-2xl overflow-hidden p-4"
      style={{ background: "#111113", border: "1px solid #1F1F23" }}
    >
      <div className="flex items-start gap-3">
        <div className="w-14 h-14 rounded-xl skeleton flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="w-32 h-4 rounded-lg skeleton" />
          <div className="w-20 h-3 rounded-lg skeleton" />
          <div className="w-24 h-3 rounded-lg skeleton" />
        </div>
      </div>
      <div className="mt-3 pt-3 flex justify-between" style={{ borderTop: "1px solid #1F1F23" }}>
        <div className="w-24 h-3 rounded-lg skeleton" />
        <div className="w-16 h-3 rounded-lg skeleton" />
      </div>
      <div className="mt-4 w-full h-10 rounded-xl skeleton" />
    </div>
  );
}

export function CategorySkeleton() {
  return (
    <div className="rounded-2xl p-3 skeleton" style={{ height: 88 }} />
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-4 px-4">
      <div className="w-24 h-24 rounded-2xl skeleton mx-auto" />
      <div className="w-40 h-6 rounded-lg skeleton mx-auto" />
      <div className="w-32 h-4 rounded-lg skeleton mx-auto" />
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="w-full h-4 rounded-lg skeleton" />
        ))}
      </div>
    </div>
  );
}
