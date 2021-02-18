const express = require("express");
const auth = require("./../middleware/auth");
const validateObjectId = require("./../middleware/validateObjectId");
const { Document, validate } = require("./../models/documents");
const router = express.Router();

router.get("/", auth, async function handle(req, res) {
  const documents = await Document.find({ userId: req.user._id });

  let sharedDocuments = await Document.find({ allowSharing: true });
  sharedDocuments = [
    ...sharedDocuments.filter(function authorized(doc) {
      for (let i = 0; i < doc.whoCanAccess.length; i++) {
        if (doc.whoCanAccess[i]._id === req.user._id) {
          return true;
        }
      }
      return false;
    }),
  ];

  res.send([...documents, ...sharedDocuments]);
});

router.get("/:id", [validateObjectId, auth], async function handle(req, res) {
  const document = await Document.findById(req.params.id);

  if (!document)
    return res
      .status(404)
      .send(`There is no document with id ${req.params.id}`);

  if (document.allowSharing) {
    for (let i = 0; i < document.whoCanAccess.length; i++)
      if (document.whoCanAccess[i] === req.user._id) return res.send(document);
    return res
      .status(404)
      .send(`No sharable document with id ${req.params.id} found`);
  }

  if (document.userId !== req.user._id)
    return res
      .status(401)
      .send(`Not allowed to access this document with id ${document._id}`);

  res.send(document);
});

router.post("/", auth, async function handle(req, res) {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  if (!req.body.allowSharing)
    if (req.body.whoCanAccess && req.body.whoCanAccess.length > 1)
      return res
        .status(403)
        .send("Not allow to create this document without sharable option");

  const document = await new Document({
    title: req.body.title,
    content: req.body.content,
    userId: req.user._id,
    allowSharing: req.body.allowSharing && req.body.allowSharing,
    whoCanAccess: req.body.whoCanAccess && req.body.whoCanAccess,
  });
  document.save();
  res.send(document);
});

router.put("/:id", [validateObjectId, auth], async function handle(req, res) {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  if (!req.body.allowSharing)
    if (req.body.whoCanAccess && req.body.whoCanAccess.length > 0)
      return res
        .status(403)
        .send("Not allow to update this document without sharable option");

  let document = await Document.findById(req.params.id);

  if (req.user._id !== document.userId)
    return res
      .status(401)
      .send(
        `Access denied! Not allow to update this document with id ${document._id}`
      );

  await Document.updateOne(
    { _id: req.params.id },
    {
      title: req.body.title,
      content: req.body.content,
      allowSharing: req.body.allowSharing
        ? req.body.allowSharing
        : document.allowSharing,
      whoCanAccess: req.body.whoCanAccess
        ? req.body.whoCanAccess
        : document.whoCanAccess,
    }
  );

  if (!document)
    return res
      .status(404)
      .send(`There is no document with id ${req.params.id}`);

  res.send(document);
});

router.delete("/:id", auth, async function handle(req, res) {
  const document = await Document.findByIdAndRemove(req.params.id);

  if (!document)
    return res
      .status(404)
      .send(`There is no document with id ${req.params.id}`);

  res.send(document);
});

module.exports = router;
