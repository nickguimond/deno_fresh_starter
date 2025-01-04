import { Handlers } from "$fresh/server.ts";
import { deleteCookie } from "$std/http/cookie.ts";
import { Database } from "database/index.ts";
import { State } from "types/databaseTypes.ts";

export const handler: Handlers<undefined, State> = {
  async GET(_, ctx): Promise<Response> {
    if (ctx.state.session) {
      await Database.deleteSession(ctx.state.session);
    }

    const resp = new Response("Logged out", {
      headers: {
        Location: "/",
      },
      status: 307,
    });
    deleteCookie(resp.headers, "session");
    return resp;
  },
};
