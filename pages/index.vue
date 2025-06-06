<template>
  <div class="min-h-screen bg-cover bg-center text-white p-6 sm:p-10" style="background-image: url('/home-01-img-03.jpg')">
    <!-- Лоадер -->
    <div v-if="loading" class="fixed inset-0 flex items-center justify-center z-50">
      <div class="glass p-8 rounded-xl flex flex-col items-center">
        <div class="loader mb-4"></div>
        <p class="text-lg">Загрузка данных...</p>
      </div>
    </div>

    <h1 class="text-5xl font-extrabold mb-8 text-center drop-shadow-lg">Мониторинг ноды: N-X1</h1>

    <!-- Аптайм -->
    <div class="flex justify-center mb-10">
      <div class="glass p-4 rounded-xl text-lg text-center w-full max-w-md">
        <span class="text-gray-300">Время работы </span>
        <span class="text-green-400">{{ stats.uptime }}</span>
      </div>
    </div>

    <!-- ОЗУ и Диск -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
      <!-- RAM -->
      <div class="glass p-6 rounded-xl flex flex-col justify-between">
        <h2 class="text-xl font-semibold mb-2">Оперативная память</h2>
        <p class="text-lg mb-2">{{ stats.memory.used }} / {{ stats.memory.total }} GB</p>
        <div class="w-full h-4 bg-gray-700 rounded">
          <div
            class="h-4 rounded transition-all duration-500"
            :class="getBarColor((stats.memory.used / stats.memory.total) * 100)"
            :style="{ width: ((stats.memory.used / stats.memory.total) * 100).toFixed(1) + '%' }"
          ></div>
        </div>
      </div>

      <!-- Disk -->
      <div class="glass p-6 rounded-xl flex flex-col justify-between">
        <h2 class="text-xl font-semibold mb-2">Дисковое пространство</h2>
        <p class="text-lg mb-2">{{ stats.disk.used }} / {{ stats.disk.total }} GB</p>
        <div class="w-full h-4 bg-gray-700 rounded">
          <div
            class="h-4 rounded transition-all duration-500"
            :class="getBarColor((stats.disk.used / stats.disk.total) * 100)"
            :style="{ width: ((stats.disk.used / stats.disk.total) * 100).toFixed(1) + '%' }"
          ></div>
        </div>
      </div>
    </div>

    <!-- CPU -->
    <h2 class="text-2xl font-bold mb-4 text-center">Ядра процессора</h2>
    <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
      <div
        v-for="(load, core) in stats.cpu"
        :key="core"
        class="glass p-4 rounded-lg text-center"
      >
        <h3 class="text-sm text-gray-300 font-semibold">{{ core }}</h3>
        <p class="text-white font-bold mb-2">{{ load }}</p>
        <div class="w-full h-2 bg-gray-700 rounded">
          <div
            class="h-2 rounded transition-all duration-500"
            :class="getBarColor(parseFloat(load) || 0)"
            :style="{ width: (parseFloat(load) || 0) + '%' }"
          ></div>
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
  cpu: Record<string, string>  // например { "Ядро 1": "1.1%" }
  uptime: string
}

const stats = ref<Stats>({
  memory: { used: 0, total: 0 },
  disk: { used: 0, total: 0 },
  cpu: {},
  uptime: ''
})

const loading = ref(true)

const fetchStats = async () => {
  try {
    const res = await $fetch<Stats>('/api/stats')
    stats.value = res
    loading.value = false
    console.log('CPU loads:', stats.value.cpu)  // для отладки
  } catch (err) {
    console.error('Ошибка получения данных:', err)
    loading.value = false
  }
}

onMounted(() => {
  fetchStats()
  setInterval(fetchStats, 1000)
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

.loader {
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top: 4px solid #fff;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>