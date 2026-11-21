import { supabase } from "@/src/config/supabase";

/**
 * Ticket #48: soft geo/VPN flag recorded by the server at sign-up.
 *
 * - "none": sign-up looked like a launch-area (PH / California) connection.
 * - "review_suggested": outside the launch area or behind a VPN/proxy. The app
 *   may show a gentle note that ID review may be needed later. Never a block.
 * - "unavailable": the server could not check (vendor down, quota, no signal).
 * - "unknown": no row yet (e.g. accounts created before the hook was enabled).
 *
 * The server deliberately does not return the country or VPN details.
 */
export type SignupSoftFlag = "none" | "review_suggested" | "unavailable" | "unknown";

const KNOWN_FLAGS = new Set<SignupSoftFlag>(["none", "review_suggested", "unavailable"]);

export async function getMySignupSoftFlag(): Promise<SignupSoftFlag> {
  const { data, error } = await supabase.rpc("get_my_signup_signal");

  if (error) {
    console.error("Signup signal lookup failed.");
    return "unknown";
  }

  const row = Array.isArray(data) ? data[0] : data;
  const flag = row && typeof row === "object" ? (row as { soft_flag?: unknown }).soft_flag : undefined;

  return typeof flag === "string" && KNOWN_FLAGS.has(flag as SignupSoftFlag) ? (flag as SignupSoftFlag) : "unknown";
}
