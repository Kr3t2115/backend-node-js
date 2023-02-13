const { Pool } = require('pg');

require("dotenv").config({path: "env/.env"});

const pool = new Pool({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'crypto',
  password: "admin",
  port: 5432
});

module.exports = pool;