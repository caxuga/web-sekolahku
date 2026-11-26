import type { Adapter, ClientUploadsAccess, CollectionOptions, GeneratedAdapter } from '@payloadcms/plugin-cloud-storage/types'
import { initClientUploads, resolveSignedURLKey, buildStoragePathData, getStorageFilePath } from '@payloadcms/plugin-cloud-storage/utilities'
import { cloudStoragePlugin } from '@payloadcms/plugin-cloud-storage'
import { APIError, Forbidden, type Config, type PayloadHandler, type UploadCollectionSlug } from 'payload'
import { assertClientUploadAccess, assertClientUploadAllowed, assertClientUploadFileSize } from 'payload/internal'
import fs from 'node:fs/promises'

type CollectionOption = true | { prefix?: string }
type SupabaseStorageOptions = {
  url: string
  bucket: string
  serviceRoleKey: string
  collections: Partial<Record<UploadCollectionSlug, CollectionOption>>
  clientUploads?: boolean | { access?: ClientUploadsAccess }
}

const encodeKey = (key: string) => key.split('/').map(encodeURIComponent).join('/')
const apiURL = (url: string) => `${url.replace(/\/$/, '')}/storage/v1`

function createSupabaseAdapter(options: SupabaseStorageOptions, collectionPrefix = ''): Adapter {
  const baseURL = apiURL(options.url)
  const headers = {
    apikey: options.serviceRoleKey,
    Authorization: `Bearer ${options.serviceRoleKey}`,
  }

  return ({ collection, prefix = collectionPrefix }): GeneratedAdapter => ({
    name: 'supabase-storage',
    clientUploads: options.clientUploads ?? true,
    requiresClientUploadReceipt: true,

    generateURL: ({ filename, prefix: docPrefix = '' }) => {
      const { storageFilePath } = buildStoragePathData({
        collectionPrefix: prefix,
        docPrefix,
        filename,
      })
      return `${baseURL}/object/public/${encodeURIComponent(options.bucket)}/${encodeKey(storageFilePath)}`
    },

    handleUpload: async ({ data, file, storageFilePath }) => {
      const body = file.tempFilePath ? await fs.readFile(file.tempFilePath) : file.buffer
      const response = await fetch(
        `${baseURL}/object/${encodeURIComponent(options.bucket)}/${encodeKey(storageFilePath)}`,
        {
          method: 'POST',
          headers: {
            ...headers,
            'Content-Type': file.mimeType || 'application/octet-stream',
            'Cache-Control': 'max-age=3600',
            'x-upsert': 'false',
          },
          body,
        },
      )
      if (!response.ok) {
        throw new Error(`Supabase Storage upload failed (${response.status}): ${await response.text()}`)
      }
    },

    handleDelete: async ({ storageFilePath }) => {
      const response = await fetch(`${baseURL}/object/${encodeURIComponent(options.bucket)}`, {
        method: 'DELETE',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ prefixes: [storageFilePath] }),
      })
      if (!response.ok) {
        throw new Error(`Supabase Storage delete failed (${response.status}): ${await response.text()}`)
      }
    },

    staticHandler: async (req, { doc, headers: incomingHeaders, params }) => {
      try {
        const storageFilePath = await getStorageFilePath({
          clientUploadContext: params.clientUploadContext,
          collection,
          collectionPrefix: prefix,
          doc,
          filename: params.filename,
          req,
        })
        const response = await fetch(
          `${baseURL}/object/public/${encodeURIComponent(options.bucket)}/${encodeKey(storageFilePath)}`,
          { signal: req.signal },
        )
        if (!response.ok) return new Response(null, { status: response.status })
        const responseHeaders = new Headers(incomingHeaders)
        response.headers.forEach((value, key) => responseHeaders.set(key, value))
        return new Response(response.body, { status: response.status, headers: responseHeaders })
      } catch (error) {
        req.payload.logger.error({ err: error, msg: 'Supabase Storage static handler failed' })
        return new Response('Storage read failed', { status: 500 })
      }
    },
  })
}

