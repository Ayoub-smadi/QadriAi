import { createTRPCReact } from "@trpc/react-query";

// The API is served by the separate api-server artifact. Keeping the client
// contract local prevents the frontend from importing files outside its
// artifact boundary.
export const trpc = createTRPCReact<any>();
