export const pageFacets = (query: Record<string, any>, showAll: boolean) => {
  const aggregationPipeline = [
    {
      $facet: {
        types: [
          {
            $group: {
              _id: '$type',
              count: { $sum: 1 }
            }
          }
        ],
        portals: [
          {
            $unwind: '$portals'
          },
          {
            $group: {
              _id: '$portals',
              count: { $sum: 1 }
            }
          }
        ]
      }
    },
    {
      $replaceRoot: {
        newRoot: {
          types: {
            $arrayToObject: {
              $map: {
                input: {
                  $filter: {
                    input: '$types',
                    as: 'el',
                    cond: { $and: [{ $ne: ['$$el._id', null] }, { $ne: ['$$el._id', ''] }] }
                  }
                },
                as: 'el',
                in: { k: '$$el._id', v: '$$el.count' }
              }
            }
          },
          portals: {
            $arrayToObject: {
              $map: {
                input: {
                  $filter: {
                    input: '$portals',
                    as: 'el',
                    cond: { $and: [{ $ne: ['$$el._id', null] }, { $ne: ['$$el._id', ''] }] }
                  }
                },
                as: 'el',
                in: { k: '$$el._id', v: '$$el.count' }
              }
            }
          }
        }
      }
    }
  ] as any[]

  if (showAll) {
    aggregationPipeline[0].$facet.owners = [
      {
        $group: {
          _id: {
            type: '$owner.type',
            id: '$owner.id',
            name: '$owner.name',
            department: { $ifNull: ['$owner.department', null] },
            departmentName: { $ifNull: ['$owner.departmentName', null] }
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          count: 1,
          value: {
            type: '$_id.type',
            id: '$_id.id',
            name: '$_id.name',
            department: '$_id.department',
            departmentName: '$_id.departmentName'
          }
        }
      },
      {
        $group: {
          _id: {
            type: '$value.type',
            id: '$value.id',
            name: '$value.name'
          },
          count: { $sum: '$count' },
          departments: {
            $push: {
              department: '$value.department',
              departmentName: '$value.departmentName',
              count: '$count'
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          type: '$_id.type',
          id: '$_id.id',
          name: '$_id.name',
          count: 1,
          departments: {
            $filter: {
              input: '$departments',
              as: 'dept',
              cond: { $ne: ['$$dept.department', null] } // Filter null departments
            }
          }
        }
      }
    ]
    aggregationPipeline[1].$replaceRoot.newRoot.owners = { $ifNull: ['$owners', []] }
  } else {
    aggregationPipeline.unshift({ $match: query })
  }

  return aggregationPipeline
}
