const fs = require('fs')
const path = require('path')
const bcrypt = require('bcryptjs')

const args = process.argv.slice(2)
if (args.length < 2) {
  console.log('用法: node scripts/reset-password.js <用户名> <新密码>')
  console.log('示例: node scripts/reset-password.js admin mypassword123')
  process.exit(1)
}

const [username, newPassword] = args

if (newPassword.length < 6) {
  console.log('错误: 密码至少 6 位')
  process.exit(1)
}

const dataPath = path.join(__dirname, '..', 'data', 'users.json')
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))

const user = data.users.find(u => u.username === username)
if (!user) {
  console.log(`错误: 用户 "${username}" 不存在`)
  console.log(`现有用户: ${data.users.map(u => u.username).join(', ')}`)
  process.exit(1)
}

user.password = bcrypt.hashSync(newPassword, 10)
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2))
console.log(`用户 "${username}" 密码已重置`)
