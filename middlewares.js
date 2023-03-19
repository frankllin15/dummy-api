const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("./config");

module.exports = {
    auth: (req, res, next) => {
        try {
            const { authorization } = req.headers;

            if (!authorization) {
                throw new Error("Token not found");
            }
            const [type, token] = authorization.split(" ");

            if (type !== "Bearer") {
                throw new Error("Invalid token");
            }

            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
            next();
        } catch (err) {
            return res.status(401).send("Invalid token");
        }
    },
};
