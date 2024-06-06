import express from "express";
import "dotenv/config";
import { identifyContact } from "./services/contact";
import bodyParser from "body-parser";

const app = express();

app.use(bodyParser.json());

const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("App started!");
});

app.post("/identify", identifyContact);

app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});
