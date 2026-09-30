type StaticFilterValue = { id: string, title?: string }

/**
 * Value of a catalog query param combining the visitor's choices with the static filters
 * of the block: the visitor can only narrow the included values down, and the excluded
 * values are appended with a "-" prefix.
 */
export const staticFilterParam = (userValues?: string[], included: StaticFilterValue[] = [], excluded: StaticFilterValue[] = []) => {
  let values = userValues ?? []
  if (included.length) {
    const allowed = values.filter(value => included.some(v => v.id === value))
    values = allowed.length ? allowed : included.map(v => v.id)
  }
  const param = [...values, ...excluded.map(v => '-' + v.id)]
  return param.length ? param.join(',') : undefined
}

/** Whether a filter choice can be offered to the visitor given the static filters of the block */
export const isStaticFilterAllowed = (value: string, included: StaticFilterValue[] = [], excluded: StaticFilterValue[] = []) =>
  (!included.length || included.some(v => v.id === value)) && !excluded.some(v => v.id === value)
