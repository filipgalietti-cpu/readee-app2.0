// Stub for Next's "server-only" build guard, which has no runtime under vitest.
// Importing the real thing is what stops a server module reaching a client
// bundle; the check is a build concern, so tests only need the import to resolve.
export {};
