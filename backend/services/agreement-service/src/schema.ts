import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type Agreement {
    id: ID!
    title: String!
    description: String
    amount: Float!
    creatorId: String!
    participantId: String!
    status: String!
    createdAt: String!
    updatedAt: String!
  }

  type Group {
    id: ID!
    name: String!
    creatorId: String!
    members: [String]!
    expenses: [Expense]
    createdAt: String!
  }

  type Expense {
    id: ID!
    description: String!
    amount: Float!
    payerId: String!
    splits: [Split]!
    createdAt: String!
  }

  type Split {
    userId: String!
    amount: Float!
  }

  input SplitInput {
    userId: String!
    amount: Float!
  }

  type Query {
    getAgreement(id: ID!): Agreement
    listAgreements(userId: String!): [Agreement]
    getUserTrustScore(userId: String!): Float
    listGroups(userId: String!): [Group]
    getGroup(groupId: ID!): Group
    getGroupBalances(groupId: ID!): [GroupBalance]
  }

  type GroupBalance {
    id: ID!
    debtorId: String!
    creditorId: String!
    amount: Float!
  }

  type Mutation {
    createAgreement(title: String!, amount: Float!, description: String, creatorId: String!, participantId: String!): Agreement
    updateAgreementStatus(id: ID!, status: String!): Agreement
    verifyPayment(agreementId: ID!, transactionId: String!, provider: String!): Agreement
    checkLocationContext(latitude: Float!, longitude: Float!): ContextResult
    
    createGroup(name: String!, creatorId: String!): Group
    addMemberToGroup(groupId: ID!, userId: String!): Group
    addExpense(groupId: ID!, description: String!, amount: Float!, payerId: String!, splits: [SplitInput]!): Expense
    settleDebt(groupId: ID!, debtorId: String!, creditorId: String!, amount: Float!): Expense
  }

  type ContextResult {
    suppress_notifications: Boolean!
    reason: String
    location_type: String
  }
`;
