import mysql from 'mysql2/promise';

export default function conectar() {
    
    if (!global.poolConexoes) {
        global.poolConexoes = mysql.createPool({
            host: 'localhost',
            user: 'root',
            password: '1234',
            database: 'dblivrosraros',
            waitForConnections: true,
            connectionLimit: 10,
            maxIdle: 10,
            idleTimeout: 60000,
            queueLimit: 0,
            enableKeepAlive: true,
            keepAliveInitialDelay: 0
        });
    } return global.poolConexoes;
}