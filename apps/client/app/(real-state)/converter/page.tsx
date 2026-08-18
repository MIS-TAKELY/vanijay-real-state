import { redirect } from "next/navigation";

/**
 * SEO-friendly alias: the standard English spelling "converter" forwards to
 * the canonical /convertor route (MALPOTH's brand spelling). A 307 keeps
 * search link equity flowing to the canonical URL.
 */
export default function ConverterRedirectPage() {
  redirect("/convertor");
}
