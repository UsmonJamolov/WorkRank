const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Post = require('./models/Post');

const DEMO_USERS = [
  {
    fullName: 'Azizbek',
    phone: '998901234567',
    password: '123456',
    role: 'employee',
    department: "Montaj bo'limi",
    position: 'Elektr montajchi',
    avatar: 'https://i.pravatar.cc/150?u=azizbek',
    points: 1200,
  },
  {
    fullName: 'Bekzod',
    phone: '998901234568',
    password: '123456',
    role: 'employee',
    department: "Montaj bo'limi",
    position: 'Elektr montajchi',
    avatar: 'https://i.pravatar.cc/150?u=bekzod',
    points: 980,
  },
  {
    fullName: 'Jamshid',
    phone: '998901234569',
    password: '123456',
    role: 'employee',
    department: 'Diagnostika',
    position: 'Diagnost',
    avatar: 'https://i.pravatar.cc/150?u=jamshid',
    points: 870,
  },
];

const DEMO_POSTS = [
  {
    title: '3-qavat elektr montaji yakunlandi',
    description: "Barcha kabel kanallari o'rnatildi va tekshiruvdan o'tkazildi.",
    imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800',
    likesCount: 15,
    dislikesCount: 2,
    commentsCount: 7,
  },
  {
    title: 'Material qabul qilish yakunlandi',
    description: 'Yangi kabel va avtomatlar omborga qabul qilindi.',
    imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800',
    likesCount: 22,
    dislikesCount: 0,
    commentsCount: 4,
  },
  {
    title: 'Diagnostika tekshiruvi',
    description: "2-qavat elektr tarmog'i to'liq diagnostika qilindi.",
    imageUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800',
    likesCount: 18,
    dislikesCount: 1,
    commentsCount: 5,
  },
];

async function seedDatabase() {
  const userCount = await User.countDocuments();
  if (userCount > 0) return;

  const hashedUsers = await Promise.all(
    DEMO_USERS.map(async (u) => ({
      ...u,
      password: await bcrypt.hash(u.password, 10),
    }))
  );

  const users = await User.insertMany(hashedUsers);

  const posts = DEMO_POSTS.map((p, i) => ({
    ...p,
    employeeId: users[i % users.length]._id,
    employeeName: users[i % users.length].fullName,
    employeeAvatar: users[i % users.length].avatar,
  }));

  await Post.insertMany(posts);
  console.log('Demo ma\'lumotlar workrank DB ga yuklandi');
}

module.exports = seedDatabase;