export const supabaseStorage = (options: SupabaseStorageOptions) => (incomingConfig: Config): Config => {
  const clientUploads = options.clientUploads ?? true
  const clientAccess = typeof clientUploads === 'object' ? clientUploads.access : undefined

  const serverHandler: PayloadHandler = async (req) => {
    if (!req.json) throw new APIError('Content-Type expected to be application/json', 400)
    const { collectionSlug, docPrefix, filename, filesize, mimeType } = (await req.json()) as {
      collectionSlug: UploadCollectionSlug
      docPrefix?: string
      filename: string
      filesize: number
      mimeType: string
    }

    await assertClientUploadAccess({ collectionSlug, req })
    const collectionOptions = options.collections[collectionSlug]
    if (!collectionOptions) throw new APIError(`Collection ${collectionSlug} is not configured for Supabase Storage`, 400)

    const access = clientAccess ?? (({ req: request }) => Boolean(request.user))
    if (!(await access({ collectionSlug, req }))) throw new Forbidden()

    const collection = req.payload.collections[collectionSlug]?.config
    if (!collection) throw new APIError(`Collection ${collectionSlug} was not found`, 404)
    assertClientUploadAllowed({ collection, filename, mimeType })

    const { clientUploadContext, storageFilePath, sanitizedFilename, sanitizedDocPrefix } =
      await resolveSignedURLKey({
        collectionPrefix: typeof collectionOptions === 'object' ? collectionOptions.prefix : '',
        collectionSlug,
        docPrefix,
        filename,
        req,
      })

    let sizeLimit = req.payload.config.upload.limits?.fileSize\n    if (sizeLimit === Infinity) sizeLimit = undefined
    if (typeof filesize !== 'number' || !Number.isFinite(filesize) || filesize < 0) {
      throw new APIError('Invalid file size', 400)
    }
    assertClientUploadFileSize(filesize)
    if (typeof sizeLimit === 'number' && sizeLimit !== Infinity && filesize > sizeLimit) {
      throw new APIError(`File exceeds the configured upload limit of ${Math.round(sizeLimit / 1024 / 1024)} MB`, 400)
    }

    const baseURL = apiURL(options.url)
    const signedResponse = await fetch(
      `${baseURL}/object/upload/sign/${encodeURIComponent(options.bucket)}/${encodeKey(storageFilePath)}`,
      {
        method: 'POST',
        headers: { apikey: options.serviceRoleKey, Authorization: `Bearer ${options.serviceRoleKey}`, 'Content-Type': 'application/json' },
        body: '{}',
      },
    )
    if (!signedResponse.ok) {
      throw new APIError(`Could not create Supabase upload URL: ${await signedResponse.text()}`, signedResponse.status)
    }
    const signedData = (await signedResponse.json()) as { url?: string }
    if (!signedData.url) throw new APIError('Supabase did not return a signed upload URL', 502)

    return Response.json({
      clientUploadContext,
      filename: sanitizedFilename,
      docPrefix: sanitizedDocPrefix,
      headers: { 'Content-Type': mimeType, 'Cache-Control': 'max-age=3600' },
      url: signedData.url.startsWith('http')
        ? signedData.url
        : `${baseURL}${signedData.url.startsWith('/') ? '' : '/'}${signedData.url}`,
    })
  }

  initClientUploads({
    clientHandler: './storage/supabase/client#SupabaseClientUploadHandler',
    collections: options.collections,
    config: incomingConfig,
    enabled: Boolean(clientUploads),
    serverHandler,
    serverHandlerPath: '/storage-supabase-generate-signed-url',
  })

  const configuredCollections = Object.fromEntries(
    Object.entries(options.collections).map(([slug, collectionOptions]) => [
      slug,
      {
        ...(collectionOptions === true ? {} : collectionOptions),
        adapter: createSupabaseAdapter(
          options,
          typeof collectionOptions === 'object' ? collectionOptions.prefix : '',
        ),
        disablePayloadAccessControl: true as const,
      },
    ]),
  ) as Partial<Record<UploadCollectionSlug, CollectionOptions>>

  const configWithDisabledLocalStorage: Config = {
    ...incomingConfig,
    collections: (incomingConfig.collections ?? []).map((collection) =>
      options.collections[collection.slug as UploadCollectionSlug]
        ? {
            ...collection,
            upload: {
              ...(typeof collection.upload === 'object' ? collection.upload : {}),
              disableLocalStorage: true,
            },
          }
        : collection,
    ),
  }

  return cloudStoragePlugin({
    collections: configuredCollections,
  })(configWithDisabledLocalStorage)
}
