import sql from 'mssql';

const dbSettings = {
    user: 'sa',
    password: '123',
    server: 'localhost',
    database: 'PVENTA',
    options:{
        encrypt: true,
        trustServerCertificate: true
    }
}

async function getConnection(){
    try {
        const pool = await sql.connect(dbSettings);
        return pool;
    } catch (error) {
        console.log(error)
    }
}
getConnection();

export {
    getConnection
};