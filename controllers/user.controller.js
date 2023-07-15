import { getConnection } from "../database/conection";

const getUsers = async (req, res) => {

  let pool = await getConnection();
  let users = await pool.request().query('select * from PAPELERIA_GACO.dbo.USUA_CAJ');

  res.json(users.recordset);
}

const getSuperVisor = async (_, res) => {
  let pool = await getConnection();

  try {

    let { recordset } = await pool.request().query(`
      select * from PAPELERIA_GACO.dbo.USUA_CAJ
    `);
    
    res.status(200).json( recordset );
    return;
    
  } catch (error) {
    res.status(400).json({
      error: "error",
      message: error.message
    });
    return;
  }
}

const validateUser = async (req, res) => {

  let userInfo = req.body;
  console.log(userInfo);
  let pool = await getConnection();
  try {
    
  } catch (error) {
    res.status(400).json({
      
    })
  }
  if (userInfo.userId == 0) {
    return res.status(400).json({ status: 400, msg: 'debe seleccionar el usuario' })
  }

  let validateResult = await pool.request().query(`
      select * from PAPELERIA_GACO.dbo.USUA_CAJ 
      where numero = ${userInfo.userId}
    `);
  
    validateResult = validateResult.recordset[0];

  if (validateResult.CLAVE == userInfo.pass) {
    res.status(200).json({ isSuccess: true, msg: 'Usuario Correcto' });
  }
  else res.status(400).json({ isSuccess: false, msg: 'Usuario Invalido' });
}


export {
  validateUser,
  getUsers,
  getSuperVisor
}