import { apiFetch } from "../../core/client";
import { API_ENDPOINTS } from "../../core/endpoints";

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
