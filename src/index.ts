import "reflect-metadata";
import "dotenv-safe";
import connectRedis from "connect-redis";
import {createConnection} from "typeorm";
import Express from "express";
import {buildSchema} from "type-graphql";
import {ApolloServer} from "apollo-server-express";
import redis from "redis";
import session from "express-session";
import cors from "cors";

import {HelloResolver} from "./resolvers/hello.resolver";
import {UserResolver} from "./resolvers/user/UserResolver";

const main = async () => {
  await createConnection();

  const app = Express();

  app.use(
    cors({
      origin: "*",
      credentials: true,
    })
  );

  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient();

  app.use(
    session({
      name: "qid",
      store: new RedisStore({
        client: redisClient,
        disableTouch: true,
        host: "127.0.0.1",
        port: 6379,
      }),
      cookie: {
        maxAge: 10000000000,
        httpOnly: true,
        secure: false,
        sameSite: "lax",
      },
      saveUninitialized: false,
      secret: "qiwroasdjlasddde",
      resave: false,
    })
  );

  const schema = await buildSchema({
    resolvers: [HelloResolver, UserResolver],
    validate: false,
  });

  const apolloServer = new ApolloServer({
    schema,
    context: ({req, res}) => ({req, res, redis}),
  });

  await apolloServer.start();

  apolloServer.applyMiddleware({app, cors: true});

  const port = process.env.PORT || 4000;

  app.listen({port}, () => {
    console.log(`Your server is running on http://localhost:${port}/graphql`);
  });
};

main();
