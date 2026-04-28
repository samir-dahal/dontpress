<template>
  <GameOverModal
    v-if="phase === 'gameover'"
    :score="score"
    :round="round"
    :best="best"
    :isNewBest="isNewBest"
    @restart="startGame"
  />

  <main class="game-root">
    <h1 class="game-title">don't press</h1>

    <div class="target-display">{{ displayTarget }}</div>
    <div class="feedback">{{ feedback }}</div>

    <div class="stats">
      <div class="stat">
        <div class="stat-value">{{ score }}</div>
        <div class="stat-label">score</div>
      </div>
      <div class="stat">
        <div class="stat-value">{{ streak }}</div>
        <div class="stat-label">streak</div>
      </div>
      <div class="stat">
        <div class="stat-value lives-display">{{ livesDisplay }}</div>
        <div class="stat-label">lives</div>
      </div>
      <div class="stat">
        <div class="stat-value">{{ round > 0 ? round : '—' }}</div>
        <div class="stat-label">round</div>
      </div>
    </div>

    <div class="timer-track">
      <div
        class="timer-bar"
        :style="{ width: (timerPct * 100) + '%', background: timerBarColor }"
      ></div>
    </div>

    <Keyboard
      :target="target"
      :validKeys="validKeys"
      :flashMap="flashMap"
      :guideOn="guideOn"
      :isPaused="phase === 'paused'"
      @key="handleInput"
    />

    <div class="controls">
      <button v-if="phase === 'idle'" @click="startGame">start</button>
      <button v-else @click="startGame">restart</button>

      <button
        v-if="phase === 'playing' || phase === 'paused'"
        class="btn-secondary"
        @click="togglePause"
      >{{ phase === 'paused' ? 'resume' : 'pause' }}</button>

      <label>
        <input type="checkbox" v-model="guideOn" role="switch" />
        key guide
      </label>

      <label>
        <select
          v-model.number="roundMs"
          style="font-family: inherit; font-size: 0.75rem; padding: 0.3rem 0.5rem;"
        >
          <option :value="4000">easy (4s)</option>
          <option :value="2500">normal (2.5s)</option>
          <option :value="1500">hard (1.5s)</option>
        </select>
      </label>
    </div>

    <div class="best-badge">{{ best > 0 ? 'best: ' + best : '' }}</div>
  </main>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { KEY_POS } from './constants/keyboard'
import { useGame } from './composables/useGame'
import Keyboard from './components/Keyboard.vue'
import GameOverModal from './components/GameOverModal.vue'

const {
  phase, score, streak, lives, round, best, isNewBest,
  target, validKeys, feedback, roundMs, timerPct, guideOn, flashMap,
  displayTarget, livesDisplay, timerBarColor,
  handleInput, startGame, togglePause, cleanup,
} = useGame()

function handleKeydown(e) {
  if (e.repeat) return
  const k = e.key.toUpperCase()

  if (k === 'ESCAPE' || k === 'P') {
    if (phase.value === 'playing' || phase.value === 'paused') {
      e.preventDefault()
      togglePause()
    }
    return
  }

  if (KEY_POS[k]) {
    e.preventDefault()
    handleInput(k)
  }
}

onMounted(()   => document.addEventListener('keydown', handleKeydown))
onUnmounted(() => { document.removeEventListener('keydown', handleKeydown); cleanup() })
</script>
