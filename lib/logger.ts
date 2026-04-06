/**
 * Simple logger - use instead of console.* in app code.
 * Development: console only. Production: errors also go to Sentry when configured.
 */

import * as Sentry from "@sentry/nextjs";

const isDev = process.env.NODE_ENV === "development";

function sendErrorToSentry(message: string, args: unknown[]) {
  try {
    const errArg = args.find((a): a is Error => a instanceof Error);
    if (errArg) {
      Sentry.captureException(errArg, {
        extra: {
          logMessage: message,
          otherArgs: args.filter((a) => a !== errArg).map(String),
        },
      });
      return;
    }
    const suffix =
      args.length > 0 ? ` ${args.map((a) => (typeof a === "string" ? a : String(a))).join(" ")}` : "";
    Sentry.captureMessage(`${message}${suffix}`, "error");
  } catch {
    /* avoid throwing from logging */
  }
}

export const logger = {
  error(message: string, ...args: unknown[]) {
    if (isDev) {
      console.error(`[KeepStrong] ${message}`, ...args);
      return;
    }
    sendErrorToSentry(message, args);
  },
  warn(message: string, ...args: unknown[]) {
    if (isDev) {
      console.warn(`[KeepStrong] ${message}`, ...args);
    }
  },
  info(message: string, ...args: unknown[]) {
    if (isDev) {
      console.info(`[KeepStrong] ${message}`, ...args);
    }
  },
  debug(message: string, ...args: unknown[]) {
    if (isDev) {
      console.debug(`[KeepStrong] ${message}`, ...args);
    }
  },
};
