import { config } from "dotenv";
import { createClient } from "redis";
import express, { json } from "express";

import { sleep } from "./utils/sleep.js";
import { Message } from "./db/schema/message.js";
import { connectToDb } from "./db/connectToDb.js";

config();

const port = process.env.PORT;

const app = express();

app.use(json());
const client = createClient({
  url: process.env.REDIS,
});

client.connect();
client.on("ready", () => console.log("Redis connected ;)"));
client.on("error", (err) => console.log("Redis Client Error", err));

connectToDb();

const processMessage = async (req) => {
  const publisher = client.duplicate();
  await publisher.connect();

  const { userText, eventUid } = req.body;

  try {
    await sleep();
    const userEvent = new Message({ actor: "user", text: userText });
    await userEvent.save();

    const usersConnectSub = await client.PUBSUB_NUMSUB(eventUid);

    if (usersConnectSub[eventUid] === 0) {
      const message = "Ответ не был найден :(";
      const serverEvent = new Message({ actor: "server", text: message });
      await serverEvent.save();
    } else {
      const message = "Здаравстуй пользователь!";
      await publisher.publish(
        eventUid,
        JSON.stringify({ eventKey: "serverText", eventBody: message })
      );

      const serverEvent = new Message({ actor: "server", text: message });
      await serverEvent.save();
    }
  } catch (e) {
    console.log("CoreError:", e);
  }
};

const getAllMessages = async () => {
  try {
    const messages = await Message.find();
    return messages;
  } catch (e) {
    console.log("CoreError:", e);
  }
};

app.post("/answer", (req, res) => {
  processMessage(req);
  res.send();
});

app.get("/messages", async (req, res) => {
  res.send(await getAllMessages());
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
