import express from "express";
import "dotenv/config";
import { identifyContact } from "./controller/contact";
import bodyParser from "body-parser";

const app = express();

app.use(bodyParser.json());

const port = process.env.API_PORT || 3000;

app.get("/", (req, res) => {
  res.send("App started!");
});

app.post("/identify", identifyContact);

app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});
