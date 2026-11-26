'use client'

import type { ClientUploadContext } from '@payloadcms/plugin-cloud-storage/types'
import { createClientUploadHandler } from '@payloadcms/plugin-cloud-storage/client'
import { formatAdminURL } from 'payload/shared'

export const SupabaseClientUploadHandler = createClientUploadHandler({
  handler: async ({
    apiRoute,
    collectionSlug,
    docPrefix,
    file,
    serverHandlerPath,
    serverURL,
    updateFilename,
  }): Promise<ClientUploadContext> => {
    const endpoint = formatAdminURL({ apiRoute, path: serverHandlerPath, serverURL })
    const response = await fetch(endpoint, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        collectionSlug,
        docPrefix,
        filename: file.name,
        filesize: file.size,
        mimeType: file.type,
      }),
    })

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as
        | { errors?: { message: string }[] }
        | null
      const message = payload?.errors?.map((error) => error.message).join(', ')
      throw new Error(message || `Could not prepare Supabase upload (${response.status})`)
    }

    const result = (await response.json()) as {
      clientUploadContext: ClientUploadContext
      filename?: string
      headers: Record<string, string>
      url: string
    }

    if (result.filename && result.filename !== file.name) updateFilename(result.filename)

    const upload = await fetch(result.url, {
      method: 'PUT',
      headers: result.headers,
      body: file,
    })
    if (!upload.ok) {
      throw new Error(`Supabase upload failed (${upload.status}): ${await upload.text()}`)
    }

    return {
      prefix: result.clientUploadContext.prefix,
      signedReceipt: result.clientUploadContext.signedReceipt,
    }
  },
})
