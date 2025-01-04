import { Handlers } from "$fresh/server.ts";
import { setCookie } from "$std/http/cookie.ts";
import { Database } from "database/index.ts";
import { uuid } from "utils/uuid.ts";
import { GithubOauth2 } from "clients/githubOauth2.ts";

export const handler: Handlers = {
  async GET() {
    const oauthSession = uuid();
    const state = uuid();

    const getAuthorizationUriResult = await GithubOauth2.getAuthorizationUri(
      state,
    );
    if (!getAuthorizationUriResult.success) {
      return new Response(getAuthorizationUriResult.error, {
        status: 500,
      });
    }

    const { uri, codeVerifier } = getAuthorizationUriResult.value;

    const setOauthSessionResult = await Database.setOauthSession(oauthSession, {
      state,
      codeVerifier,
    });
    if (!setOauthSessionResult.success) {
      return new Response(setOauthSessionResult.error, {
        status: 500,
      });
    }

    const resp = new Response("Redirecting...", {
      headers: {
        Location: uri.href,
      },
      status: 307,
    });
    setCookie(resp.headers, {
      name: "oauth-session",
      value: oauthSession,
      path: "/",
      httpOnly: true,
    });
    return resp;
  },
};
