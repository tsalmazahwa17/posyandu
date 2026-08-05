const DEFAULT_PUBLIC_BUCKET = "posyandu-aster-public";
const DEFAULT_PRIVATE_BUCKET = "posyandu-aster-private";

export type StorageVisibility = "public" | "private";

const bucketReadyPromises = new Map<string, Promise<string>>();

interface SupabaseConfig {
  url: string;
  secretKey: string;
}

interface StorageObjectReference {
  bucket: string;
  path: string;
  visibility: StorageVisibility;
}

function requiredEnv(name: string, value: string | undefined): string {
  const normalized = value?.trim();
  if (!normalized) throw new Error(`${name} wajib diatur pada environment.`);
  return normalized.replace(/\/$/, "");
}

function getSupabaseConfig(): SupabaseConfig {
  return {
    url: requiredEnv("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
    secretKey: requiredEnv(
      "SUPABASE_SECRET_KEY atau SUPABASE_SERVICE_ROLE_KEY",
      process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
    ),
  };
}

function storageHeaders(extra: HeadersInit = {}): Headers {
  const { secretKey } = getSupabaseConfig();
  const headers = new Headers(extra);
  headers.set("apikey", secretKey);
  headers.set("Authorization", `Bearer ${secretKey}`);
  return headers;
}

function storageApiUrl(path: string): string {
  const { url } = getSupabaseConfig();
  return `${url}/storage/v1${path}`;
}

function encodeObjectPath(path: string): string {
  return path
    .split("/")
    .filter(Boolean)
    .map(encodeURIComponent)
    .join("/");
}

async function parseStorageError(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as { message?: string; error?: string; code?: string };
    return payload.message || payload.error || payload.code || response.statusText;
  } catch {
    return response.statusText || `HTTP ${response.status}`;
  }
}

export function getSupabaseStorageBucket(visibility: StorageVisibility = "public"): string {
  if (visibility === "private") {
    return process.env.SUPABASE_PRIVATE_STORAGE_BUCKET?.trim() || DEFAULT_PRIVATE_BUCKET;
  }
  return process.env.SUPABASE_STORAGE_BUCKET?.trim() || DEFAULT_PUBLIC_BUCKET;
}

export async function ensureStorageBucket(
  visibility: StorageVisibility = "public"
): Promise<string> {
  const bucket = getSupabaseStorageBucket(visibility);
  const expectedPublic = visibility === "public";
  const promiseKey = `${visibility}:${bucket}`;
  const existingPromise = bucketReadyPromises.get(promiseKey);
  if (existingPromise) return existingPromise;

  const readyPromise = (async () => {
    const getResponse = await fetch(storageApiUrl(`/bucket/${encodeURIComponent(bucket)}`), {
      method: "GET",
      headers: storageHeaders(),
      cache: "no-store",
    });

    if (getResponse.ok) {
      const data = (await getResponse.json()) as { public?: boolean };
      if (Boolean(data.public) !== expectedPublic) {
        throw new Error(
          `Bucket Supabase Storage "${bucket}" harus berstatus ${expectedPublic ? "public" : "private"}.`
        );
      }
      return bucket;
    }

    if (getResponse.status !== 404) {
      throw new Error(
        `Gagal memeriksa bucket Supabase Storage "${bucket}": ${await parseStorageError(getResponse)}`
      );
    }

    const createResponse = await fetch(storageApiUrl("/bucket"), {
      method: "POST",
      headers: storageHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({
        id: bucket,
        name: bucket,
        public: expectedPublic,
        file_size_limit: 20 * 1024 * 1024,
        allowed_mime_types: [
          "image/jpeg",
          "image/png",
          "image/webp",
          "image/gif",
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "text/csv",
          "text/plain",
          "application/csv",
          "video/mp4",
          "video/webm",
          "video/quicktime",
        ],
      }),
    });

    if (!createResponse.ok) {
      throw new Error(
        `Gagal membuat bucket Supabase Storage "${bucket}": ${await parseStorageError(createResponse)}`
      );
    }

    return bucket;
  })().catch((error) => {
    bucketReadyPromises.delete(promiseKey);
    throw error;
  });

  bucketReadyPromises.set(promiseKey, readyPromise);
  return readyPromise;
}

export async function ensurePublicStorageBucket(): Promise<string> {
  return ensureStorageBucket("public");
}

