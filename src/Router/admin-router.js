const express = require('express');
const router = express.Router();
const auth = require('../Middlewares/cheak-role-auth-middleware');
const { addProductController,assignRoleByEmailController, categoryController,productsController,inventoryController,updateInventoryController} = require('../Controllers/admin-controller')


router.post('/admin/category',auth ,categoryController)
router.post('/admin/products',auth, productsController )

router.post('/admin/inventory',auth, inventoryController )
router.post('/admin/update-inventory',auth, updateInventoryController )

router.post('/admin/add-products',auth, addProductController)
router.put('/admin/assign-role',auth,assignRoleByEmailController );



module.exports = router;
