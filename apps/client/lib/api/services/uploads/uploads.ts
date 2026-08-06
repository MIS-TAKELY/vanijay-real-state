import { API_URL } from "../../core/config";
import { ApiError } from "../../core/client";
import { API_ENDPOINTS } from "../../core/endpoints";
import type { UploadedAsset } from "./types";

/** A Cloudinary folder the media step may target. */
export type UploadFolder = "properties" | "documents" | "identity" | "misc";

function endpointUrl(
  path: string,
  folder: UploadFolder,
): string {
  const url = path.startsWith("http") ? path : `${API_URL}${path}`;
  const sp = new URLSearchParams({ folder });
  return `${url}?${sp.toString()}`;
}

/**
 * Multipart upload helper shared by the single/multiple endpoints. It talks to
 * the API directly (like `apiFetch`) but sends `FormData` instead of JSON, so
 * it intentionally does not set a Content-Type (the browser adds the boundary).
 *
 * Auth is forwarded the same way the rest of the API layer does it: the session
 * cookie is attached via `credentials: "include"`.
 */
async function uploadForm(
  path: string,
  folder: UploadFolder,
  formData: FormData,
): Promise<unknown> {
  // Give uploads more headroom than the default 15s JSON timeout.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000);

  let res: Response;
  try {
    res = await fetch(endpointUrl(path, folder), {
      method: "POST",
      body: formData,
      credentials: "include",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    let parsed: unknown;
    try {
      parsed = await res.json();
    } catch {
      parsed = undefined;
    }
    const raw =
      typeof parsed === "object" && parsed !== null
        ? (parsed as { message?: unknown }).message
        : undefined;
    const message = Array.isArray(raw)
      ? raw.filter((m): m is string => typeof m === "string").join("; ")
      : typeof raw === "string"
        ? raw
        : undefined;
    throw new ApiError(
      res.status,
      message || `Upload failed (${res.status})`,
      parsed,
    );
  }

  if (res.status === 204) return undefined;
  return (await res.json()) as unknown;
}

/** Upload several `File`s in one request. */
export async function uploadFiles(
  files: File[],
  folder: UploadFolder = "properties",
): Promise<UploadedAsset[]> {
  if (files.length === 0) return [];
  const formData = new FormData();
  for (const file of files) formData.append("files", file);
  const body = await uploadForm(API_ENDPOINTS.uploads.multiple, folder, formData);
  return (body as UploadedAsset[]) ?? [];
}

/** Upload a single `File`. */
export async function uploadFile(
  file: File,
  folder: UploadFolder = "properties",
): Promise<UploadedAsset> {
  const formData = new FormData();
  formData.append("file", file);
  const body = await uploadForm(API_ENDPOINTS.uploads.single, folder, formData);
  return body as UploadedAsset;
}

/** Permanently delete an uploaded asset by its Cloudinary public id. */
export async function deleteUpload(
  publicId: string,
): Promise<{ result: string }> {
  const res = await fetch(API_URL + API_ENDPOINTS.uploads.remove(publicId), {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new ApiError(res.status, `Delete failed (${res.status})`);
  return (await res.json()) as { result: string };
}

export * from "./types";
