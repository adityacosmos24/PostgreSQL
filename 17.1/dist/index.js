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
app.listen(3000, () => {
    console.log("Server Started.....");
});
//# sourceMappingURL=index.js.map