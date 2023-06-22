import { getConnection } from "../database/conection";

const getUsers = async (req, res) => {

  let pool = await getConnection();
  let users = await pool.request().query('select * from usua_caj');

  res.json(users.recordset);
}

const getSuperVisor = async (req, res) => {
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

  if (validateResult.CLAVE_BO == userInfo.pass) {
    res.status(200).json({ isSuccess: true, msg: 'Usuario Correcto' });
  }
  else res.status(400).json({ isSuccess: false, msg: 'Usuario Invalido' });
}


export {
  validateUser,
  getUsers,
  getSuperVisor
}