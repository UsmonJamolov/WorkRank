const express = require('express');
const router = express.Router();

let posts = [
  {
    id: '1',
    employeeId: '1',
    employeeName: 'Azizbek',
    employeeAvatar: 'https://i.pravatar.cc/150?u=azizbek',
    imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800',
    title: '3-qavat elektr montaji yakunlandi',
    description: 'Barcha kabel kanallari o\'rnatildi.',
    likesCount: 15,
    dislikesCount: 2,
    commentsCount: 7,
    createdAt: new Date().toISOString(),
  },
];

router.get('/feed', (_req, res) => {
  res.json(posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

router.post('/create', (req, res) => {
  const { title, description, imageUrl, employeeId, employeeName, employeeAvatar } = req.body;
  const post = {
    id: Date.now().toString(),
    employeeId: employeeId || '1',
    employeeName: employeeName || 'Azizbek',
    employeeAvatar: employeeAvatar || 'https://i.pravatar.cc/150?u=azizbek',
    imageUrl,
    title,
    description,
    likesCount: 0,
    dislikesCount: 0,
    commentsCount: 0,
    createdAt: new Date().toISOString(),
  };
  posts.unshift(post);
  res.status(201).json(post);
});

router.post('/:id/like', (req, res) => {
  const post = posts.find((p) => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: 'Post topilmadi' });
  post.likesCount++;
  res.json(post);
});

router.post('/:id/dislike', (req, res) => {
  const post = posts.find((p) => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: 'Post topilmadi' });
  const { category, comment } = req.body;
  if (!comment) return res.status(400).json({ error: 'Izoh majburiy' });
  post.dislikesCount++;
  res.json({ post, dislike: { category, comment } });
});

router.post('/:id/comment', (req, res) => {
  const post = posts.find((p) => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: 'Post topilmadi' });
  post.commentsCount++;
  res.json({ post, comment: req.body });
});

module.exports = router;
