
const jwt = require('jsonwebtoken');
const User = require('../Models/user.model');

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, 'your-secret-key');

    const user = await User.findById(decodedToken.userId).populate('roles');
    console.log(user)
    if (!user) {
      return res.status(401).json({ message: 'Authentication failed. User not found.' });
    } else {
      const hasRequiredRole = user.roles.name === 'admin';

      if (hasRequiredRole) {
        next();
      } else {
        res.status(403).json({ message: 'Access forbidden. Insufficient privileges.' });
      }
    }

  } catch (error) {
    console.error("Error in authentication middleware:", error);
    res.status(401).json({ message: 'Authentication failed. Token invalid.' });
  }
};

module.exports = auth;
