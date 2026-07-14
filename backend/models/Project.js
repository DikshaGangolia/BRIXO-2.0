const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    data: {
      type: Object,
      required: true,
    },

    published: {
      type: Boolean,
      default: false,
    },
    slug: {
  type: String,
  unique: true,
  sparse: true,
},
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Project", projectSchema);