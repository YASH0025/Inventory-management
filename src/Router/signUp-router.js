const {express,router, validate, UserController,authenticateToken} = require('./index')


router.post('/signUp', validate.signUpValidator, UserController.SignUpController)

router.post('/login', validate.logInValidator, UserController.logInController)

router.post('/forget-password', validate.forgetPasswordValidator, UserController.forgetPasswordController)

router.put('/reset-password', validate.resetPasswordValidator, UserController.resetPasswordController)

router.put('/update-profile', validate.updateInfoValidator, authenticateToken, UserController.updateProfileController)


module.exports = router