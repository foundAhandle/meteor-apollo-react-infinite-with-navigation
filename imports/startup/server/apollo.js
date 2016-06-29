import { apolloServer } from 'apollo-server';
import express from 'express';
import proxyMiddleware from 'http-proxy-middleware';

 import schema from '../../api/docs/schema';
 import resolvers from '../../api/docs/resolvers';

const graphQLServer = express();
const GRAPHQL_PORT = 4000;

graphQLServer.use('/', apolloServer(
  async (req) => {
    return {
      graphiql: true,
      pretty: true,
      schema,
      resolvers,
      context: {
      },
    };
  }
));

graphQLServer.listen(GRAPHQL_PORT, () => console.log(
  `GraphQL Server is now running on http://localhost:${GRAPHQL_PORT}`
));

WebApp.rawConnectHandlers.use(proxyMiddleware(`http://localhost:${GRAPHQL_PORT}/graphql`));
