<template>
  <div class="keyboard" :class="{ 'is-paused': isPaused }">
    <div v-for="row in ROWS" :key="row.keys[0]" class="kb-row" :style="rowStyle(row)">
      <div
        v-for="k in row.keys"
        :key="k"
        class="key"
        :class="keyClass(k)"
        @click="emit('key', k)"
      >{{ k }}</div>
    </div>
  </div>
</template>

<script setup>
import { ROWS } from '../constants/keyboard'

const props = defineProps({
  target:    { type: String,  default: null        },
  validKeys: { type: Array,   default: () => []    },
  flashMap:  { type: Object,  default: () => ({})  },
  guideOn:   { type: Boolean, default: false       },
  isPaused:  { type: Boolean, default: false       },
})

const emit = defineEmits(['key'])

function rowStyle(row) {
  if (row.offset === 0) return {}
  return { marginLeft: `calc(${row.offset} * (var(--key-size) + var(--gap)))` }
}

function keyClass(k) {
  const flash = props.flashMap[k]
  if (flash === 'good') return 'state-flash-good'
  if (flash === 'bad')  return 'state-flash-bad'
  if (props.guideOn) {
    if (k === props.target)          return 'state-target'
    if (props.validKeys.includes(k)) return 'state-valid'
  }
  return ''
}
</script>
