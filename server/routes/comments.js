const express = require("express");
const validateObjectId = require("../middleware/validateObjectId");
const { Document } = require("../models/documents");
const { Comment, validate } = require("./../models/comments");
const router = express.Router();

router.get("/:id", [validateObjectId], async function handle(req, res) {
  const comments = await Comment.find({ documentId: req.params.id });
  res.send(comments);
});

router.post("/:id", [validateObjectId], async function handle(req, res) {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const comment = await new Comment({ documentId: req.params.id, ...req.body });
  comment.save();

  res.send(comment);
});

router.put("/:id", [validateObjectId], async function handle(req, res) {
  if (!req.query.commentId)
    return res.status(400).send("No comment Id provided");

  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const comment = await Comment.findOneAndUpdate(
    { _id: req.query.commentId, documentId: req.params.id },
    {
      _id: req.query.commentId,
      documentId: req.params.id,
      ...req.body,
    }
  );

  if (!comment)
    res.status(404).send(`There is no document with id ${req.params.id}`);
  res.send({
    _id: req.query.commentId,
    documentId: req.params.id,
    ...req.body,
  });
});

router.delete("/:id", [validateObjectId], async function handle(req, res) {
  if (!req.query.commentId)
    return res.status(400).send("No comment Id provided");

  const document = await Document.findById(req.params.id);
  if (!document)
    res.status(404).send(`There is no document with id ${req.params.id}`);

  const comment = await Comment.findByIdAndRemove(req.query.commentId);
  if (!comment)
    res.status(404).send(`There is no comment with id ${req.query.commentId}`);

  res.send(comment);
});

module.exports = router;
