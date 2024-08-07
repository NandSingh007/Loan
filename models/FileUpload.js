const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the schema
const FileUploadSchema = new Schema(
  {
    userId: {
      type: String, // Store as base64 encoded string
      required: false
    },
    profilePhotoUpload: {
      type: String, // Store as base64 encoded string
      required: false
    },
    adharcardFront: {
      type: String, // Store as base64 encoded string
      required: false
    },
    adharcardBack: {
      type: String, // Store as base64 encoded string
      required: false
    },
    pancardPhoto: {
      type: String, // Store as base64 encoded string
      required: false
    },
    adharcardNumber: {
      type: String,
      required: false
    },
    pancardNumber: {
      type: String,
      required: false
    },
    loanAmount: {
      type: Number,
      required: false
    },
    duration: {
      type: String,
      required: false
    },
    loanType: {
      type: String,
      required: false
    },
    capturedPhotoData: {
      type: String, // If you need to store base64 data
      required: false
    }
  },
  { timestamps: true }
); // Adds createdAt and updatedAt fields

// Create the model
const FileUpload = mongoose.model("FileUpload", FileUploadSchema);

module.exports = FileUpload;
