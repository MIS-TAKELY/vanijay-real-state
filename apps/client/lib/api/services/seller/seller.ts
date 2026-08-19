import { apiFetch } from "../../core/client";
import { API_ENDPOINTS } from "../../core/endpoints";
import type {
  SaveSellerProfileInput,
  SellerProfileView,
  SubmitSellerProfileResult,
} from "./types";

export interface RegisterSellerInput {
  agreedToTerms: boolean;
  permanentAddress?: string;
}

export function registerSeller(dto: RegisterSellerInput): Promise<unknown> {
  return apiFetch(API_ENDPOINTS.seller.register, {
    method: "POST",
    body: dto,
  });
}

/** True if the phone number is already registered to any account. */
export function checkPhoneRegistered(
  phoneNumber: string,
): Promise<{ registered: boolean }> {
  return apiFetch(API_ENDPOINTS.seller.checkPhone, {
    method: "GET",
    query: { phoneNumber },
  });
}

/** Current seller registration state (wizard resume + gates). */
export function fetchSellerProfile(): Promise<SellerProfileView> {
  return apiFetch(API_ENDPOINTS.seller.profile, { method: "GET" });
}

/** Persist wizard draft (save and resume). */
export function saveSellerProfile(
  dto: SaveSellerProfileInput,
): Promise<SellerProfileView> {
  return apiFetch(API_ENDPOINTS.seller.profile, {
    method: "PATCH",
    body: dto,
  });
}

/** Final submission — validates completeness, then submits/approves. */
export function submitSellerProfile(): Promise<SubmitSellerProfileResult> {
  return apiFetch(API_ENDPOINTS.seller.submit, { method: "POST" });
}
