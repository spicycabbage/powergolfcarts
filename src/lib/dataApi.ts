/**
 * Minimal MongoDB Atlas Data API wrapper.
 * When process.env.USE_DATA_API === '1', use these helpers instead of direct DB connections.
 */

type AnyRecord = Record<string, any>

const DATA_API_BASE = process.env.ATLAS_DATA_API_URL || ''
const DATA_API_KEY = process.env.ATLAS_DATA_API_KEY || ''
const DATA_SOURCE = process.env.ATLAS_DATA_API_DATA_SOURCE || process.env.ATLAS_DATA_SOURCE || ''
const DATABASE = process.env.ATLAS_DATA_API_DATABASE || process.env.MONGODB_DB || 'ecommerce'

function useDataApi(): boolean {
  return process.env.USE_DATA_API === '1'
}

function requiredEnv(): void {
  if (!DATA_API_BASE || !DATA_API_KEY || !DATA_SOURCE) {
    throw new Error('Atlas Data API env vars missing: ATLAS_DATA_API_URL, ATLAS_DATA_API_KEY, ATLAS_DATA_API_DATA_SOURCE')
  }
}

async function call<T = any>(action: string, body: AnyRecord): Promise<T> {
  requiredEnv()
  const url = `${DATA_API_BASE.replace(/\/$/, '')}/action/${action}`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'api-key': DATA_API_KEY,
    },
    // Data API only accepts POST JSON bodies
    body: JSON.stringify({
      dataSource: DATA_SOURCE,
      database: DATABASE,
      ...body,
    }),
    // Prevent Next from caching server-to-server calls inadvertently
    cache: 'no-store',
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Data API ${action} failed: ${res.status} ${res.statusText} ${text}`)
  }
  return res.json() as Promise<T>
}

function toOid(id: string | any): any {
  if (!id) return id
  if (typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id)) return { $oid: id }
  return id
}

export function isUsingDataApi(): boolean { return useDataApi() }

export async function findOne(collection: string, filter: AnyRecord, projection?: AnyRecord, sort?: AnyRecord): Promise<any | null> {
  if (!useDataApi()) throw new Error('findOne called without USE_DATA_API=1')
  const normalizedFilter = replaceIdOperators(filter)
  const result = await call<{ document?: any }>('findOne', {
    collection,
    filter: normalizedFilter,
    projection,
    sort,
  })
  return result?.document || null
}

export async function findMany(collection: string, params: {
  filter?: AnyRecord
  projection?: AnyRecord
  sort?: AnyRecord
  limit?: number
  skip?: number
}): Promise<any[]> {
  if (!useDataApi()) throw new Error('findMany called without USE_DATA_API=1')
  const { filter = {}, projection, sort, limit, skip } = params || {}
  const normalizedFilter = replaceIdOperators(filter)
  const result = await call<{ documents?: any[] }>('find', {
    collection,
    filter: normalizedFilter,
    projection,
    sort,
    limit,
    skip,
  })
  return Array.isArray(result?.documents) ? result!.documents! : []
}

export async function count(collection: string, filter?: AnyRecord): Promise<number> {
  if (!useDataApi()) throw new Error('count called without USE_DATA_API=1')
  const normalizedFilter = replaceIdOperators(filter || {})
  const result = await call<{ count: number }>('count', {
    collection,
    filter: normalizedFilter,
  })
  return Number(result?.count || 0)
}

export async function insertOne(collection: string, document: AnyRecord): Promise<string> {
  if (!useDataApi()) throw new Error('insertOne called without USE_DATA_API=1')
  const result = await call<{ insertedId: string }>('insertOne', {
    collection,
    document,
  })
  return String(result?.insertedId || '')
}

export async function updateOne(collection: string, filter: AnyRecord, update: AnyRecord): Promise<number> {
  if (!useDataApi()) throw new Error('updateOne called without USE_DATA_API=1')
  const normalizedFilter = replaceIdOperators(filter)
  const result = await call<{ matchedCount: number; modifiedCount: number }>('updateOne', {
    collection,
    filter: normalizedFilter,
    update,
  })
  return Number(result?.modifiedCount || 0)
}

// Replace simple string ids with {$oid: <id>} recursively for common fields
function replaceIdOperators(obj: AnyRecord): AnyRecord {
  if (!obj || typeof obj !== 'object') return obj
  if (Array.isArray(obj)) return obj.map(replaceIdOperators)

  const out: AnyRecord = {}
  for (const [k, v] of Object.entries(obj)) {
    if ((k === '_id' || k.endsWith('._id') || k === 'category' || k === 'categories' || k === 'parent') && typeof v === 'string') {
      out[k] = toOid(v)
    } else if (k === '$in' || k === '$nin') {
      out[k] = Array.isArray(v) ? v.map(toOid) : v
    } else if (typeof v === 'object' && v !== null) {
      out[k] = replaceIdOperators(v as AnyRecord)
    } else {
      out[k] = v
    }
  }
  return out
}


