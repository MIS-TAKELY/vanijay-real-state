import { ApiError } from "../../core/client";
import { API_URL } from "../../core/config";
import { API_ENDPOINTS } from "../../core/endpoints";
import type { UploadedAsset } from "./types";

export type UploadFolder = "properties" | "documents" | "identity" | "misc";

function endpointUrl(path: string, folder: UploadFolder): string {
  const url = path.startsWith("http") ? path : `${API_URL}${path}`;
  const sp = new URLSearchParams({ folder });
  return `${url}?${sp.toString()}`;
}


async function uploadForm(
  path: string,
  folder: UploadFolder,
  formData: FormData,
): Promise<unknown> {
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

export async function uploadFiles(
  files: File[],
  folder: UploadFolder = "properties",
): Promise<UploadedAsset[]> {
  if (files.length === 0) return [];
  const formData = new FormData();
  for (const file of files) formData.append("files", file);
  const body = await uploadForm(
    API_ENDPOINTS.uploads.multiple,
    folder,
    formData,
  );
  return (body as UploadedAsset[]) ?? [];
}

export async function uploadFile(
  file: File,
  folder: UploadFolder = "properties",
): Promise<UploadedAsset> {
  const formData = new FormData();
  formData.append("file", file);
  const body = await uploadForm(API_ENDPOINTS.uploads.single, folder, formData);
  return body as UploadedAsset;
}

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
