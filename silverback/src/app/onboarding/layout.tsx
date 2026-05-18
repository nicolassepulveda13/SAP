export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#181818] flex flex-col items-center justify-center px-4">
      <div className="mb-8">
        <h1 className="font-heading font-bold text-3xl text-[#F97316] tracking-widest uppercase">
          SILVERBACK
        </h1>
      </div>
      {children}
    </div>
  );
}
