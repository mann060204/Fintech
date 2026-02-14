const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const { ApolloGateway, IntrospectAndCompose } = require('@apollo/gateway');

const gateway = new ApolloGateway({
    supergraphSdl: new IntrospectAndCompose({
        subgraphs: [
            { name: 'agreement', url: process.env.AGREEMENT_SERVICE_URL || 'http://localhost:4001/graphql' },
            { name: 'user', url: process.env.USER_SERVICE_URL || 'http://localhost:4004/graphql' },
        ],
    }),
});

const server = new ApolloServer({
    gateway,
});

startStandaloneServer(server, {
    listen: { port: 4000, host: '0.0.0.0' }
}).then(({ url }) => {
    console.log(`🚀  Gateway ready at ${url}`);
});
