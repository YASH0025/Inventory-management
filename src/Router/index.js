const express = require('express')
const router = express.Router()
const validate = require("../Middlewares/validate-user-middleware");
const UserController= require("../Controllers/user-controllers");
const {authenticateToken} = require('../Middlewares/authenticaiton-middleware')

module.exports = {express,router, validate, UserController,authenticateToken}