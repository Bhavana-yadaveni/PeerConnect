const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["student", "mentor"], default: "student" },
    course: { type: String, default: "" },
    year: { type: String, default: "" },
    bio: { type: String, default: "" },
    skills: [{ type: String }],
    interests: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
