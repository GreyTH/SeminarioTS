const express = require('express');
const router = express.Router();

const categoriesRoutes = require('./categorias');
const usuariosRoutes=require('./usuarios')

router.use('/categories', categoriesRoutes);
router.use('/user', usuariosRoutes);

module.exports = router;
