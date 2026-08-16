import { apiFetch } from "../../core/client";
import { API_ENDPOINTS } from "../../core/endpoints";
import type {
  CitizenshipDocInput,
  ProfileData,
  UpdateProfileInput,
} from "./types";

export function fetchProfile(): Promise<ProfileData> {
  return apiFetch<ProfileData>(API_ENDPOINTS.profile.base);
}

export function updateProfile(dto: UpdateProfileInput): Promise<ProfileData> {
  return apiFetch<ProfileData>(API_ENDPOINTS.profile.base, {
    method: "PATCH",
    body: dto,
  });
}

export function submitCitizenshipDoc(
  input: CitizenshipDocInput,
): Promise<ProfileData> {
  return apiFetch<ProfileData>(API_ENDPOINTS.profile.citizenship, {
    method: "POST",
    body: input,
  });
}
