import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { ArticlesMedia } from './collections/ArticlesMedia'
import { Takwim } from './collections/Takwim'
import { Siaran } from './collections/Siaran'
import { Categories } from './collections/Categories'
import { SchoolSettings } from './globals/SchoolSettings'
import { PASSWORD_POLICY_UI_DESCRIPTION } from './utils/password-policy.util'
import { validateEnvironment } from './config/env.config'
import { supabaseStorage } from './storage/supabase/adapter'

const env = validateEnvironment()
const dirname = path.dirname(fileURLToPath(import.meta.url))
const storagePlugins =
  env.storageDriver === 'supabase' && env.supabase
    ? [
        supabaseStorage({
          url: env.supabase.url,
          bucket: env.supabase.bucket,
          serviceRoleKey: env.supabase.serviceRoleKey,
          clientUploads: true,
          collections: {
            media: { prefix: 'media' },
            'articles-media': { prefix: 'articles-media' },
          },
        }),
      ]
    : []

export default buildConfig({
  admin: {
    user: Users.slug,
    autoRefresh: false,
    dateFormat: 'dd/MM/yyyy',
    importMap: { baseDir: path.resolve(dirname) },
  },
  collections: [Users, Media, ArticlesMedia, Takwim, Siaran, Categories],
  globals: [SchoolSettings],
  editor: lexicalEditor(),
  upload: { limits: { fileSize: 50 * 1024 * 1024 } },
  graphQL: { disable: true },
  i18n: {
    translations: {
      en: {
        authentication: { newPassword: `New Password (${PASSWORD_POLICY_UI_DESCRIPTION})` },
        general: { newPassword: `New Password (${PASSWORD_POLICY_UI_DESCRIPTION})` },
      },
    },
  },
  secret: env.payloadSecret,
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: postgresAdapter({
    pool: { connectionString: env.databaseURL, max: 1, connectionTimeoutMillis: 10_000 },
    migrationDir: path.resolve(dirname, 'migrations'),
    schemaName: 'web_sekolahku',
  }),
  sharp,
  plugins: storagePlugins,
})
