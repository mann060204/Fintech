import 'reflect-metadata';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';
import { AppDataSource } from './data-source';
import { buildSubgraphSchema } from '@apollo/subgraph';

async function startServer() {
  await AppDataSource.initialize()
    .then(() => {
      console.log("Data Source has been initialized!");
    })
    .catch((err) => {
      console.error("Error during Data Source initialization", err);
    });



  const app = express();
  const server = new ApolloServer({
    schema: buildSubgraphSchema({ typeDefs, resolvers })
  });
  await server.start();
  server.applyMiddleware({ app: app as any });

  app.listen(4001, '0.0.0.0', () => {
    console.log('Agreement Service ready at http://0.0.0.0:4001/graphql');
  });
}

startServer();
