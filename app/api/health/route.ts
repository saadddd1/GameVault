export function GET() {
  return Response.json({
    status: 'ok',
    timestamp: Date.now(),
    uptime: process.uptime(),
    memory: process.memoryUsage().rss,
  })
}
