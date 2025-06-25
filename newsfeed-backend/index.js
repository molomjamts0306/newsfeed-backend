const multer = require('multer');
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Post = require('./models/Post');
const fs = require('fs');

const app = express();
const uploadDir = './uploads';

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Upload image route
app.post('/upload-image', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ imageUrl });
});

// MongoDB connection
mongoose.connect('mongodb+srv://molomjamts21:J4VXy7UgjrX32wlb@railway0.po6cf4z.mongodb.net/?retryWrites=true&w=majority&appName=railway0', {
    dbName: 'newswebsite',
});

// Get all posts
app.get('/posts', async (req, res) => {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
});

// Get single post
app.get('/posts/:id', async (req, res) => {
    const post = await Post.findById(req.params.id);
    res.json(post);
});

// Admin-only post creation
// app.post('/admin/posts', upload.single('image'), async (req, res) => {
//     try {
//         const { title, content } = req.body;
//         const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
//
//         const post = new Post({ title, content, imageUrl });
//         await post.save();
//         res.status(201).json(post);
//     } catch (err) {
//         res.status(500).json({ error: 'Failed to create post with image' });
//     }
// });

// Public post creation (no auth required)
app.post('/posts', upload.single('image'), async (req, res) => {
    try {
        const { title, content } = req.body;
        const imageUrl = req.file
            ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
            : null;

        const post = new Post({ title, content, imageUrl });
        await post.save();
        res.status(201).json(post);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create post' });
    }
});

// Start server
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`✅ Backend running on http://localhost:${port}`);
});
