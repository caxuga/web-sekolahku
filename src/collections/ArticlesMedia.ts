import { APIError, type CollectionConfig } from 'payload'
import path from 'path'
import { getAltFromFilename } from '../utils/alt.util'
import { canCreateContent, canDeleteContent } from '../access/roles'

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024
const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp']

export const ArticlesMedia: CollectionConfig = {
  slug: 'articles-media',
  labels: {
    singular: 'Media Artikel',
    plural: 'Media Artikel',
  },
  admin: {
    description: 'Accepted formats: PNG, JPEG, and WebP. Maximum file size: 50MB. Invalid uploads will be rejected automatically.',
  },
  access: {
    read: () => true,
    create: canCreateContent,
    update: canCreateContent,
    delete: canDeleteContent,
  },
  hooks: {
    beforeChange: [
      ({ data, operation, req }) => {
        const fileSize = data?.filesize
        const mimeType = typeof req.file?.mimetype === 'string' ? req.file.mimetype.toLowerCase() : undefined

        if (typeof fileSize === 'number' && fileSize > MAX_FILE_SIZE_BYTES) {
          throw new APIError('File size exceeds 50MB. Please upload a smaller file.', 400)
        }

        if (mimeType && !ALLOWED_MIME_TYPES.includes(mimeType)) {
          throw new APIError('Only PNG, JPEG, and WebP images are allowed.', 400)
        }

        const originalFilename =
          typeof req.file?.name === 'string'
            ? req.file.name
            : operation === 'create' && typeof data?.filename === 'string'
              ? data.filename
              : undefined

        if (originalFilename) {
          data.alt = getAltFromFilename(originalFilename)
        }

        return data
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: {
        hidden: true,
      },
    },
  ],
  upload: {
    mimeTypes: ALLOWED_MIME_TYPES,
    staticDir: path.resolve(process.cwd(), 'media'),
  },
}
