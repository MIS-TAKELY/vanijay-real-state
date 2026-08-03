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
