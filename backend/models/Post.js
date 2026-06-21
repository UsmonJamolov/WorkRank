const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    employeeName: String,
    employeeAvatar: String,
    title: { type: String, required: true },
    description: String,
    imageUrl: String,
    likesCount: { type: Number, default: 0 },
    dislikesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', postSchema);
