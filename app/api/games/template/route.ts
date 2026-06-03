import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

export async function GET() {
  try {
    // 创建模板数据
    const templateData = [
      {
        '游戏名称': '示例游戏',
        '游戏描述': '这是一款示例游戏的描述',
        '封面图片': '/images/example.jpg',
        '游戏大小': '50GB',
        '游戏分类': '动作冒险',
        '下载平台1': '百度网盘',
        '下载链接1': 'https://pan.baidu.com/s/example',
        '提取码1': 'abcd',
        '下载平台2': '阿里云盘',
        '下载链接2': 'https://www.aliyundrive.com/s/example',
        '提取码2': '',
        '下载平台3': '',
        '下载链接3': '',
        '提取码3': '',
        '发行日期': '2024-01-01',
        '更新日期': '2024-12-01',
        '下载次数': 0,
        '是否热门': '否',
        '是否新品': '是'
      }
    ]

    // 创建工作簿
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(templateData)

    // 设置列宽
    ws['!cols'] = [
      { wch: 15 }, // 游戏名称
      { wch: 40 }, // 游戏描述
      { wch: 20 }, // 封面图片
      { wch: 10 }, // 游戏大小
      { wch: 12 }, // 游戏分类
      { wch: 12 }, // 下载平台1
      { wch: 35 }, // 下载链接1
      { wch: 10 }, // 提取码1
      { wch: 12 }, // 下载平台2
      { wch: 35 }, // 下载链接2
      { wch: 10 }, // 提取码2
      { wch: 12 }, // 下载平台3
      { wch: 35 }, // 下载链接3
      { wch: 10 }, // 提取码3
      { wch: 12 }, // 发行日期
      { wch: 12 }, // 更新日期
      { wch: 10 }, // 下载次数
      { wch: 10 }, // 是否热门
      { wch: 10 }, // 是否新品
    ]

    XLSX.utils.book_append_sheet(wb, ws, '游戏数据')

    // 生成文件
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename=game_import_template.xlsx'
      }
    })
  } catch (error) {
    console.error('生成模板失败:', error)
    return NextResponse.json(
      { error: '生成模板失败' },
      { status: 500 }
    )
  }
}
