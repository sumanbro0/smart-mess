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

export function getQueryClient({
  token,
  slug,
}: {
  token?: string;
  slug?: string;
} = {}) {
  if (!isServer) {
    setupClientInterceptor();
  }
  if (isServer) {
    return makeQueryClient();
  } else {
    if (!browserQueryClient) {
      browserQueryClient = makeQueryClient();
    }
    if (token) {
      setupServerInterceptor({ token });
    }
    return browserQueryClient;
  }
}
