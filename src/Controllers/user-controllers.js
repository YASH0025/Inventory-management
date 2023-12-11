const { User, bcrypt, jwt, secretKey, emailService, hbs, path, fs } = require('./user-index')
const Role = require('../Models/role.model');


const generateToken = (userId, userEmail) => {
    return jwt.sign({ userId, email: userEmail }, secretKey, { expiresIn: '1h' });
};
const SignUpController = async (req, res) => {
    try {
        const userData = req.body;
        const checkEmail = await User.findOne({ email: userData.email });

        if (checkEmail) {
            return handleStatusCode(res, "Email already exists", 409);
        } else {
            const hashedPass = await bcrypt.hash(userData.password, 10);
            // const newRole = await Role.create({ name: 'user' });
            const userRole = await Role.findOne({ name: 'user' }) || await Role.create({ name: 'user' });

            const adminRole = await Role.findOne({ name: 'admin' }) || await Role.create({ name: 'admin' });

            if (!userRole._id) {
                await userRole.save();
            }

            if (!adminRole._id) {
                await adminRole.save();
            }

            const user = new User({
                ...userData,
                password: hashedPass,
                roles: userRole._id,
            });

            await user.save();

            // newRole.users.push(user._id);
            // await newRole.save();
            const token = generateToken({
                userId: user._id,
                email: user.email,
                roles: user.roles,
                roleName: userRole._id,

            });
            await userRole.save();
            await adminRole.save();

            res.status(201).json({ data: user, token });
        }
    } catch (error) {
        handleControllerError(res, error, 'Error processing the Sign Up request', 500);
    }
};


const logInController = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email })
        if (!user) {

            handleStatusCode(res, "user email not found", 400)
        } else {
            const cheakHashPass = await bcrypt.compare(password, user.password)

            if (!cheakHashPass) {
                return handleStatusCode(res, "wrong password", 400)
            }
            const token = jwt.sign({ userId: user._id, email: user.email }, secretKey, { expiresIn: '1h' });

            res.status(200).json({ message: 'Logged In Successfully', data: user, token })
        }


    } catch (error) {
        handleControllerError(res, error, 'Error processing the LogIn request', 500);

    }
}


const forgetPasswordController = async (req, res) => {

    try {
        const { email } = req.body
        const User_Email = await User.findOne({ email })


        if (!User_Email) {
            return handleStatusCode(res, 'No user found with this email id in or database', 400)

        }
        const token = jwt.sign({ email }, secretKey, { expiresIn: '1h' });
        const resetPasswordLink = `${token}`;
        // const htmlContent = hbs.compile(
        //     fs.readFileSync  (path.join(__dirname, '.View', 'index.hbs'), 'utf8')
        // )({ resetPasswordLink });
        const templatePath = path.join(__dirname, './View', 'index.hbs');

        const htmlContent = hbs.compile(fs.readFileSync(templatePath, 'utf8'))({ resetPasswordLink });

        const emailSent = await emailService.sendPasswordResetEmail(email, htmlContent);

        if (emailSent) {
            res.status(200).json({ message: 'Password reset email sent', token });
        } else {
            return handleControllerError(res, 'Error sending password reset email', 500);
        }

        // passwordResetToken.set("email", email)
        // console.log(passwordResetToken);
        // res.status(200).json({ message: 'Password reset email sent', "token": token } );

    } catch (error) {
        handleControllerError(res, error, 'Error processing the forget password request', 500);


    }
}

const resetPasswordController = async (req, res) => {
    try {
        const token = req.headers.authorization;

        const { newPassword } = req.body
        const decodedToken = jwt.verify(token.replace('Bearer ', ''), secretKey);

        const email = decodedToken.email
        // let Verify_Email = "";
        // for (const x of passwordResetToken.values()) {
        //     Verify_Email += x;
        // }
        // if (!Verify_Email) {
        //     return res.status(400).json({ message: 'Invalid Email token or expired link' })
        // }

        const user = await User.findOne({ email })
        if (!user) {
            return handleStatusCode(res, "Email does not exist in database", 401)

        }
        console.log(newPassword);
        const hashedPass = await bcrypt.hash(newPassword, 10)

        user.password = hashedPass;
        await user.save()
        console.log(user.password);
        handleStatusCode(res, 'Password changed successfully', 201)


    } catch (error) {
        handleControllerError(res, error, 'Error processing the reset password request', 500);

    }

}
const updateProfileController = async (req, res) => {

    const userData = req.body
    const loggedInUserId = req.user.userId;

    try {

        const updateUser = await User.findOneAndUpdate({ _id: loggedInUserId }, userData, { new: true })
        if (!updateUser) {
            return res.status(401).json({ message: "Profile could not be updated" })
        }
        else {
            res.status(201).json({ message: 'Profile Updated Successfully' });
        }

    } catch (error) {
        handleControllerError(res, error, 'Error processing the update profile request', 500);

    }

}
const handleStatusCode = (res, messages, status) => {
    return res.status(status).json({ message: messages })


}
const handleControllerError = (res, error, message = 'Internal Server Error', status = 500) => {
    console.error('Error processing the request:', error);
    return res.status(status).json({ error: message });
};

module.exports = { SignUpController, logInController, forgetPasswordController, resetPasswordController, updateProfileController }
