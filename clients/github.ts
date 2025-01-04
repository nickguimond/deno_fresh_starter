import { Result, ResultErr, ResultOk } from "types/returnTypes.ts";

interface GitHubUser {
  id: number;
  login: string;
  name: string;
  avatar_url: string;
}

const getAuthenticatedGithubUser = (
  token: string,
): Promise<Result<GitHubUser, string>> => {
  return fetch("https://api.github.com/user", {
    headers: {
      Authorization: `token ${token}`,
    },
  })
    .then(async (resp) => {
      if (!resp.ok) {
        return ResultErr("Failed to fetch user");
      }
      const user: GitHubUser = await resp.json();
      return ResultOk(user);
    })
    .catch((e) => {
      return ResultErr(`Github API error: ${e.message}`);
    });
};

export const Github = {
  getAuthenticatedGithubUser,
};
