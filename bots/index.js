import axios from "axios";
import express from "express";
import { config } from "dotenv";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "redis";

config();

const port = process.env.PORT;

const app = express();

app.use(express.json());
const client = createClient({
  url: process.env.REDIS,
});

client.connect();
client.on("ready", () => console.log("Redis connected ;)"));
client.on("error", (err) => console.log("Redis Client Error", err));

app.post("/message", (req, res) => {
  const { userText } = req.body;
  const subscriber = client.duplicate();

  new Promise(async (resolve, reject) => {
    const eventUid = uuidv4();

    await subscriber.connect();
    const timeout = setTimeout(() => {
      subscriber.unsubscribe(eventUid);
      reject();
    }, 3000);
    const date = new Date();
    axios.post(process.env.CORE_ORIGIN + "answer", { userText, eventUid });

    subscriber.subscribe(eventUid, (response) => {
      const { eventKey, eventBody } = JSON.parse(response);
      if (eventKey === "serverText") {
        clearTimeout(timeout);
        subscriber.unsubscribe(eventUid);
        res.json({ serverText: eventBody });
        return;
      }
    });
  }).catch(() => {
    res.status(202).json({ serverText: "Ответ не был найден :(" });
  });
});

app.get("/messages", (req, res) => {
  axios.get(process.env.CORE_ORIGIN + "messages").then((result) => {
    res.json(result.data);
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
