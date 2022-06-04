const PORT = process.env.PORT || 3000;
const express = require("express");
const app = express();

// Parse request body
app.use(express.json());


// Mock data
let users = [
    { id: 1, name: "Arne", email: "arne@mail.dk" },
    { id: 2, name: "Frank", email: "frank@mail.dk" },
    { id: 3, name: "Ole", email: "ole@mail.dk" }
]


// *** GET ***

// Get all users
app.get("/users", (req, res) => {
    res.status(200).json({ users: users })
});

// Get single user
app.get("/users/:id", getUser, (req, res) => {
    res.status(200).send(res.user)
})


// *** POST ***

app.post("/users", async (req, res) => {
    // Validation ...
    if (!req.body.name || !req.body.email) return res.status(400).json({ message: "Missing user data" })

    // Create new user object
    const newUser = {
        id: users[users.length - 1]?.id + 1 || 1,
        name: req.body.name,
        email: req.body.email
    }

    // Try to insert new user into database ...
    try {
        users = [...users, newUser]
    } catch (e) {
        return res.status(417).json({ error: e })
    }

    res.status(201).json({ message: "User successfully created", user: newUser })
})


// *** UPDATE ***

// PUT
app.put("/users/:id", getUser, async (req, res) => {
    res.user.name = req.body.name
    res.user.email = req.body.email

    res.status(201).json({ method: req.method, user: res.user })
})

// PATCH
app.patch("/users/:id", getUser, async (req, res) => {
    if (req.body.name) res.user.name = req.body.name
    if (req.body.email) res.user.email = req.body.email

    res.status(201).json({ method: req.method, user: res.user })
})


// *** DELETE ***

app.delete("/users/:id", getUser, async (req, res) => {
    try {
        users = users.filter(user => {
            return user.id !== res.user.id
        })
    } catch (e) {
        return res.status(417).json({ error: e })
    }

    res.status(303).json({ message: "User successfully removed!", user: res.user })
})


app.listen(PORT, () => {
    console.log(`listening on *:${PORT}`);
});


// Middleware
async function getUser(req, res, next) {
    const id = parseInt(req.params.id)
    let user;

    try {
        user = users.find(user => {
            return user.id === id
        })

        if (user == null || user == undefined) {
            return res.status(404).json({ message: `No user found with ID ${req.params.id}.` })
        }
    } catch (err) {
        return res.status(417).json({ error: err.message })
    }

    res.user = user;

    next();
}
