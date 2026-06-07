/**
 * 统一存储层 — 开发用本地文件，生产用 HF Dataset API 持久化。
 *
 * HF Spaces 文件系统是临时的，重启丢失。通过 HF Dataset API 在启动时
 * 拉取数据，写操作后异步回传，保证数据不丢失。
 */

const HF_DATASET_REPO = process.env.HF_DATASET_REPO

export function isHF(): boolean {
  return !!HF_DATASET_REPO
}

function hfUrl(fileName: string): string {
  return `https://huggingface.co/datasets/${HF_DATASET_REPO}/resolve/main/${fileName}`
}

function hfUploadUrl(fileName: string): string {
  return `https://huggingface.co/api/datasets/${HF_DATASET_REPO}/upload/${fileName}`
}

/**
 * 启动时从 HF Dataset 拉取所有数据文件到本地。
 * 在 instrumentation.ts 中调用，页面渲染前完成。
 */
export async function startupDataSync(): Promise<void> {
  if (!isHF()) return

  const files = [
    'games.json',
    'mods.json',
    'tools.json',
    'users.json',
    'game-metadata.json',
    '.secret',
  ]

  const fs = await import('fs')
  const path = await import('path')
  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })

  for (const file of files) {
    try {
      const headers: Record<string, string> = {}
      if (process.env.HF_TOKEN) {
        headers['Authorization'] = `Bearer ${process.env.HF_TOKEN}`
      }
      const res = await fetch(hfUrl(file), { headers })
      if (res.ok) {
        const text = await res.text()
        fs.writeFileSync(path.join(dataDir, file), text)
        console.log(`[store] pulled ${file} from HF Dataset`)
      } else if (res.status === 404) {
        console.log(`[store] ${file} not found in Dataset, will create locally`)
      } else {
        console.warn(`[store] failed to pull ${file}: HTTP ${res.status}`)
      }
    } catch (err) {
      console.warn(`[store] network error pulling ${file}:`, err)
    }
  }

  // 确保 .secret 存在（首次部署时生成）
  const secretPath = path.join(dataDir, '.secret')
  if (!fs.existsSync(secretPath)) {
    const crypto = await import('crypto')
    const secret = crypto.randomBytes(32).toString('hex')
    fs.writeFileSync(secretPath, secret)
    await syncToHF('.secret')
    console.log('[store] generated new .secret')
  }
}

/**
 * 写操作后异步上传到 HF Dataset（best-effort，不阻塞请求）。
 * 在 lib/*.ts 的 writeFileSync 之后调用。
 */
export function syncToHF(fileName: string): void {
  if (!isHF()) return

  const fs = require('fs') as typeof import('fs')
  const path = require('path') as typeof import('path')
  const filePath = path.join(process.cwd(), 'data', fileName)

  // 异步上传，不阻塞
  ;(async () => {
    try {
      const content = fs.readFileSync(filePath)
      const res = await fetch(hfUploadUrl(fileName), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          'Content-Type': 'application/octet-stream',
        },
        body: content,
      })
      if (res.ok) {
        console.log(`[store] synced ${fileName} to HF Dataset`)
      } else {
        console.warn(`[store] sync ${fileName} failed: HTTP ${res.status}`)
      }
    } catch (err) {
      console.warn(`[store] sync ${fileName} error:`, err)
    }
  })()
}
