/**
 * @fileOverview This route has been disabled as Vercel-specific cron functionality is no longer required.
 */

export async function GET() {
  return new Response(JSON.stringify({ message: "Cron service disabled" }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  });
}
