import { execSync } from 'child_process'
import { defineEventHandler } from 'h3'  // или из 'nuxt'

function translateUptime(uptimeEn: string): string {
  uptimeEn = uptimeEn.replace(/^up\s*/, '')

  const translations: Record<string, string> = {
    "day": "день",
    "days": "дня",
    "hour": "час",
    "hours": "часов",
    "minute": "минута",
    "minutes": "минут",
    "second": "секунда",
    "seconds": "секунд"
  }

  return uptimeEn.split(',').map(part => {
    part = part.trim()
    const [num, ...rest] = part.split(' ')
    const wordEn = rest.join(' ')
    const wordRu = translations[wordEn] || wordEn
    return `${num} ${wordRu}`
  }).join(', ')
}

export default defineEventHandler(() => {
  const memInfo = execSync("free -m | awk '/Mem:/ { print $2, $3 }'").toString().trim().split(' ')
  const diskInfo = execSync("df -BM --output=size,used / | tail -1").toString().trim().split(/\s+/)
  const cpuRaw = execSync(
  `mpstat -P ALL 1 1 | awk 'NR>3 { gsub(",",".",$12); print 100 - $12 }'`
)
  .toString()
  .trim()
  .split('\n');


  const uptimeRaw = execSync("uptime -p").toString().trim()

  const cpuLoadByCore: Record<string, string> = {}
  cpuRaw.slice(0, 16).forEach((load, i) => {
    cpuLoadByCore[`Ядро ${i + 1}`] = parseFloat(parseFloat(load).toFixed(1)) + '%'
  })

  return {
    memory: {
      total: parseFloat((parseInt(memInfo[0]) / 1024).toFixed(1)),
      used: parseFloat((parseInt(memInfo[1]) / 1024).toFixed(1))
    },
    disk: {
      total: parseFloat((parseInt(diskInfo[0]) / 1024).toFixed(1)),
      used: parseFloat((parseInt(diskInfo[1]) / 1024).toFixed(1))
    },
    cpu: cpuLoadByCore,
    uptime: translateUptime(uptimeRaw)
  }
})
