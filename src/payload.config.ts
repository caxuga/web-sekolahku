import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { s3Storage } from '@payloadcms/storage-s3'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { ArticlesMedia } from './collections/ArticlesMedia'
import { Takwim } from './collections/Takwim'
import { Siaran } from './collections/Siaran'
import { Categories } from './collections/Categories'
import { PASSWORD_POLICY_UI_DESCRIPTION } from './utils/password-policy.util'
import { validateEnvironment } from './config/env.config'

const env = validateEnvironment()
const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const storageAdapters =
  env.storageDriver === 'r2' && env.r2
    ? [
        s3Storage({
          bucket: env.r2.bucket,
          clientUploads: true,
          collections: {
            media: {
              disablePayloadAccessControl: true,
              generateFileURL: ({ filename, prefix }) => {
                const key = prefix ? `${prefix}/${filename}` : filename
                return `${env.r2!.publicURL}/${key}`
              },
            },
            'articles-media': {
              disablePayloadAccessControl: true,
              generateFileURL: ({ filename, prefix }) => {
                const key = prefix ? `${prefix}/${filename}` : filename
                return `${env.r2!.publicURL}/${key}`
              },
            },
          },
          config: {
            credentials: {
              accessKeyId: env.r2.accessKeyId,
              secretAccessKey: env.r2.secretAccessKey,
            },
            endpoint: env.r2.endpoint,
            forcePathStyle: true,
            region: 'auto',
          },
        }),
      ]
    : []

export default buildConfig({
  admin: {
    user: Users.slug,
    autoRefresh: false,
    dateFormat: 'dd/MM/yyyy',
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, ArticlesMedia, Takwim, Siaran, Categories],
  editor: lexicalEditor(),
  graphQL: { disable: true },
  i18n: {
    translations: {
      en: {
        authentication: {
          newPassword: `New Password (${PASSWORD_POLICY_UI_DESCRIPTION})`,
        },
        general: {
          newPassword: `New Password (${PASSWORD_POLICY_UI_DESCRIPTION})`,
        },
      },
    },
  },
  secret: env.payloadSecret,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({ url: env.databaseURI }),
  sharp,
  storage: storageAdapters,
})
