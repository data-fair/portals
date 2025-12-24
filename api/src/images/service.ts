import type { Image } from '#types/image/index.js'
import type { Account } from '@data-fair/lib-express'
import debugModule from 'debug'
import { randomUUID } from 'node:crypto'
import mongo from '#mongo'

const debug = debugModule('images')

export type ResourceType = 'page' | 'portal'

/**
 * Duplicate a single image with its mobile variant for a given resource.
 * Returns the new image id. If source is missing, returns the original id.
 *
 * @param sourceImageId The id of the image to duplicate
 * @param resourceType The type of resource the new image will be associated with
 * @param resourceId The id of the resource the new image will be associated with
 * @param newOwner The owner of the new image
 * @returns The id of the duplicated image or the original id if source is missing
 */
export const duplicateImage = async (
  sourceImageId: string,
  resourceType: ResourceType,
  resourceId: string,
  newOwner: Account
): Promise<string> => {
  const sourceImage = await mongo.images.findOne({ _id: sourceImageId })
  if (!sourceImage) {
    debug(`Image ${sourceImageId} not found, skipping`)
    return sourceImageId
  }

  const newImageId = randomUUID()
  const createdAt = new Date().toISOString()

  const newImage: Image = {
    ...sourceImage,
    _id: newImageId,
    owner: { ...newOwner, department: undefined, departmentName: undefined },
    resource: {
      type: resourceType,
      _id: resourceId
    },
    createdAt
  }

  // Duplicate mobile variant if it exists
  if (newImage.mobileAlt) {
    const sourceMobileImage = await mongo.images.findOne({ _id: sourceImageId + '-mobile' })
    if (sourceMobileImage) {
      const newMobileImage: Image = {
        ...sourceMobileImage,
        _id: newImageId + '-mobile',
        owner: { ...newOwner, department: undefined, departmentName: undefined },
        resource: {
          type: resourceType,
          _id: resourceId
        },
        createdAt
      }
      await mongo.images.insertOne(newMobileImage)
    }
  }

  await mongo.images.insertOne(newImage)
  return newImageId
}
