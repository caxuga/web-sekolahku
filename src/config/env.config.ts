export const isVisualPreview = () =>
  process.env.VERCEL_ENV === 'preview' &&
  process.env.CMS_PREVIEW_MODE === 'true' &&
  !process.env.DATABASE_URL?.trim()

const required = (name: string): string => {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

export type AppEnvironment = {
  databaseURL: string
  payloadSecret: string
  storageDriver: 'local' | 'supabase'
  supabase?: { url: string; bucket: string; serviceRoleKey: string }
}

export function validateEnvironment(): AppEnvironment {
  const visualPreview = isVisualPreview()
  const databaseURL = visualPreview
    ? 'postgresql://postgres:postgres@127.0.0.1:5432/web_sekolahku_preview_shell'
    : required('DATABASE_URL')
  if (!/^postgres(ql)?:\/\//i.test(databaseURL)) {
    throw new Error('DATABASE_URL must be a PostgreSQL connection string')
  }

  const payloadSecret = visualPreview
    ? 'preview-shell-only-secret-not-for-authentication-0001'
    : required('PAYLOAD_SECRET')
  if (payloadSecret.length < 32) throw new Error('PAYLOAD_SECRET must contain at least 32 characters')

  const storageDriver = visualPreview
    ? 'local'
    : process.env.STORAGE_DRIVER === 'supabase'
      ? 'supabase'
      : 'local'

  if (storageDriver === 'supabase') {
    const url = required('SUPABASE_URL').replace(/\/$/, '')
    if (!/^https:\/\//i.test(url)) throw new Error('SUPABASE_URL must use HTTPS')
    return {
      databaseURL,
      payloadSecret,
      storageDriver,
      supabase: {
        url,
        bucket: required('SUPABASE_STORAGE_BUCKET'),
        serviceRoleKey: required('SUPABASE_SERVICE_ROLE_KEY'),
      },
    }
  }

  return { databaseURL, payloadSecret, storageDriver }
}
