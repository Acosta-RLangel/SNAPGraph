//npm install --save apollo-server-azure-functions graphql graphql-tools apollo-server-module-graphiql lodash node-fetch azure-functions-typescript

const server = require("apollo-server-azure-functions");
const graphqlTools = require("graphql-tools");
const find = require("lodash/find");
const filter = require("lodash/filter");
const fetch = require("node-fetch");

const BASE_URL = "https://snapistage.acosta.com/api";
const AUTH_HEADER = "Basic " + new Buffer(process.env["username"] + ":" + process.env["userpass"]).toString("base64");
const HEADERS = {headers:{"Authorization":AUTH_HEADER,"ContentType":"application/json"}};



const platforms = fetch(`${BASE_URL}/platforms/getall`, HEADERS).then(res => res.json());

//#region type_defs
const typeDefs = `
  type Platform {
    "The ID of the platform"
    platform_id: Int!
    "The name of the platform."
    platform_name: String!,
  }

  type Program{
    "The ID of the platform"
    id: Int!
    "The name of the platform."
    name: String!,
  }

  "Queries retrieve data from the system."
  type Query {
    "Get the list of platforms."
    platforms: [Platform],
    "Get a platform by its ID."
    platform(id: Int!): Platform,
    #"Get the list of programs."
    #authors: [Author],
    #"Get an program by its ID"
    #program(id:Int!):[Program],
    #"Get the authors with the last name of <lastname>"
    #authorsByLastname(lastname:String!):[Author],
    #"Get the authors with the First name of <firstname> and last name of <lastname>."
    #authorsByName(firstname:String!,lastname:String!):[Author]
  }
`;
//#endregion

//#region resolversgit 

const resolvers = {
    Query: {
      platforms: () => fetch(`${BASE_URL}/platforms/getall`, HEADERS).then(res => res.json()),
      platform: (_, { id }) => fetch(`${BASE_URL}/platforms/${id}`, HEADERS).then(res => res.json()),
      //authors: () => authors,
      //authorsByLastname:(_, {lastname}) => authors.filter(author => author.lastname === lastname),
      //authorsByName:(_,{firstname,lastname}) => authors.filter(author => author.lastname === lastname && author.firstname == firstname)
   },
  /*
    Author: {
      books: author => filter(books, { authorId: author.id }),
      fullname: author => author.firstname + " " + author.lastname,
    },
    
    Book: {
      author: book => find(authors, { id: book.authorId }),
    },
    */
  };
  
  //#endregion

  const schema = graphqlTools.makeExecutableSchema({
    typeDefs,
    resolvers
  });
  
  module.exports = function run(context, req) {
    if (req.method === 'POST') {
      server.graphqlAzureFunctions({
        endpointURL: '/api/SNAPIGraphQL',
        schema: schema
      })(context, req);
    } else if (req.method === 'GET') {
      return server.graphiqlAzureFunctions({
        endpointURL: '/api/SNAPIGraphQL',
        schema: schema
      })(context, req);
    }
  };