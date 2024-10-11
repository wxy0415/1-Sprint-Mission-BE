import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import articleRoutes from "./routes/articleRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/article", articleRoutes);
app.use("/products", productRoutes);
app.use("/comment", commentRoutes);

app.listen(process.env.PORT || 3000, () => console.log("Server Started"));
