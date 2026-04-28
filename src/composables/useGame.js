import { ref, computed } from 'vue'
import { KEY_NEIGHBORS, TARGET_POOL, MAX_LIVES } from '../constants/keyboard'

export function useGame()
{
    const phase = ref('idle')   // idle | playing | paused | gameover
    const score = ref(0)
    const streak = ref(0)
    const lives = ref(MAX_LIVES)
    const round = ref(0)
    const best = ref(parseInt(localStorage.getItem('dp-best') || '0'))
    const isNewBest = ref(false)

    const target = ref(null)
    const validKeys = ref([])
    const feedback = ref('press start')
    const roundMs = ref(2500)
    const timerPct = ref(0)
    const guideOn = ref(false)
    const flashMap = ref({})

    // elapsed accumulates ms consumed before a pause; frameStart marks the RAF batch origin.
    let rafId = null
    let frameStart = 0
    let elapsed = 0
    let pendingRoundTimer = null

    const displayTarget = computed(() =>
    {
        if (phase.value === 'paused') return '||'
        if (!target.value) return '—'
        return target.value
    })

    const livesDisplay = computed(() =>
        '■'.repeat(lives.value) + '□'.repeat(MAX_LIVES - lives.value)
    )

    const timerBarColor = computed(() =>
    {
        const p = timerPct.value
        if (p < 0.3) return 'var(--red)'
        if (p < 0.6) return 'var(--amber)'
        return 'var(--green)'
    })

    function flashKey(k, type)
    {
        flashMap.value[k] = type
        setTimeout(() => { delete flashMap.value[k] }, 380)
    }

    function pickTarget()
    {
        let t
        do
        {
            t = TARGET_POOL[Math.floor(Math.random() * TARGET_POOL.length)]
        } while (t === target.value)
        return t
    }

    function startTimerLoop()
    {
        frameStart = performance.now()
        function frame()
        {
            const total = elapsed + (performance.now() - frameStart)
            const pct = Math.max(0, 1 - total / roundMs.value)
            timerPct.value = pct
            if (pct <= 0) { onTimeout(); return }
            rafId = requestAnimationFrame(frame)
        }
        rafId = requestAnimationFrame(frame)
    }

    function stopTimer()
    {
        if (rafId !== null)
        {
            cancelAnimationFrame(rafId)
            rafId = null
        }
    }

    // Wraps setTimeout so it can be cancelled when the game pauses or restarts.
    function scheduleRound(delay)
    {
        pendingRoundTimer = setTimeout(() =>
        {
            pendingRoundTimer = null
            if (phase.value === 'playing') startRound()
        }, delay)
    }

    function cancelScheduled()
    {
        if (pendingRoundTimer !== null)
        {
            clearTimeout(pendingRoundTimer)
            pendingRoundTimer = null
        }
    }

    function startRound()
    {
        stopTimer()
        target.value = pickTarget()
        validKeys.value = KEY_NEIGHBORS[target.value]
        round.value++
        elapsed = 0
        feedback.value = 'press a nearby key — not ' + target.value + '!'
        timerPct.value = 1
        startTimerLoop()
    }

    function onTimeout()
    {
        stopTimer()
        timerPct.value = 0
        streak.value = 0
        feedback.value = 'too slow!'
        target.value = null
        loseLife()
    }

    function loseLife()
    {
        lives.value--
        if (lives.value <= 0)
        {
            endGame()
        } else
        {
            scheduleRound(900)
        }
    }

    function endGame()
    {
        stopTimer()
        cancelScheduled()
        target.value = null
        timerPct.value = 0
        isNewBest.value = score.value > best.value
        if (isNewBest.value)
        {
            best.value = score.value
            localStorage.setItem('dp-best', String(best.value))
        }
        phase.value = 'gameover'
    }

    function handleInput(k)
    {
        if (phase.value !== 'playing' || !target.value) return

        const usedMs = elapsed + (performance.now() - frameStart)

        if (k === target.value)
        {
            stopTimer()
            timerPct.value = 0
            streak.value = 0
            feedback.value = 'you pressed it! -1 life'
            flashKey(k, 'bad')
            target.value = null
            loseLife()

        } else if (validKeys.value.includes(k))
        {
            stopTimer()
            const bonus = Math.max(0, Math.round((1 - usedMs / roundMs.value) * 100))
            const pts = 10 + bonus
            score.value += pts
            streak.value++
            if (score.value > best.value)
            {
                best.value = score.value
                localStorage.setItem('dp-best', String(best.value))
            }
            feedback.value = '+' + pts + ' pts' + (streak.value > 1 ? ' x' + streak.value : '')
            flashKey(k, 'good')
            timerPct.value = 0
            target.value = null
            scheduleRound(600)

        } else
        {
            stopTimer()
            streak.value = 0
            feedback.value = 'too far! try a closer key'
            flashKey(k, 'bad')
            timerPct.value = 0
            target.value = null
            scheduleRound(800)
        }
    }

    function startGame()
    {
        stopTimer()
        cancelScheduled()
        score.value = 0
        streak.value = 0
        lives.value = MAX_LIVES
        round.value = 0
        isNewBest.value = false
        phase.value = 'playing'
        feedback.value = ''
        startRound()
    }

    function togglePause()
    {
        if (phase.value === 'playing')
        {
            cancelScheduled()
            if (target.value !== null)
            {
                // Snapshot consumed time before freezing so resume continues exactly where it left off
                elapsed += performance.now() - frameStart
                stopTimer()
            }
            phase.value = 'paused'
            feedback.value = 'paused — p or esc to resume'

        } else if (phase.value === 'paused')
        {
            phase.value = 'playing'
            if (target.value !== null)
            {
                feedback.value = 'press a nearby key — not ' + target.value + '!'
                startTimerLoop()
            } else
            {
                startRound()
            }
        }
    }

    function cleanup()
    {
        stopTimer()
        cancelScheduled()
    }

    return {
        phase, score, streak, lives, round, best, isNewBest,
        target, validKeys, feedback, roundMs, timerPct, guideOn, flashMap,
        displayTarget, livesDisplay, timerBarColor,
        handleInput, startGame, togglePause, cleanup,
    }
}
