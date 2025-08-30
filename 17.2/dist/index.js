import { Client } from "pg";
import express from "express";
const app = express();
app.use(express.json());
const pgClient = new Client("postgresql://neondb_owner:npg_XtvQnUFKD53e@ep-square-heart-adfd0qt1-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require");
pgClient.connect();
app.post("/signup", async (req, res) => {
    const { username, email, password } = req.body;
    const city = req.body.city;
    const country = req.body.country;
    const street = req.body.street;
    const pincode = req.body.pincode;
    try {
        const insertQuery = `
      INSERT INTO users (username, email, password) 
      VALUES ($1, $2, $3) RETURNING id;
    `;
        const addressInsertQuery = "INSERT INTO addresses (city, country, street, pincode, user_id) VALUES ($1, $2, $3, $4, $5);";
        await pgClient.query("BEGIN");
        const response = await pgClient.query(insertQuery, [username, email, password]);
        const userId = response.rows[0].id;
        const addressResponse = await pgClient.query(addressInsertQuery, [city, country, street, pincode, userId]);
        await pgClient.query("COMMIT");
        res.json({ message: "You have signed up" });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Something went wrong" });
    }
});
//  BAD METHOD
app.get("/metadata1", async (req, res) => {
    const id = req.query.id; // this works only when we give ?id=some value in postman or route
    const query1 = `SELECT username,email,id FROM users WHERE ID=$1`;
    const response1 = await pgClient.query(query1, [id]);
    const query2 = `SELECT * FROM addresses WHERE user_id=$1`;
    const response2 = await pgClient.query(query2, [id]);
    res.json({
        user: response1.rows[0], //both rows and rows[0] can be used here as each id has 1 user
        address: response2.rows //here use rows since 1 user can have multiple addresses
    });
});
//USING JOINS GOOD METHOD
app.get("/metadata2", async (req, res) => {
    const id = req.query.id;
    const query = `SELECT users.id,users.username,users.email,addresses.city,addresses.country,addresses.street,addresses.pincode FROM users JOIN addresses ON users.id=addresses.user_id WHERE users.id=$1`;
    const response = await pgClient.query(query, [id]);
    res.json({
        User: response.rows
    });
});
app.listen(3000, () => {
    console.log("Server Started.....");
});
//# sourceMappingURL=index.js.map