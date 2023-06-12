import sql from 'mssql';

const dbSettings = {
    user: 'sa',
    password: '123',
    server: 'localhost',
    database: 'PAPELERIA_GACO',
    options:{
        encrypt: true,
        trustServerCertificate: true
    }
}

async function getConecetion(){
    try {
        const pool = await sql.connect(dbSettings);
        return pool;
    } catch (error) {
        console.log(error)
    }
}
getConecetion();