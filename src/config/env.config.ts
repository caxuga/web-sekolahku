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
  databaseURL: string; payloadSecret: string; storageDriver: 'local' | 'r2'
  r2?: { bucket: string; endpoint: string; publicURL: string; accessKeyId: string; secretAccessKey: string }
}
export function validateEnvironment(): AppEnvironment {
  const visualPreview = isVisualPreview()
  const databaseURL = visualPreview ? 'postgresql://postgres:postgres@127.0.0.1:5432/web_sekolahku_preview_shell' : required('DATABASE_URL')
  if (!/^postgres(ql)?:\/\//i.test(databaseURL)) throw new Error('DATABASE_URL must be a PostgreSQL connection string')
  const payloadSecret = visualPreview ? 'preview-shell-only-secret-not-for-authentication-0001' : required('PAYLOAD_SECRET')
  if (payloadSecret.length < 32) throw new Error('PAYLOAD_SECRET must contain at least 32 characters')
  const storageDriver = process.env.STORAGE_DRIVER === 'r2' ? 'r2' : 'local'
  if (storageDriver === 'r2') return {
    databaseURL, payloadSecret, storageDriver,
    r2: { bucket: required('R2_BUCKET'), endpoint: required('R2_ENDPOINT'), publicURL: required('R2_PUBLIC_URL').replace(/\/$/, ''), accessKeyId: required('R2_ACCESS_KEY_ID'), secretAccessKey: required('R2_SECRET_ACCESS_KEY') },
  }
  return { databaseURL, payloadSecret, storageDriver }
}
