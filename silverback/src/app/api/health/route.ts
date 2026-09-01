export async function GET() {
  try {
    const apiUrl = process.env.API_URL ?? "http://localhost:5057";
    const res = await fetch(`${apiUrl}/health`);
    const data = await res.json();
    return Response.json({ status: "ok", api: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    return Response.json({ status: "error", api: message }, { status: 503 });
  }
}
