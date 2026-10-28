// counts per value of an array field, as a { value: count } object
const arrayFacet = (field: string) => [{ $unwind: '$' + field }, { $group: { _id: '$' + field, count: { $sum: 1 } } }]
const countsObject = (field: string) => ({ $arrayToObject: { $map: { input: '$' + field, as: 'el', in: { k: '$$el._id', v: '$$el.count' } } } })

export const reuseFacets = (query: Record<string, any>) => [
  { $match: query },
  { $facet: { portals: arrayFacet('portals'), requestedPortals: arrayFacet('requestedPortals') } },
  { $project: { portals: countsObject('portals'), requestedPortals: countsObject('requestedPortals') } }
]
