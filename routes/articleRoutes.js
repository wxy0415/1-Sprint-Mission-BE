import express from "express";
import { assert } from "superstruct";
import { PrismaClient } from "@prisma/client";
import { CreateArticle, PatchArticle } from "../structs.js";
import asyncHandler from "../middleware/asyncHandler.js";

const articleRouter = express.Router();
const prisma = new PrismaClient();

articleRouter
  .route("/")
  .post(
    asyncHandler(async (req, res) => {
      assert(req.body, CreateArticle);
      const article = await prisma.article.create({
        data: req.body,
      });
      res.status(201).send(article);
    })
  )
  .get(
    asyncHandler(async (req, res) => {
      const { page, pageSize, order = "recent", keyword = "" } = req.query;

      let orderBy;
      switch (order) {
        case "oldest":
          orderBy = { createdAt: "asc" };
          break;
        case "recent":
        default:
          orderBy = { createdAt: "desc" };
      }

      const searchQuery = keyword
        ? {
            OR: [
              { content: { contains: keyword } },
              { title: { contains: keyword } },
            ],
          }
        : {};

      const pageNum = Number(page) || 1;
      const pageSizeNum = Number(pageSize) || 10;
      const skipInt = (pageNum - 1) * pageSizeNum;

      const articles = await prisma.article.findMany({
        where: searchQuery,
        orderBy: orderBy,
        skip: parseInt(skipInt),
        take: parseInt(pageSizeNum),
      });

      res.send(articles);
    })
  );

articleRouter
  .route("/:id")
  .get(
    asyncHandler(async (req, res) => {
      const { id } = req.params;
      const article = await prisma.article.findUniqueOrThrow({
        select: {
          id: true,
          title: true,
          content: true,
          createdAt: true,
        },
        where: { id },
      });
      res.send(article);
    })
  )
  .patch(
    asyncHandler(async (req, res) => {
      assert(req.body, PatchArticle);
      const { id } = req.params;
      const article = await prisma.article.update({
        where: { id },
        data: req.body,
      });
      res.send(article);
    })
  )
  .delete(
    asyncHandler(async (req, res) => {
      const { id } = req.params;
      await prisma.article.delete({
        where: { id },
      });
      res.sendStatus(204);
    })
  );

export default articleRouter;
