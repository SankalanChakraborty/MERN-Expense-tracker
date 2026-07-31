import app from "./app.js";
import connectDB from "./db/connectDB.js";

connectDB();
app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
