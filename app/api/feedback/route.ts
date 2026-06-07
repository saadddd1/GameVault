import { NextRequest, NextResponse } from 'next/server'
import { getAllFeedbacks, addFeedback, toggleFeedbackResolved } from '@/lib/feedback'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  // Admin only: list all feedback
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: '未授权' }, { status: 401 })
  }

  try {
    const data = getAllFeedbacks()
    return NextResponse.json({ feedbacks: data.feedbacks })
  } catch {
    return NextResponse.json({ error: '获取反馈失败' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // Public: anyone can submit feedback
  try {
    const body = await request.json()
    const { targetType, targetId, targetName, content } = body

    if (!targetType || !targetId || !targetName || !content) {
      return NextResponse.json({ error: '缺少必填字段' }, { status: 400 })
    }

    const feedback = addFeedback({ targetType, targetId, targetName, content })
    return NextResponse.json({ success: true, feedback })
  } catch {
    return NextResponse.json({ error: '提交反馈失败' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  // Admin only: toggle resolved
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: '未授权' }, { status: 401 })
  }

  try {
    const { id } = await request.json()
    const feedback = toggleFeedbackResolved(id)
    if (!feedback) return NextResponse.json({ error: '反馈不存在' }, { status: 404 })
    return NextResponse.json({ feedback })
  } catch {
    return NextResponse.json({ error: '更新反馈失败' }, { status: 500 })
  }
}
