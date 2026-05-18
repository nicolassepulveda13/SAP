export function PageLabel({ page }: { page: string }) {
  return (
    <div className="inline-flex items-center border border-[#F97316] rounded px-2.5 py-0.5 mb-4">
      <span className="font-heading font-bold text-xs text-[#F97316] tracking-widest uppercase">{page}</span>
    </div>
  );
}
