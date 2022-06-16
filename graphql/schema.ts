import { buildSchema } from 'graphql';

export const schema = buildSchema(`
  type Post {
    _id: ID!
    title: String!
    content: String!
    imageUrl: String!
    creator: User!
    createdAt: String!
    updatedAt: String!
  }

  type User {
    _id: ID!
    name: String!
    email: String!
    status: String!
    password: String
    posts: [Post!]!
  }

  input UserInputData {
    email: String!
    name: String!
    password: String!
  }
  
  type RootQuery {
    hello: String
  }

  type RootMutation {
    createUser(userInput: UserInputData): User!
  }

  schema {
    query: RootQuery
    mutation: RootMutation
  }
`);
