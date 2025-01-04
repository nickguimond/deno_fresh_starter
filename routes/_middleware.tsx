import { FreshContext } from "$fresh/server.ts";
import { getCookies } from "$std/http/cookie.ts";
import { State } from "types/databaseTypes.ts";

export function handler(
  req: Request,
  ctx: FreshContext<State>,
): Promise<Response> {
  const url = new URL(req.url);

  if (url.pathname === "") {
    return ctx.next();
  }

  const cookies = getCookies(req.headers);
  ctx.state.session = cookies.session;
  return ctx.next();
}
