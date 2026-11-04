/**
 * SIM_CASES is shared by the simulation specs (simulate.sim.spec.ts, autonomous-agent.sim.spec.ts),
 * and each must take only the requested cases it owns. Names are still checked against every spec's
 * cases, so a typo fails loudly instead of silently running nothing.
 */
import { selectCases, simCaseNames, type SimulationCase } from '@data-fair/lib-agents-sim'
import { cases } from './index.ts'
import { agentCases } from './autonomous-agents.ts'

export const allCases: SimulationCase[] = [...cases, ...agentCases]

/** The cases the names designate, every case when none is named; throws on an unknown name. */
export const resolveCases = (names: string[]): SimulationCase[] => selectCases(allCases, names)

export function selectOwnCases <T extends SimulationCase> (own: T[], names: string[] = simCaseNames()): T[] {
  if (names.length === 0) return own
  const selected = new Set(resolveCases(names).map(c => c.name))
  return own.filter(c => selected.has(c.name))
}
