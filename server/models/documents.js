const mongoose = require("mongoose");
const Joi = require("joi");

function validateDocument(document) {
  return Joi.validate(document, {
    title: Joi.string().min(1).required(),
    content: Joi.string().min(0).required(),
    allowSharing: Joi.boolean().required(),
    whoCanAccess: Joi.array().required(),
  });
}

const Document = mongoose.model(
  "Document",
  new mongoose.Schema(
    {
      title: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50,
      },
      content: {
        type: String,
        required: true,
        minlength: 0,
      },
      created_at: {
        type: Date,
        required: true,
        default: Date.now(),
      },
      userId: {
        type: String,
        required: true,
      },
      allowSharing: {
        type: Boolean,
        required: true,
        default: false,
      },
      whoCanAccess: {
        type: Array,
        required: true,
        default: [],
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

module.exports.Document = Document;
module.exports.validate = validateDocument;
