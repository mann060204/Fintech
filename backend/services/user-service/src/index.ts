import { ApolloServer } from "apollo-server-express";
import { buildSubgraphSchema } from "@apollo/subgraph";
import express from "express";
import { gql } from "graphql-tag";
import { AppDataSource } from "./data-source";
import { User } from "./entity/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "reflect-metadata";

const typeDefs = gql`
  extend type Query {
    me: User
    getUser(id: ID!): User
  }

  type User @key(fields: "id") {
    id: ID!
    username: String!
    email: String!
    trust_score: Float
  }

  extend type Mutation {
    register(username: String!, email: String!, password: String!): User
    login(email: String!, password: String!): AuthPayload
  }

  type AuthPayload {
    token: String!
    user: User!
  }
`;

const resolvers = {
  Query: {
    getUser: async (_: any, { id }: { id: string }) => {
      const userRepo = AppDataSource.getRepository(User);
      return await userRepo.findOneBy({ id });
    },
    me: async (_: any, __: any, context: any) => {
      if (!context.userId) return null;
      const userRepo = AppDataSource.getRepository(User);
      return await userRepo.findOneBy({ id: context.userId });
    }
  },
  Mutation: {
    register: async (_: any, { username, email, password }: any) => {
      const userRepo = AppDataSource.getRepository(User);

      const existingUser = await userRepo.findOne({ where: [{ email }, { username }] });
      if (existingUser) {
        throw new Error("Username or email already exists");
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User();
      user.username = username;
      user.email = email;
      user.password_hash = hashedPassword;
      user.trust_score = 50.0; // Default starting score

      return await userRepo.save(user);
    },
    login: async (_: any, { email, password }: any) => {
      const userRepo = AppDataSource.getRepository(User);
      const user = await userRepo.findOneBy({ email });

      if (!user) {
        throw new Error("Invalid credentials");
      }

      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        throw new Error("Invalid credentials");
      }

      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || "supersecretkey",
        { expiresIn: "7d" }
      );

      return { token, user };
    },
  },
  User: {
    __resolveReference(user: any) {
      const userRepo = AppDataSource.getRepository(User);
      return userRepo.findOneBy({ id: user.id });
    }
  }
};

async function startServer() {
  const app = express();

  await AppDataSource.initialize();
  console.log("User Data Source initialized");

  const server = new ApolloServer({
    schema: buildSubgraphSchema({ typeDefs, resolvers }),
    context: ({ req }) => {
      const token = req.headers.authorization || "";
      try {
        if (token) {
          const decoded: any = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET || "supersecretkey");
          return { userId: decoded.userId };
        }
      } catch (e) {
        // Invalid token
      }
      return {};
    }
  });

  await server.start();
  server.applyMiddleware({ app: app as any });

  app.listen(4004, () => {
    console.log("User Service ready at http://localhost:4004/graphql");
  });
}

startServer().catch(err => {
  console.error("Error starting server:", err);
});
