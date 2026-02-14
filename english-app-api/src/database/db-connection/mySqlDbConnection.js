// Import the createPool function from the 'mysql2/promise' package
const { createPool } = require("mysql2/promise");

// Create a connection pool with the specified configuration
const pool = createPool({
    host: 's12786.usc1.stableserver.net',       // Database host
    user: 'unitalwe_admin',        // Database user
    password: 'chusasuke0810',     // Database user's password
    database: 'unitalwe_english_app'  // Database name
});

// Export the created pool for use in other parts of the application
module.exports = {
    pool
};
