export const ROWS = [
    { keys: 'QWERTYUIOP'.split(''), offset: 0 },
    { keys: 'ASDFGHJKL'.split(''), offset: 0.5 },
    { keys: 'ZXCVBNM'.split(''), offset: 1.2 },
]

export const KEY_POS = {}
ROWS.forEach(({ keys, offset }, row) =>
    keys.forEach((k, col) => { KEY_POS[k] = { row, col: col + offset } })
)

export const KEY_NEIGHBORS = {}
Object.keys(KEY_POS).forEach(k =>
{
    const { row, col } = KEY_POS[k]
    KEY_NEIGHBORS[k] = Object.keys(KEY_POS).filter(n =>
        n !== k &&
        Math.abs(KEY_POS[n].row - row) <= 1 &&
        Math.abs(KEY_POS[n].col - col) <= 1.6
    )
})

// Only interior keys (4+ neighbors) are eligible as "don't press" targets.
// Edge keys like Q, Z, P have too few neighbors to make fair rounds.
export const TARGET_POOL = Object.keys(KEY_POS).filter(k => KEY_NEIGHBORS[k].length >= 4)

export const MAX_LIVES = 3
