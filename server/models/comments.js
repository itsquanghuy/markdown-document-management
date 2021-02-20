const mongoose = require("mongoose");
const Joi = require("joi");

function validateComment(comment) {
  return Joi.validate(comment, {
    content: Joi.string().min(1).required(),
    user: Joi.object()
      .keys({
        _id: Joi.objectId().required(),
        name: Joi.string().min(2).max(50).required(),
        email: Joi.string().min(5).max(255).required().email(),
      })
      .required(),
  });
}

const Comment = mongoose.model(
  "Comment",
  new mongoose.Schema(
    {
      documentId: {
        type: String,
        required: true,
      },
      content: {
        type: String,
        required: true,
        minlength: 1,
      },
      user: {
        type: Object,
        required: true,
      },
    },
    {
      writeConcern: {
        w: "majority",
        j: true,
        wtimeout: 1000,
      },
    }
  )
);

module.exports.Comment = Comment;
module.exports.validate = validateComment;
