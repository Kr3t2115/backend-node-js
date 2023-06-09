const { Pool } = require('pg');

require("dotenv").config({path: "env/.env"});

// connecting to the postgresql database
const pool = new Pool({
  user: 'crypto_user',
  host: '127.0.0.1',
  database: 'cryptov1',
  password: "cf9de01f",
  port: 5432
});

module.exports = pool;