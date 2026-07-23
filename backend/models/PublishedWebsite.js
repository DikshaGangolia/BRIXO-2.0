const mongoose = require("mongoose");

const publishedWebsiteSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    url: {
      type: String,
    },
    qrCodeDataUrl: {
      type: String,
    },
    qrCodeSvg: {
      type: String,
    },
    status: {
      type: String,
      enum: ["PUBLISHED", "UNPUBLISHED"],
      default: "PUBLISHED",
    },
    data: {
      type: Object,
      required: true,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("PublishedWebsite", publishedWebsiteSchema);
