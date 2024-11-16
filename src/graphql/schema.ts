import { buildSchema } from "graphql";

export const schema = buildSchema(`
  type Query {
    _: Boolean
  }
`);
