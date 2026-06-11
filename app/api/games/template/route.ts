import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

export async function GET() {
  try {
    const templateData = [
      {
        '游戏名称': '艾尔登法环',
        '夸克网盘链接': 'https://pan.quark.cn/s/example',
        '夸克提取码': '',
        '迅雷网盘链接': '',
        '迅雷提取码': '',
        'UC网盘链接': '',
        'UC提取码': '',
        '百度网盘链接': 'https://pan.baidu.com/s/example',
        '百度提取码': 'abcd',
      },
      {
        '游戏名称': '',
        '夸克网盘链接': '',
        '夸克提取码': '',
        '迅雷网盘链接': '',
        '迅雷提取码': '',
        'UC网盘链接': '',
        'UC提取码': '',
        '百度网盘链接': '',
        '百度提取码': '',
      },
    ]

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(templateData)

    ws['!cols'] = [
      { wch: 18 }, // 游戏名称
      { wch: 40 }, // 夸克链接
      { wch: 10 }, // 夸克提取码
      { wch: 40 }, // 迅雷链接
      { wch: 10 }, // 迅雷提取码
      { wch: 40 }, // UC链接
      { wch: 10 }, // UC提取码
      { wch: 40 }, // 百度链接
      { wch: 10 }, // 百度提取码
    ]

    XLSX.utils.book_append_sheet(wb, ws, '游戏数据')

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename=game_import_template.xlsx'
      }
    })
  } catch (error) {
    console.error('生成模板失败:', error)
    return NextResponse.json({ error: '生成模板失败' }, { status: 500 })
  }
}
