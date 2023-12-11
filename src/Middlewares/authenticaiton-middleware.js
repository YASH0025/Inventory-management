const jwt = require('jsonwebtoken')
const secretKey = 'your-secret-key';


const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decodedToken = jwt.verify(token.replace('Bearer ', ''), secretKey);
        req.user = {
            userId: decodedToken.userId,

        };
        next();
    } catch (err) {
        console.error(err);
        res.status(403).json({ message: 'Forbidden' });
    }
};

module.exports = { authenticateToken }
