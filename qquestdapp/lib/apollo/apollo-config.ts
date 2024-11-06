import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";

export const client = new ApolloClient({
  uri: "https://api.studio.thegraph.com/query/58232/qquestfinalupdate/version/latest",
  cache: new InMemoryCache(),
});
