//database configuration
import development from "./configuration.js";

const { Model } = require("objection");
const Knex = require("knex");

// Initialize knex.
const knex = Knex({
  client: "mysql",
  connection: development.connection
});

// Give the knex object to objection.
Model.knex(knex);

module.exports = Model;
