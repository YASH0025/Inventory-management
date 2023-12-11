const Category = require('../Models/Admin-Models/category-model.js')
const Product = require('../Models/Admin-Models/product-model.js')
const Inventory = require('../Models/Admin-Models/inventory-model.js')
const User = require('../Models/user.model.js')
const jwt = require('jsonwebtoken')
const Role = require('../Models/role.model.js')

module.exports= {Category,Product,Inventory,User,jwt,Role}