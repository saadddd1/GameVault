import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: '缺少url参数' }, { status: 400 })
  }

  try {
    const match = url.match(/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?$/)
    if (!match) {
      return NextResponse.json({ error: '无效的GitHub URL' }, { status: 400 })
    }

    const [, owner, repo] = match
    const apiUrl = `https://api.github.com/repos/${owner}/${repo.replace(/\.git$/, '')}`

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'GameVault/1.0',
        'Accept': 'application/vnd.github+json'
      },
      signal: controller.signal
    })
    clearTimeout(timeout)

    if (!response.ok) {
      return NextResponse.json({ error: 'GitHub API请求失败' }, { status: 502 })
    }

    const repoData = await response.json()
    return NextResponse.json({
      stars: repoData.stargazers_count,
      language: repoData.language || '',
      description: repoData.description || ''
    })
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json({ error: 'GitHub请求超时' }, { status: 504 })
    }
    return NextResponse.json({ error: '获取GitHub信息失败' }, { status: 500 })
  }
}
