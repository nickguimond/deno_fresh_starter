import { Result, ResultErr, ResultOk } from "../types/returnTypes.ts";
import { OauthSession, User } from "../types/databaseTypes.ts";

const kv = await Deno.openKv();

const setOauthSession = (
  session: string,
  value: OauthSession,
): Promise<Result<void, string>> => {
  return kv.set(["oauth_sessions", session], value)
    .then(() => {
      return ResultOk(undefined);
    })
    .catch((e) => {
      return ResultErr(`Database error: Failed to set session: ${e.message}`);
    });
};

const getAndDeleteOauthSession = (
  session: string,
): Promise<Result<OauthSession, string>> => {
  return kv.get<OauthSession>(["oauth_sessions", session])
    .then((res) => {
      if (res.versionstamp === null) {
        return ResultErr("Database error: Session not found");
      }
      return kv.delete(["oauth_sessions", session])
        .then(() => {
          return ResultOk(res.value);
        })
        .catch((e) => {
          return ResultErr(
            `Database error: Failed to delete session: ${e.message}`,
          );
        });
    })
    .catch((e) => {
      return ResultErr(`Database error: Failed to get session: ${e.message}`);
    });
};

const setUserWithSession = async (user: User, session: string) => {
  await kv.atomic()
    .set(["users", user.id], user)
    .set(["users_by_login", user.login], user)
    .set(["users_by_session", session], user)
    .set(["users_by_last_signin", new Date().toISOString(), user.id], user)
    .commit();
};

const getUserBySession = async (session: string) => {
  const res = await kv.get<User>(["users_by_session", session]);
  return res.value;
};

const deleteSession = async (session: string) => {
  await kv.delete(["users_by_session", session]);
};

const listRecentlySignedInUsers = async (): Promise<User[]> => {
  const users = [];
  const iter = kv.list<User>({ prefix: ["users_by_last_signin"] }, {
    limit: 10,
    reverse: true,
  });
  for await (const { value } of iter) {
    users.push(value);
  }
  return users;
};

export const Database = {
  setOauthSession,
  getAndDeleteOauthSession,
  setUserWithSession,
  getUserBySession,
  deleteSession,
  listRecentlySignedInUsers,
};
