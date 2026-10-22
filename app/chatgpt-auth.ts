import {getApartmentSession,normalizeName,personId} from './apartment-session';
import {env} from 'cloudflare:workers';
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export type ChatGPTUser = {
  userId: string;
  displayName: string;
  email: string;
  fullName: string | null;
};

const USER_ID_HEADER = "oai-authenticated-user-id";
const SIGN_IN_PATH = "/signin-with-chatgpt";
const SIGN_OUT_PATH = "/signout-with-chatgpt";
const CALLBACK_PATH = "/callback";

export async function getChatGPTUser(): Promise<ChatGPTUser | null> {
  const session=await getApartmentSession();
  if(!session)return null;
  const requestHeaders=await headers();
  const userId=await personId(session.name);
  // Reconnect bookings created before login names had stable identities.
  // Never reassign a booking already attached to a stable person identity.
  const legacyIds=[session.id,requestHeaders.get(USER_ID_HEADER)].filter(Boolean);
  const {results}=await env.DB!.prepare("SELECT id, user_id, name FROM bookings WHERE user_id NOT GLOB 'person_*'").all<{id:string;user_id:string;name:string}>();
  const matches=results.filter(b=>legacyIds.includes(b.user_id)||normalizeName(b.name)===normalizeName(session.name));
  if(matches.length)await env.DB!.batch(matches.map(b=>env.DB!.prepare('UPDATE bookings SET user_id=? WHERE id=? AND user_id=?').bind(userId,b.id,b.user_id)));
  return {userId,displayName:session.name,email:'',fullName:session.name};
}

export async function requireChatGPTUser(
  returnTo: string,
): Promise<ChatGPTUser> {
  const user = await getChatGPTUser();
  if (user) return user;

  redirect(chatGPTSignInPath(returnTo));
}

export function chatGPTSignInPath(returnTo: string): string {
  const safeReturnTo = safeRelativeReturnPath(returnTo);
  return `${SIGN_IN_PATH}?return_to=${encodeURIComponent(safeReturnTo)}`;
}

export function chatGPTSignOutPath(returnTo = "/"): string {
  const safeReturnTo = safeRelativeReturnPath(returnTo);
  return `${SIGN_OUT_PATH}?return_to=${encodeURIComponent(safeReturnTo)}`;
}

function safeRelativeReturnPath(value: string): string {
  if (!value.startsWith("/") || value.startsWith("//")) return "/";

  let url: URL;
  try {
    url = new URL(value, "https://app.local");
  } catch {
    return "/";
  }
  if (url.origin !== "https://app.local") return "/";
  if (isReservedAuthPath(url.pathname)) return "/";

  return `${url.pathname}${url.search}${url.hash}`;
}

function isReservedAuthPath(pathname: string): boolean {
  return (
    pathname === SIGN_IN_PATH ||
    pathname === SIGN_OUT_PATH ||
    pathname === CALLBACK_PATH
  );
}

