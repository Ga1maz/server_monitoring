// server/api/stats.get.ts
import { execSync } from 'child_process'

export default defineEventHandler(() => {
  const memInfo = execSync("free -g | awk '/Mem:/ { print $2, $3 }'").toString().trim().split(' ')
  const diskInfo = execSync("df -BG --output=size,used / | tail -1").toString().trim().split(' ')
  const cpuRaw = execSync("mpstat -P ALL 1 1 | awk '/^[0-9]/ && $3 ~ /^[0-9]+$/ { print 100 - $12 }'").toString().trim().split('\n')
  const uptime = execSync("uptime -p").toString().trim()

  return {
    memory: {
      total: parseInt(memInfo[0]),
      used: parseInt(memInfo[1])
    },
    disk: {
      total: parseInt(diskInfo[0]),
      used: parseInt(diskInfo[1])
    },
    threads: cpuRaw.slice(0, 16).map(v => parseFloat(parseFloat(v).toFixed(1))),
    uptime
  }
})
