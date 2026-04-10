const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'anti_counterfeit_db',
    password: 'Jenson0927@',
    port: 5432,
});

module.exports = pool;