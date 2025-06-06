import dotenv from 'dotenv';
import express from "express";

dotenv.config();

const app = express();

app.get("/", (req: any, res: any) => res.send("Express on Vercel"));

const port = process.env.APP_PORT;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;