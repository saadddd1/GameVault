import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

export async function GET() {
  const headers = ['MOD标题', '所属游戏', '描述', '分类', '版本', '文件大小', '封面图片',
    '下载平台1', '下载链接1', '提取码1',
    '下载平台2', '下载链接2', '提取码2',
    '下载平台3', '下载链接3', '提取码3',
    '标签', '作者', '安装说明']

  const example = ['示例汉化MOD', 'Elden Ring', '这是一个汉化MOD示例', '汉化', '1.0', '120 MB', '',
    '百度网盘', 'https://pan.baidu.com/s/xxx', 'abcd',
    '蓝奏云', 'https://lanzou.com/xxx', '',
    '', '', '',
    '汉化,中文', '汉化组', '解压到游戏目录覆盖原文件']

  const ws = XLSX.utils.aoa_to_sheet([headers, example])
  ws['!cols'] = headers.map(() => ({ wch: 18 }))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'MOD')
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=mods_template.xlsx'
    }
  })
}

