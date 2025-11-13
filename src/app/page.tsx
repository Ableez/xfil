import { getSession } from "#/server/better-auth/server";
import { HydrateClient } from "#/trpc/server";
import Uploader from "./_components/Uploader";
import { AuthForm } from "./_components/AuthForm";

export default async function Home() {
  const session = await getSession();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 text-gray-800">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            File <span className="text-blue-600">Processor</span>
          </h1>
          <div className="w-full max-w-2xl">
            {session ? (
              <div>
                <p className="text-center text-2xl">
                  Welcome, {session.user?.name}
                </p>
                <Uploader isAuthenticated={true} />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <p className="text-center text-lg">
                  Please sign in to upload and process more files.
                </p>
                <AuthForm />
                <div className="mt-8 w-full">
                  <h2 className="text-2xl font-bold text-center mb-4">
                    Anonymous Upload
                  </h2>
                  <Uploader isAuthenticated={false} />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
