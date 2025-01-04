import { State, User } from "../types/databaseTypes.ts";
import { FreshContext, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import { Database } from "database/index.ts";

interface SignedInData {
  user: User;
  users: User[];
}
type Data = SignedInData | undefined;

export async function handler(_req: Request, ctx: FreshContext<State, Data>) {
  if (!ctx.state.session) {
    return ctx.render(undefined);
  }

  const [user, users] = await Promise.all([
    Database.getUserBySession(ctx.state.session),
    Database.listRecentlySignedInUsers(),
  ]);

  if (!user) {
    return ctx.render(undefined);
  }

  return ctx.render({ user, users });
}

export default function Home(props: PageProps<Data>) {
  return (
    <>
      <Head>
        <title>Home</title>
      </Head>
      <div>
        {props?.data?.user?.name ?? null}
        <br />
        {props.data
          ? <a href="/auth/signout">Sign out</a>
          : <a href="/auth/signin">Sign in</a>}
      </div>
    </>
  );
}
