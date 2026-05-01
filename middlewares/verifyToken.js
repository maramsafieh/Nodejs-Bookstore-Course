const jwt = require("jsonwebtoken");

// التحقق من وجود التوكن وصحته
function verifyToken(req, res, next) {
    const token = req.headers.token;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
            req.user = decoded;
            next();
        } catch (error) {
            res.status(401).json({ message: "invalid token" });
        }
    } else {
        res.status(401).json({ message: "no token provided" });
    }
}

// التحقق من التوكن وأن المستخدم هو صاحب الحساب أو Admin
function verifyTokenAndAuthorization(req, res, next) {
    verifyToken(req, res, () => {
        if (req.user.id === req.params.id || req.user.isAdmin) {
            next();
        } else {
            return res.status(403).json({ message: "you are not allowed" });
        }
    });
}

// التحقق من التوكن وأن المستخدم Admin فقط
function verifyTokenAndAdmin(req, res, next) {
    verifyToken(req, res, () => {
        if (req.user.isAdmin) {
            next();
        } else {
            return res.status(403).json({ message: "you are not allowed, only admin allowed" });
        }
    });
}

module.exports = {
    verifyToken,
    verifyTokenAndAuthorization,
    verifyTokenAndAdmin
};