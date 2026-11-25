const required = (name: string): string => {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

export type AppEnvironment = {
  databaseURI: string
  payloadSecret: string
  storageDriver: 'local' | 's3'
  s3?: {
    bucket: string
    endpoint: string
    region: string
    accessKeyId: string
    secretAccessKey: string
  }
}

/**
 * Validate configuration before Payload initializes. Unlike the former AWS
 * Secrets Manager loader, this fails closed instead of silently starting with
 * missing credentials. Configure secrets in the deployment platform.
 */
export function validateEnvironment(): AppEnvironment {
  const databaseURI = required('DATABASE_URI')
  const payloadSecret = required('PAYLOAD_SECRET')

  if (payloadSecret.length < 32) {
    throw new Error('PAYLOAD_SECRET must contain at least 32 characters')
  }

  const storageDriver = process.env.STORAGE_DRIVER === 's3' ? 's3' : 'local'

  if (storageDriver === 's3') {
    return {
      databaseURI,
      payloadSecret,
      storageDriver,
      s3: {
        bucket: required('S3_BUCKET_NAME'),
        endpoint: required('S3_ENDPOINT'),
        region: process.env.S3_REGION?.trim() || 'auto',
        accessKeyId: required('S3_ACCESS_KEY_ID'),
        secretAccessKey: required('S3_SECRET_ACCESS_KEY'),
      },
    }
  }

  return { databaseURI, payloadSecret, storageDriver }
}
