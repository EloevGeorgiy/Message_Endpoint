import mongoose from "mongoose";

const { Schema, model } = mongoose;

const messageSchema = new Schema({
  actor: { type: String, required: true },
  text: { type: String, required: true },
});

export const Message = model("messages", messageSchema);
