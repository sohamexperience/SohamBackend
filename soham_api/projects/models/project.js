const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  enable: { type: Boolean, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  users: [
    {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String }, // Address is optional
    },
  ],
  events: [
    {
      name: { type: String, required: true },
      date: { type: Date, required: true },
      description: { type: String },
      users: [
        {
          name: { type: String, required: true },
          email: { type: String, required: true },
          phone: { type: String, required: true },
          address: { type: String }, // Address is optional
          attendance: { type: Boolean, default: false }, // Attendance field
        },
      ],
    },
  ],
});

const Project = mongoose.model("Projects", projectSchema);

module.exports = Project;
