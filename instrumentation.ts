/**
 * Next.js Instrumentation — 在服务器启动时从 HF Dataset 拉取数据。
 * 仅在 Node.js runtime 执行（不在 Edge routes 中运行）。
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startupDataSync } = await import('@/lib/store')
    await startupDataSync()
  }
}
