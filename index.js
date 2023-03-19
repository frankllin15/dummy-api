const express = require("express");
const database = require("./database.json");
const fs = require("fs");
const { randomUUID } = require("node:crypto");
const jwt = require("jsonwebtoken");
const middlewares = require("./middlewares");
const { JWT_SECRET } = require("./config");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.post("/signup", (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            throw new Error("Email and password are required");
        }

        if (database.users.find((user) => user.email === email)) {
            throw new Error("User already exists");
        }

        const user = {
            id: randomUUID(),
            email,
            password,
        };

        database.users.push(user);

        fs.writeFileSync("./database.json", JSON.stringify(database));

        return res.status(201).json(user);
    } catch (err) {
        res.status(400).send({ message: err.message});
    }
});

app.post("/login", (req, res) => {
    try {

    const { email, password } = req.body;

    if (!email || !password) {
        throw new Error("Email and password are required");
    }

    const user = database.users.find((user) => user.email === email);

    if (!user) {
        throw new Error("Email or password is incorrect");
    }

    if (user.password !== password) {
        throw new Error("Email or password is incorrect");
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
        expiresIn: "15s",
    });

    const response = {
        access_token: token,
        expires_in: 15,
        expiration_type: "seconds",
    };

    return res.status(200).json(response);

    } catch (err) {
        return res.status(400).send({ message: err.message });
    }
});

app.get("/protected", middlewares.auth, (req, res) => {
    return res.status(200).send("You are authorized");
});

app.get("/current-user", middlewares.auth, (req, res) => {
    const { userId } = req.user;
    const user = database.users.find((user) => user.id === userId);

    return res.status(200).json(user);
});

app.listen(3000, () => {
    console.log("Server listening on port 3000");
});
