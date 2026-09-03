import { createTRPCReact } from "@trpc/react-query";

// The API is served by the separate api-server artifact. Keep the web artifact
// independent from source files outside its package boundary.
export const trpc = createTRPCReact<any>();
