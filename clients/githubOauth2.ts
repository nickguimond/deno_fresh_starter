import "$std/dotenv/load.ts";
import { OAuth2Client } from "https://deno.land/x/oauth2_client@v1.0.0/mod.ts";
import { Result, ResultErr, ResultOk } from "../types/returnTypes.ts";

const oauth2Client = new OAuth2Client({
  clientId: Deno.env.get("GITHUB_CLIENT_ID")!,
  clientSecret: Deno.env.get("GITHUB_CLIENT_SECRET")!,
  authorizationEndpointUri: "https://github.com/login/oauth/authorize",
  tokenUri: "https://github.com/login/oauth/access_token",
  defaults: {
    scope: "read:user",
  },
});

const getOauthToken = (
  url: string,
  state: string,
  codeVerifier: string,
): Promise<Result<string, string>> => {
  return oauth2Client.code.getToken(url, { state, codeVerifier }).then(
    (tokens) => {
      return ResultOk(tokens.accessToken);
    },
  )
    .catch((e) => {
      return ResultErr(`Failed to get OAuth token: ${e.message}`);
    });
};

const getAuthorizationUri = (
  state: string,
): Promise<Result<{ codeVerifier: string; uri: URL }, string>> => {
  return oauth2Client.code
    .getAuthorizationUri({ state })
    .then((result) => {
      return ResultOk({ codeVerifier: result.codeVerifier, uri: result.uri });
    })
    .catch((e) => {
      return ResultErr(`Failed to get authorization URI: ${e.message}`);
    });
};

export const GithubOauth2 = {
  getOauthToken,
  getAuthorizationUri,
};
