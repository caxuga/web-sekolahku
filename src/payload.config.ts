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

const storagePlugins =
  env.storageDriver === 's3' && env.s3
    ? [
        s3Storage({
          collections: { media: true, 'articles-media': true },
          bucket: env.s3.bucket,
          config: {
            credentials: {
              accessKeyId: env.s3.accessKeyId,
              secretAccessKey: env.s3.secretAccessKey,
            },
            endpoint: env.s3.endpoint,
            forcePathStyle: true,
            region: env.s3.region,
          },
          clientUploads: true,
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
  plugins: storagePlugins,
})
