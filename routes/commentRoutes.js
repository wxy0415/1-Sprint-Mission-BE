import express from "express";
import { assert } from "superstruct";
import { PrismaClient } from "@prisma/client";
import { CreateComment } from "../structs.js";
import asyncHandler from "../middleware/asyncHandler.js";

const commentRouter = express.Router();
const prisma = new PrismaClient();

commentRouter.route("/").post(
  asyncHandler(async (req, res) => {
    assert(req.body, CreateComment);
    const { articleId } = req.body;
    const comment = await prisma.comment.create({
      data: {
        ...req.body,
        articleId: articleId,
      },
    });
    res.status(201).send(comment);
  })
);

commentRouter
  .route("/:id")
  .patch(
    asyncHandler(async (req, res) => {
      assert(req.body, CreateComment);
      const { id } = req.params;
      const updateComment = await prisma.comment.update({
        where: { id },
        data: req.body,
      });
      res.status(200).send(updateComment);
    })
  )
  .delete(
    asyncHandler(async (req, res) => {
      const { id } = req.params;
      await prisma.comment.delete({
        where: { id },
      });
      res.sendStatus(204);
    })
  );

commentRouter.route("/article/:id").get(
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { cursor, limit = 5 } = req.query;
    const parsedLimit = parseInt(limit);

    const comments = await prisma.comment.findMany({
      where: {
        articleId: id,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        articleId: true,
      },
      take: parsedLimit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: {
        createdAt: "desc",
      },
    });

    res.send(comments);
  })
);

export default commentRouter;
