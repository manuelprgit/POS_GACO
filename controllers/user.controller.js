import { getConnection } from "../database/conection";

const getUsers = async (req,res) => {

  let pool = await getConnection();
  let users = await pool.request().query('select * from usua_caj');
  
  res.json(users.recordset);
}

const getSuperVisor = async (req,res) => {
  let pool = await getConnection();
  let superVisor = await pool.request().query('select * from supervis');

  res.json(superVisor.recordset);
}

const validateUser = async (req, res) => {
    let pool = await getConnection();
    let userInfo = req.body;
    let validateResult = await pool.request().query(`
        select * from supervis where numero = ${userInfo.userId}
    `);
    validateResult = validateResult.recordset[0];
    console.log(validateResult)
    if(validateResult){

    }
}


export {
    validateUser,
    getUsers,
    getSuperVisor
}