import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

export async function GET() {
  const headers = ['应用名称', '描述', '分类', '版本', '文件大小', '封面图片',
    '下载平台1', '下载链接1', '提取码1',
    '下载平台2', '下载链接2', '提取码2',
    '下载平台3', '下载链接3', '提取码3',
    '标签', '作者']

  const example = ['示例软件', '这是一个示例Windows软件', '工具', '2.5.0', '45.2 MB', '',
    '百度网盘', 'https://pan.baidu.com/s/xxx', 'abcd',
    '蓝奏云', 'https://lanzou.com/xxx', '',
    '', '', '',
    '实用,免费', '作者名']

  const ws = XLSX.utils.aoa_to_sheet([headers, example])
  ws['!cols'] = headers.map(() => ({ wch: 18 }))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Windows应用')
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=windows_template.xlsx'
    }
  })
}

