/**
 * 将 extensions/linklantern-bookmark 打成 zip，输出到 public/extensions/
 * 供站点静态下载（需系统有 zip 命令：macOS / Linux / Git Bash）
 */
import { execSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const extDir = join(root, 'extensions/linklantern-bookmark')
const outDir = join(root, 'public/extensions')
const outFile = join(outDir, 'linklantern-bookmark.zip')

mkdirSync(outDir, { recursive: true })

try {
  execSync(`zip -r "${outFile}" . -x "*.DS_Store"`, {
    cwd: extDir,
    stdio: 'inherit',
  })
  console.log('[zip-extension] OK →', outFile)
} catch (e) {
  console.error('[zip-extension] 失败：请确认已安装 zip，且目录存在', extDir)
  process.exit(1)
}
