const required = (name: string): string => {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

export type AppEnvironment = {
  databaseURI: string
  payloadSecret: string
  storageDriver: 'local' | 'r2'
  r2?: {
    bucket: string
    endpoint: string
    publicURL: string
    accessKeyId: string
    secretAccessKey: string
  }
}

/**
 * Validate configuration before Payload initializes. Deployment secrets belong
 * in Vercel Environment Variables, not in tracked files or source code.
 */
export function validateEnvironment(): AppEnvironment {
  const databaseURI = required('DATABASE_URI')
  const payloadSecret = required('PAYLOAD_SECRET')

  if (payloadSecret.length < 32) {
    throw new Error('PAYLOAD_SECRET must contain at least 32 characters')
  }

  const storageDriver = process.env.STORAGE_DRIVER === 'r2' ? 'r2' : 'local'

  if (storageDriver === 'r2') {
    return {
      databaseURI,
      payloadSecret,
      storageDriver,
      r2: {
        bucket: required('R2_BUCKET'),
        endpoint: required('R2_ENDPOINT'),
        publicURL: required('R2_PUBLIC_URL').replace(/\/$/, ''),
        accessKeyId: required('R2_ACCESS_KEY_ID'),
        secretAccessKey: required('R2_SECRET_ACCESS_KEY'),
      },
    }
  }

  return { databaseURI, payloadSecret, storageDriver }
}
