import { Handlers } from "$fresh/server.ts";
import { deleteCookie, getCookies, setCookie } from "$std/http/cookie.ts";
import { Database } from "database/index.ts";
import { Github } from "clients/github.ts";
import { User } from "types/databaseTypes.ts";
import { Option } from "types/returnTypes.ts";
import { GithubOauth2 } from "clients/githubOauth2.ts";
import { uuid } from "utils/uuid.ts";

const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const handler: Handlers = {
  async GET(req): Promise<Response> {
    const cookies = getCookies(req.headers);

    const oauthSessionCookie: Option<string> = cookies["oauth-session"];
    if (!oauthSessionCookie) {
      return new Response(
        "Authentication failed: Missing OAuth session cookie",
        {
          status: 400,
        },
      );
    }

    const oauthSessionResult = await Database.getAndDeleteOauthSession(
      oauthSessionCookie,
    );
    if (!oauthSessionResult.success) {
      return new Response(oauthSessionResult.error, {
        status: 400,
      });
    }

    const { state, codeVerifier } = oauthSessionResult.value;
    const accessTokenResult = await GithubOauth2.getOauthToken(
      req.url,
      state,
      codeVerifier,
    );
    if (!accessTokenResult.success) {
      return new Response(accessTokenResult.error, {
        status: 400,
      });
    }

    const ghUser = await Github.getAuthenticatedGithubUser(
      accessTokenResult.value,
    );
    if (!ghUser.success) {
      return new Response(ghUser.error, {
        status: 400,
      });
    }

    const session = uuid();

    const user: User = {
      id: String(ghUser.value.id),
      login: ghUser.value.login,
      name: ghUser.value.name,
      avatarUrl: ghUser.value.avatar_url,
    };

    await Database.setUserWithSession(user, session);

    const resp = new Response("Logged in", {
      headers: {
        Location: "/",
      },
      status: 307,
    });
    deleteCookie(resp.headers, "oauth-session");
    setCookie(resp.headers, {
      name: "session",
      value: session,
      path: "/",
      httpOnly: true,
      maxAge: SESSION_COOKIE_MAX_AGE,
    });
    return resp;
  },
};
