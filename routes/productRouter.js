import express from "express";
import { PrismaClient } from "@prisma/client";
import asyncHandler from "../middleware/asyncHandler.js";

const router = express.Router();
const prisma = new PrismaClient();

router
  .route("/")
  .get(
    asyncHandler(async (req, res) => {
      const { page, pageSize, order = "recent", keyword = "" } = req.query;
      let orderBy;
      switch (order) {
        case "favorite":
          orderBy = { favoriteCount: "desc" };
          break;
        case "recent":
        default:
          orderBy = { createdAt: "desc" };
      }

      const searchQuery = {
        OR: [
          { name: { contains: keyword } },
          { description: { contains: keyword } },
        ],
      };

      const pageNum = Number(page) || 1;
      const pageSizeNum = Number(pageSize) || 10;
      const skipInt = (pageNum - 1) * pageSizeNum;

      const products = await prisma.product.findMany({
        where: searchQuery,
        orderBy: orderBy,
        skip: parseInt(skipInt),
        take: parseInt(pageSizeNum),
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          tags: true,
          favoriteCount: true,
          createdAt: true,
        },
      });
      const totalCount = await prisma.product.count({
        where: searchQuery,
      });

      res.send({ totalCount, products });
    })
  )
  .post(
    asyncHandler(async (req, res) => {
      const newProduct = await prisma.product.create({ data: req.body });
      res.status(201).send(newProduct);
    })
  );

router
  .route("/:id")
  .get(
    asyncHandler(async (req, res) => {
      const id = req.params.id;
      const product = await prisma.product.findUnique({
        where: { id: Number(id) },
      });
      if (product) {
        res.send(product);
      } else {
        res.status(404).send({ message: "Cannot find given id." });
      }
    })
  )
  .patch(
    asyncHandler(async (req, res) => {
      const id = req.params.id;
      const product = await prisma.product.findUnique(id);
      if (product) {
        Object.keys(req.body).forEach((key) => {
          product[key] = req.body[key];
        });
        await product.save();
        res.send(product);
      } else {
        res.status(404).send({ message: "Cannot find given id. " });
      }
    })
  )
  .delete(
    asyncHandler(async (req, res) => {
      const id = Number(req.params.id);
      const product = await prisma.product.delete(id);
      if (product) {
        res.sendStatus(204);
      } else {
        res.status(404).send({ message: "Cannot find given id. " });
      }
    })
  );

export default router;
