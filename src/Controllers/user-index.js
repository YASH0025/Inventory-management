const User = require('../Models/user.model')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const secretKey = 'your-secret-key';
const passwordResetToken = new Map()
const emailService = require('./email-nodemailer');
const hbs = require('hbs');
const path = require('path');
const fs = require('fs')
const templatePath = require('./View/index.hbs')







module.exports = { User, bcrypt, jwt, secretKey, passwordResetToken, emailService, hbs, path, fs, templatePath }
