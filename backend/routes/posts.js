const express = require('express');
const Post = require('../models/Post');
const Dislike = require('../models/Dislike');
const Comment = require('../models/Comment');
const Like = require('../models/Like');

const router = express.Router();

function formatTime(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'hozir';
  if (diffMin < 60) return `${diffMin} daqiqa oldin`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH} soat oldin`;
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

router.get('/feed', async (req, res) => {
  try {
    const userId = req.query.userId;
    let dislikedIds = new Set();
    let likedIds = new Set();

    if (userId) {
      const [userDislikes, userLikes] = await Promise.all([
        Dislike.find({ userId }).select('postId'),
        Like.find({ userId }).select('postId'),
      ]);
      dislikedIds = new Set(userDislikes.map((d) => d.postId.toString()));
      likedIds = new Set(userLikes.map((l) => l.postId.toString()));
    }

    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(
      posts.map((p) => ({
        id: p._id.toString(),
        employeeId: p.employeeId.toString(),
        employeeName: p.employeeName,
        employeeAvatar: p.employeeAvatar,
        imageUrl: p.imageUrl,
        title: p.title,
        description: p.description,
        likesCount: p.likesCount,
        dislikesCount: p.dislikesCount,
        commentsCount: p.commentsCount,
        createdAt: p.createdAt,
        liked: likedIds.has(p._id.toString()),
        disliked: dislikedIds.has(p._id.toString()),
      }))
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/feedback', async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.query.userId;

    const [dislikes, comments] = await Promise.all([
      Dislike.find({ postId }).sort({ createdAt: -1 }),
      Comment.find({ postId }).sort({ createdAt: -1 }),
    ]);

    const items = [
      ...dislikes.map((d) => ({
        id: d._id.toString(),
        type: 'dislike',
        name: d.userName,
        avatar: d.userAvatar,
        text: d.comment,
        category: d.category,
        time: formatTime(d.createdAt),
        timeSort: new Date(d.createdAt).getTime(),
        userId: d.userId.toString(),
      })),
      ...comments.map((c) => ({
        id: c._id.toString(),
        type: 'comment',
        name: c.userName,
        avatar: c.userAvatar,
        text: c.text,
        category: null,
        time: formatTime(c.createdAt),
        timeSort: new Date(c.createdAt).getTime(),
        userId: c.userId.toString(),
      })),
    ].sort((a, b) => b.timeSort - a.timeSort);

    let userDisliked = false;
    if (userId) {
      userDisliked = !!(await Dislike.findOne({ postId, userId }));
    }

    res.json({ items, userDisliked });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/create', async (req, res) => {
  try {
    const { title, description, imageUrl, employeeId, employeeName, employeeAvatar } = req.body;
    const post = await Post.create({
      employeeId,
      employeeName,
      employeeAvatar,
      imageUrl,
      title,
      description,
    });
    res.status(201).json({
      id: post._id.toString(),
      employeeId: post.employeeId.toString(),
      employeeName: post.employeeName,
      employeeAvatar: post.employeeAvatar,
      imageUrl: post.imageUrl,
      title: post.title,
      description: post.description,
      likesCount: post.likesCount,
      dislikesCount: post.dislikesCount,
      commentsCount: post.commentsCount,
      createdAt: post.createdAt,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/like', async (req, res) => {
  try {
    const { userId, userName, userAvatar } = req.body;
    if (!userId) return res.status(400).json({ error: 'Foydalanuvchi aniqlanmadi' });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post topilmadi' });

    const existing = await Like.findOne({ postId: post._id, userId });
    if (existing) {
      return res.status(400).json({ error: 'Siz allaqachon tasdiqlagansiz' });
    }

    const removedDislike = await Dislike.findOneAndDelete({ postId: post._id, userId });
    if (removedDislike && post.dislikesCount > 0) {
      post.dislikesCount -= 1;
    }

    const like = await Like.create({
      postId: post._id,
      userId,
      userName,
      userAvatar,
    });

    post.likesCount += 1;
    await post.save();

    res.status(201).json({
      post: {
        id: post._id.toString(),
        likesCount: post.likesCount,
        dislikesCount: post.dislikesCount,
      },
      like: {
        id: like._id.toString(),
        userName: like.userName,
        userAvatar: like.userAvatar,
        createdAt: like.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/dislike', async (req, res) => {
  try {
    const { category, comment, userId, userName, userAvatar } = req.body;
    if (!comment?.trim()) return res.status(400).json({ error: 'Izoh majburiy' });
    if (!category) return res.status(400).json({ error: 'Kamchilik turi tanlanishi kerak' });
    if (!userId) return res.status(400).json({ error: 'Foydalanuvchi aniqlanmadi' });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post topilmadi' });

    const existing = await Dislike.findOne({ postId: post._id, userId });
    if (existing) {
      return res.status(400).json({ error: 'Siz allaqachon kamchilik qoldirgansiz' });
    }

    const dislike = await Dislike.create({
      postId: post._id,
      userId,
      userName,
      userAvatar,
      category,
      comment: comment.trim(),
    });

    post.dislikesCount += 1;
    await post.save();

    res.status(201).json({
      post: {
        id: post._id.toString(),
        likesCount: post.likesCount,
        dislikesCount: post.dislikesCount,
      },
      dislike: {
        id: dislike._id.toString(),
        category: dislike.category,
        comment: dislike.comment,
        userName: dislike.userName,
        userAvatar: dislike.userAvatar,
        createdAt: dislike.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/comment', async (req, res) => {
  try {
    const { text, userId, userName, userAvatar } = req.body;
    if (!text?.trim()) return res.status(400).json({ error: 'Izoh matni kerak' });
    if (!userId) return res.status(400).json({ error: 'Foydalanuvchi aniqlanmadi' });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post topilmadi' });

    const comment = await Comment.create({
      postId: post._id,
      userId,
      userName,
      userAvatar,
      text: text.trim(),
    });

    post.commentsCount += 1;
    await post.save();

    res.status(201).json({
      post: {
        id: post._id.toString(),
        commentsCount: post.commentsCount,
      },
      comment: {
        id: comment._id.toString(),
        text: comment.text,
        userName: comment.userName,
        userAvatar: comment.userAvatar,
        createdAt: comment.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
