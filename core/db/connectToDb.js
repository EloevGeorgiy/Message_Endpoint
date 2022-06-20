import mongoose from "mongoose";

export function connectToDb() {
  const dbURL = process.env.DB_URL;

  mongoose
    .connect(dbURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("Database connected!"))
    .catch((err) => console.error(err));
}
