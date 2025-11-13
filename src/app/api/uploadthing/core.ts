import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getSession } from "#/server/better-auth/server";
import { db } from "#/server/db";
import { anonymousUploads } from "#/server/db/schema";
import type { InferSelectModel } from "drizzle-orm";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { createHash } from "crypto";

const f = createUploadthing();

type AnonymousUpload = InferSelectModel<typeof anonymousUploads>;

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  anonymousUploader: f({
    blob: {
      maxFileSize: "5MB",
      maxFileCount: 10,
    },
  })
    .middleware(async ({ req: _req }) => {
      const ip = headers().get("x-forwarded-for") ?? "unknown";
      const hashedIp = createHash("sha256").update(ip).digest("hex");
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const result = await db
        .select()
        .from(anonymousUploads)
        .where(
          and(
            eq(anonymousUploads.identifier, hashedIp),
            eq(anonymousUploads.date, today)
          )
        )
        .limit(1);

      const record: AnonymousUpload | undefined = result[0];
      if (record && record.uploadCount >= 10) {
        throw new Error("Upload limit reached for today.");
      }

      return { hashedIp, today };
    })
    .onUploadComplete(async ({ metadata, file: _file }) => {
      const { hashedIp, today } = metadata;
      const result = await db
        .select()
        .from(anonymousUploads)
        .where(
          and(
            eq(anonymousUploads.identifier, hashedIp),
            eq(anonymousUploads.date, today)
          )
        )
        .limit(1);

      const record: AnonymousUpload | undefined = result[0];
      if (record) {
        await db
          .update(anonymousUploads)
          .set({ uploadCount: record.uploadCount + 1 })
          .where({ id: record.id });
      } else {
        await db.insert(anonymousUploads).values({
          identifier: hashedIp,
          date: today,
          uploadCount: 1,
        });
      }
      return { uploadedBy: "anonymous" };
    }),
  authenticatedUploader: f({
    blob: {
      maxFileSize: "5MB",
      maxFileCount: 20,
    },
  })
    .middleware(async () => {
      const session = await getSession();
      if (!session) {
        throw new Error("Unauthorized");
      }
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file: _file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("file url", _file.url);

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
