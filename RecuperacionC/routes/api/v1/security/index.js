const enviarCorreo =require('../../../../libs/security/recuperarPassword')
const express =require('express');
let router = express.Router();
const Usuario = require('../../../../libs/usuarios');
const UsuarioDao = require('../../../../dao/mongodb/models/UsuarioDao');
const userDao = new UsuarioDao();
const user = new Usuario(userDao);
user.init();

const {jwtSign} = require('../../../../libs/security');

router.post('/login', async (req, res)=>{
  try {
    const {email, password} = req.body;
    const userData = await user.getUsuarioByEmail({email});
    if(! user.comparePasswords(password, userData.password) ) {
      console.error('security login: ', {error:`Las credenciales para usuario son ${userData._id} ${userData.email} incorrectas.`});
      return res.status(403).json({ "error": "Las credenciales no son Válidas" });
    }
    const {password: passwordDb, created, updated, ...jwtUser} = userData;
    const jwtToken = await jwtSign({jwtUser, generated: new Date().getTime()});
    return res.status(200).json({token: jwtToken});
  } catch (ex) {
    console.error('security login: ', {ex});
    return res.status(500).json({"error":"No se puede procesar la solicitud."});
  }
});

router.post('/signin', async (req, res) => {
  try {
    const { email = '',
      password = ''
    } = req.body;
    if (/^\s*$/.test(email)) {
      return res.status(400).json({
        error: 'Se espera un valor de correo'
      });
    }

    if (/^\s*$/.test(password)) {
      return res.status(400).json({
        error: 'Se espera un valor de contraseña correcta'
      });
    }
    const newUsuario = await user.addUsuarios({
      email,
      nombre : 'John Doe',
      avatar: '',
      password,
      estado: 'ACT'
    });
    return res.status(200).json(newUsuario);
  } catch (ex) {
    console.error('security signIn: ', ex);
    return res.status(502).json({ error: 'Error al procesar la solicitud deseada' });
  }
});

router.post('/recuperarPass', async (req, res)=>{
  try {
    
    const {email} = req.body;

    var pin = 0;

    function generateRandom(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);

        return Math.floor(Math.random() * (1 + max - min) + min);
    }
    for (i = 0; i <= 500; i++) {
        pin = generateRandom(1000, 9000);
    }

    const userData = await user.getUsuarioByEmail({email});
    console.log(userData);
    const transporter = await enviarCorreo();
     

    let info = await transporter.sendMail({
      from: 'carollipez225@gmail.com', 
      to: userData.email,
      subject: "Seminario Taller de Software", 
      text: '123glmm', 
    });
    res.json({mensaje:"Correo enviado correctamente"});
    

  } catch (ex) {
    console.error({ex});
    return res.status(500).json({"error":"No fue posible enviar el correo deseado."});
  }
});


module.exports = router;