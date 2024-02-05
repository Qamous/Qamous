// server.ts
import * as http from 'http';
import * as mysql from 'mysql';

const PORT = process.env.PORT || 5000;

// Create MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'your_mysql_username',
    password: 'your_mysql_password',
    database: 'UrbanDictionaryMySQL'
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to MySQL database');
});

// Create HTTP server
const server = http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello from the backend!\n');
});

// Start server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
