import { execSync } from 'child_process'

function translateUptime(uptimeEn) {
  // Убираем "up " в начале, если есть
  uptimeEn = uptimeEn.replace(/^up\s*/, '')

  // Словарь перевода
  const translations = {
    "day": "день",
    "days": "дня",
    "hour": "час",
    "hours": "часов",
    "minute": "минута",
    "minutes": "минут",
    "second": "секунда",
    "seconds": "секунд"
  }

  // Разбиваем по запятым и пробелам
  return uptimeEn.split(',').map(part => {
    part = part.trim()
    // Разбиваем на число и слово
    const [num, ...rest] = part.split(' ')
    const wordEn = rest.join(' ')

    // Переводим слово (в словаре - простое преобразование)
    const wordRu = translations[wordEn] || wordEn

    return `${num} ${wordRu}`
  }).join(', ')
}

export default defineEventHandler(() => {
  const memInfo = execSync("free -m | awk '/Mem:/ { print $2, $3 }'").toString().trim().split(' ')
  const diskInfo = execSync("df -BM --output=size,used / | tail -1").toString().trim().split(/\s+/)
  const cpuRaw = execSync("mpstat -P ALL 1 1 | awk '/^[0-9]/ && $3 ~ /^[0-9]+$/ { print 100 - $12 }'").toString().trim().split('\n')
  const uptimeRaw = execSync("uptime -p").toString().trim()

  return {
    memory: {
      total: parseFloat((parseInt(memInfo[0]) / 1024).toFixed(1)),
      used: parseFloat((parseInt(memInfo[1]) / 1024).toFixed(1))
    },
    disk: {
      total: parseFloat((parseInt(diskInfo[0]) / 1024).toFixed(1)),
      used: parseFloat((parseInt(diskInfo[1]) / 1024).toFixed(1))
    },
    threads: cpuRaw.slice(0, 16).map(v => parseFloat(parseFloat(v).toFixed(1))),
    uptime: translateUptime(uptimeRaw)
  }
})