export interface SupabaseUploadResult {
  bucket: string;
  path: string;
  visibility: StorageVisibility;
  url: string;
  publicUrl: string | null;
}

export async function uploadToSupabaseStorage(input: {
  path: string;
  body: ArrayBuffer;
  contentType?: string;
  visibility?: StorageVisibility;
}): Promise<SupabaseUploadResult> {
  const visibility = input.visibility ?? "public";
  const bucket = await ensureStorageBucket(visibility);
  const encodedPath = encodeObjectPath(input.path);
  const response = await fetch(
    storageApiUrl(`/object/${encodeURIComponent(bucket)}/${encodedPath}`),
    {
      method: "POST",
      headers: storageHeaders({
        "Content-Type": input.contentType || "application/octet-stream",
        "Cache-Control": "max-age=3600",
        "x-upsert": "false",
      }),
      body: input.body,
    }
  );

  if (!response.ok) {
    throw new Error(`Upload ke Supabase Storage gagal: ${await parseStorageError(response)}`);
  }

  const { url: projectUrl } = getSupabaseConfig();
  const publicUrl =
    visibility === "public"
      ? `${projectUrl}/storage/v1/object/public/${encodeURIComponent(bucket)}/${encodedPath}`
      : null;

  // Private objects are stored as an internal URI, never as a reusable public URL.
  const storedUrl = publicUrl || `supabase://${bucket}/${input.path}`;
  return { bucket, path: input.path, visibility, url: storedUrl, publicUrl };
}

export function extractSupabaseStorageObject(value: string): StorageObjectReference | null {
  if (value.startsWith("supabase://")) {
    const withoutProtocol = value.slice("supabase://".length);
    const slashIndex = withoutProtocol.indexOf("/");
    if (slashIndex <= 0) return null;
    const bucket = withoutProtocol.slice(0, slashIndex);
    const path = withoutProtocol.slice(slashIndex + 1);
    if (!bucket || !path) return null;
    return {
      bucket,
      path,
      visibility:
        bucket === getSupabaseStorageBucket("private") ? "private" : "public",
    };
  }

  try {
    const parsed = new URL(value);
    const publicMarker = "/storage/v1/object/public/";
    const markerIndex = parsed.pathname.indexOf(publicMarker);
    if (markerIndex < 0) return null;
    const remainder = parsed.pathname.slice(markerIndex + publicMarker.length);
    const slashIndex = remainder.indexOf("/");
    if (slashIndex <= 0) return null;
    return {
      bucket: decodeURIComponent(remainder.slice(0, slashIndex)),
      path: decodeURIComponent(remainder.slice(slashIndex + 1)),
      visibility: "public",
    };
  } catch {
    return null;
  }
}

export function extractSupabaseStoragePath(value: string): string | null {
  return extractSupabaseStorageObject(value)?.path ?? null;
}

export async function createSignedStorageUrl(
  value: string,
  expiresInSeconds = 60 * 60
): Promise<string> {
  const object = extractSupabaseStorageObject(value);
  if (!object || object.visibility === "public") return value;

  const response = await fetch(
    storageApiUrl(
      `/object/sign/${encodeURIComponent(object.bucket)}/${encodeObjectPath(object.path)}`
    ),
    {
      method: "POST",
      headers: storageHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ expiresIn: expiresInSeconds }),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(`Gagal membuat URL privat sementara: ${await parseStorageError(response)}`);
  }

  const payload = (await response.json()) as { signedURL?: string; signedUrl?: string };
  const signedPath = payload.signedURL || payload.signedUrl;
  if (!signedPath) throw new Error("Supabase tidak mengembalikan signed URL.");
  if (/^https?:\/\//i.test(signedPath)) return signedPath;

  const { url } = getSupabaseConfig();
  return `${url}/storage/v1${signedPath.startsWith("/") ? signedPath : `/${signedPath}`}`;
}

export async function removeSupabaseStorageFile(value: string): Promise<boolean> {
  const object = extractSupabaseStorageObject(value);
  if (!object) return false;

  const response = await fetch(storageApiUrl(`/object/${encodeURIComponent(object.bucket)}`), {
    method: "DELETE",
    headers: storageHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ prefixes: [object.path] }),
  });

  if (!response.ok) {
    throw new Error(`Gagal menghapus file dari Supabase Storage: ${await parseStorageError(response)}`);
  }

  return true;
}
