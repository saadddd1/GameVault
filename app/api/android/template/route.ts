import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

export async function GET() {
  const headers = ['应用名称', '描述', '分类', '版本', '文件大小', '封面图片',
    '下载平台1', '下载链接1', '提取码1',
    '下载平台2', '下载链接2', '提取码2',
    '下载平台3', '下载链接3', '提取码3',
    '标签', '作者']

  const example = ['示例APP', '这是一个示例应用', '工具', '1.0.0', '18.5 MB', '',
    '百度网盘', 'https://pan.baidu.com/s/xxx', 'abcd',
    '蓝奏云', 'https://lanzou.com/xxx', '',
    '', '', '',
    '去广告,开源', '作者名']

  const ws = XLSX.utils.aoa_to_sheet([headers, example])
  ws['!cols'] = headers.map(() => ({ wch: 18 }))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '安卓应用')
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=android_template.xlsx'
    }
  })
}

