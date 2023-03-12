const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const { nanoid } = require("nanoid");
const {
  GraphQLObjectType,
  GraphQLList,
  GraphQLSchema,
  GraphQLString,
  GraphQLInt,
  GraphQLNonNull,
} = require("graphql");
const app = express();

// some data for the server
const someUsers = [
  {
    id: 1,
    name: "Sanjeet Tiwari",
    age: 26,
  },
  {
    id: 2,
    name: "Debaditya Dey",
    age: 27,
  },
  {
    id: 3,
    name: "Aliasghar Vali",
    age: 27,
  },
  {
    id: 4,
    name: "Shubham Singh",
    age: 29,
  },
];

const someExpenses = [
  {
    id: 1,
    name: "Rent",
    between: [1, 4],
    expense: 28000,
    description: "Bellandur flat rent",
  },
  {
    id: 2,
    name: "Maid",
    between: [2, 3],
    expense: 2500,
    description: "Maid at Sarjapur",
  },
  {
    id: 3,
    name: "Party",
    between: [1, 2, 3],
    expense: 4000,
    description: "Party at Deba's house",
  },
];

// ---- data end ----

const UserType = new GraphQLObjectType({
  name: "user",
  description: "Represents a user",
  fields: () => ({
    id: {
      type: GraphQLNonNull(GraphQLInt),
      description: "id of the user",
    },
    name: {
      type: GraphQLNonNull(GraphQLString),
    },
    age: {
      type: GraphQLInt,
    },
  }),
});

const ExpenseType = new GraphQLObjectType({
  name: "expense",
  description: "Describes an expense",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    expense: { type: GraphQLNonNull(GraphQLInt) },
    between: { type: new GraphQLList(GraphQLInt) },
    contributors: {
      type: new GraphQLList(UserType),
      resolve: (expense) => {
        return someUsers.filter((user) => expense.between.includes(user.id));
      },
    },
  }),
});

const RootQueryType = new GraphQLObjectType({
  name: "RootQuery",
  description: "Root query",
  fields: () => ({
    users: {
      type: new GraphQLList(UserType),
      resolve: () => someUsers,
    },
    expenses: {
      type: new GraphQLList(ExpenseType),
      resolve: () => someExpenses,
    },
    filterExpenses: {
      type: new GraphQLList(ExpenseType),
      description: "Return all expenses higher than some value",
      args: {
        value: { type: GraphQLInt },
      },
      resolve: (_parent, args) => {
        return someExpenses.filter((expense) => expense.expense > args.value);
      },
    },
  }),
});

const RootMutationType = new GraphQLObjectType({
  name: "RootMutation",
  description: "Root Mutation",
  fields: () => ({
    addUser: {
      type: UserType,
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        age: { type: GraphQLInt },
      },
      resolve: (_parent, args) => {
        const newUser = {
          id: nanoid(3),
          name: args.name,
          age: args.age,
        };
        someUsers.push(newUser);
        return newUser;
      },
    },
  }),
});

// now we need to create a schema
const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType,
});

app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    graphiql: true,
  })
);
app.listen(5000, () => console.log("Server is listening on port 5000"));
