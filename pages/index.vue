<template>
    <div class="min-h-screen bg-cover bg-center text-white p-6 sm:p-10"
        style="background-image: url('/home-01-img-03.jpg')">
        <h1 class="text-5xl font-extrabold mb-8 text-center drop-shadow-lg">🖥️ Мониторинг Сервера</h1>

        <div class="flex justify-center mb-10">
            <div class="glass p-4 rounded-xl text-lg text-center w-full max-w-md">
                <span class="text-gray-300">Аптайм</span> <span class="text-green-400">{{ stats.uptime }}</span>
            </div>
        </div>

        <!-- Оперативная память -->
<div class="glass p-6 rounded-xl flex flex-col justify-between">
  <h2 class="text-xl font-semibold mb-2">Оперативная память</h2>
  <p class="text-lg mb-2">{{ stats.memory.used }} / {{ stats.memory.total }} GB</p>
  <div class="w-full h-4 bg-gray-700 rounded">
    <div
      class="h-4 rounded"
      :class="getBarColor((stats.memory.used / stats.memory.total) * 100)"
      :style="{ width: ((stats.memory.used / stats.memory.total) * 100).toFixed(1) + '%' }"
    ></div>
  </div>
</div>
<br>

<!-- Диск -->
<div class="glass p-6 rounded-xl flex flex-col justify-between">
  <h2 class="text-xl font-semibold mb-2">Диск</h2>
  <p class="text-lg mb-2">{{ stats.disk.used }} / {{ stats.disk.total }} GB</p>
  <div class="w-full h-4 bg-gray-700 rounded">
    <div
      class="h-4 rounded"
      :class="getBarColor((stats.disk.used / stats.disk.total) * 100)"
      :style="{ width: ((stats.disk.used / stats.disk.total) * 100).toFixed(1) + '%' }"
    ></div>
  </div>
</div>



        <h2 class="text-2xl font-bold mb-4 text-center">Потоки процессора</h2>
        <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 overflow-x-auto min-w-[300px]">
            <div v-for="(thread, i) in stats.threads" :key="i" class="glass p-4 rounded-lg text-center">
                <h3 class="text-sm text-gray-300 font-semibold">Поток {{ i + 1 }}</h3>
                <p class="text-white font-bold mb-2">{{ thread }}%</p>
                <div class="w-full h-2 bg-gray-700 rounded">
                    <div class="h-2 rounded" :class="getBarColor(thread)" :style="{ width: thread + '%' }"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Stats {
    memory: { used: number; total: number }
    disk: { used: number; total: number }
    threads: number[]
    uptime: string
}

const stats = ref<Stats>({
    memory: { used: 0, total: 0 },
    disk: { used: 0, total: 0 },
    threads: Array(16).fill(0),
    uptime: ''
})

const fetchStats = async () => {
    const res = await $fetch<Stats>('/api/stats')
    stats.value = res
}

onMounted(() => {
    fetchStats()
    setInterval(fetchStats, 5000)
})

const getBarColor = (val: number) => {
  if (val < 40) return 'bg-green-400'
  if (val < 75) return 'bg-yellow-400'
  return 'bg-red-500'
}

</script>

<style scoped>
.glass {
    background-color: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}
</style>
