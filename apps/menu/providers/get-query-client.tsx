import { setupClientInterceptor } from "@/lib/client-interceptor";
import { setupServerInterceptor } from "@/lib/server-interceptor";
import {
  QueryClient,
  defaultShouldDehydrateQuery,
  isServer,
} from "@tanstack/react-query";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 2 * 60 * 1000,
        retry: 1,
      },
      dehydrate: {
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient({ token }: { token?: string } = {}) {
  if (isServer) {
    setupServerInterceptor({ token });
    return makeQueryClient();
  } else {
    if (!browserQueryClient) {
      browserQueryClient = makeQueryClient();
    }
    setupClientInterceptor();
    return browserQueryClient;
  }
}
