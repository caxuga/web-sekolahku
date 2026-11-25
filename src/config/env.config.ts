export const isVisualPreview = () =>
  process.env.VERCEL_ENV === 'preview' &&
  process.env.CMS_PREVIEW_MODE === 'true' &&
  !process.env.DATABASE_URI?.trim()

const required = (name: string): string => {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}
export type AppEnvironment = {
  databaseURI: string; payloadSecret: string; storageDriver: 'local' | 'r2'
  r2?: { bucket: string; endpoint: string; publicURL: string; accessKeyId: string; secretAccessKey: string }
}
export function validateEnvironment(): AppEnvironment {
  const visualPreview = isVisualPreview()
  const databaseURI = visualPreview ? 'mongodb://127.0.0.1:27017/web-sekolahku-preview-shell' : required('DATABASE_URI')
  const payloadSecret = visualPreview ? 'preview-shell-only-secret-not-for-authentication-0001' : required('PAYLOAD_SECRET')
  if (payloadSecret.length < 32) throw new Error('PAYLOAD_SECRET must contain at least 32 characters')
  const storageDriver = process.env.STORAGE_DRIVER === 'r2' ? 'r2' : 'local'
  if (storageDriver === 'r2') return {
    databaseURI, payloadSecret, storageDriver,
    r2: { bucket: required('R2_BUCKET'), endpoint: required('R2_ENDPOINT'), publicURL: required('R2_PUBLIC_URL').replace(/\/$/, ''), accessKeyId: required('R2_ACCESS_KEY_ID'), secretAccessKey: required('R2_SECRET_ACCESS_KEY') },
  }
  return { databaseURI, payloadSecret, storageDriver }
}
