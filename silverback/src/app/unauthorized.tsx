export default function Unauthorized() {
  return (
    <main className="flex h-screen items-center justify-center bg-[#181818] text-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">401</h1>
        <p className="text-zinc-400">Tenés que estar logueado para ver esto.</p>
        <a href="/login" className="mt-4 inline-block text-orange-400 underline">
          Ir al login
        </a>
      </div>
    </main>
  );
}
