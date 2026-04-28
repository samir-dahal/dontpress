<template>
  <div class="modal-backdrop">
    <div class="modal-card">
      <div class="modal-title">game over</div>
      <div class="modal-stats">
        <div class="modal-stat-row">
          <span class="modal-stat-label">score</span>
          <span class="modal-stat-value">
            {{ score }}
            <span v-if="isNewBest" class="new-best-tag">new best</span>
          </span>
        </div>
        <div class="modal-stat-row">
          <span class="modal-stat-label">rounds</span>
          <span class="modal-stat-value">{{ round }}</span>
        </div>
        <div v-if="best > 0" class="modal-stat-row">
          <span class="modal-stat-label">best</span>
          <span class="modal-stat-value">{{ best }}</span>
        </div>
      </div>
      <button @click="emit('restart')">play again</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  score:     { type: Number,  required: true  },
  round:     { type: Number,  required: true  },
  best:      { type: Number,  required: true  },
  isNewBest: { type: Boolean, default: false  },
})

const emit = defineEmits(['restart'])
</script>
