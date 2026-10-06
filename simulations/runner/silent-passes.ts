// The person's pass that resolved a wait_for_user_action: they acted on the page, the assistant
// resumed the turn it had paused, and what they wrote in that pass was dropped so that they read
// the reply first. Nothing of theirs then stood between the assistant's request and its reply:
// a judged run read « Le brouillon a été validé » right after « cliquez sur Valider le
// brouillon », and the person told the assistant « Vous avez validé à ma place ». What they did
// in that pass goes back in the conversation, where they did it.

type Message = { role: string, text: string }
type Observation = { turn: number, tool: string, args?: unknown, result: string }

/** A pass with no message: where it falls in the conversation read from the chat, and what was done. */
export type SilentPass = { at: number, actions: string[] }

/** What the person did on the page in one pass, not what they looked at. */
export function passActions (observations: Observation[], turn: number): string[] {
  return observations.filter(o => o.turn === turn && o.tool !== 'look' && o.tool !== 'screenshot').map(o => {
    const args = (o.args ?? {}) as { name?: unknown, text?: unknown, key?: unknown, tab?: unknown }
    if (o.tool === 'click') return `clicked "${args.name}"`
    if (o.tool === 'type') return `typed "${args.text}" into "${args.name}"`
    if (o.tool === 'press') return args.name ? `pressed ${args.key} in "${args.name}"` : `pressed ${args.key}`
    if (o.tool === 'switch_tab') return `switched to tab ${args.tab}`
    return o.tool
  })
}

/** The conversation with the silent passes put back where they happened. */
export function withSilentPasses (conversation: Message[], passes: SilentPass[]): Message[] {
  const merged = [...conversation]
  for (const pass of [...passes].sort((a, b) => b.at - a.at)) {
    if (!pass.actions.length) continue
    merged.splice(pass.at, 0, { role: 'user', text: `(on the page, without writing a message: ${pass.actions.join(', ')})` })
  }
  return merged
}
