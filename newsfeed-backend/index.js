const multer = require('multer');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Post = require('./models/Post');
const axios = require('axios');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Multer setup to store image in memory (no disk)
const upload = multer({ storage: multer.memoryStorage() });

// ImgBB upload route
app.post('/upload-image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        // Convert buffer to base64 string
        const base64Image = req.file.buffer.toString('base64');

        // ImgBB API endpoint with your API key from env
        const imgbbApi = `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`;

        // POST to ImgBB with base64 image
        const response = await axios.post(imgbbApi, {
            image: base64Image,
            name: `upload_${Date.now()}`
        });

        const imageUrl = response.data.data.url;
        res.json({ imageUrl });
    } catch (err) {
        console.error('ImgBB upload error:', err.response?.data || err.message);
        res.status(500).json({ error: 'Failed to upload image to ImgBB' });
    }
});

// Public post creation (no auth required)
app.post('/posts', upload.single('image'), async (req, res) => {
    try {
        const { title, content } = req.body;
        let imageUrl = null;

        if (req.file) {
            // Upload image to ImgBB (same code as above)
            const base64Image = req.file.buffer.toString('base64');
            const imgbbApi = `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`;
            const response = await axios.post(imgbbApi, {
                image: base64Image,
                name: `upload_${Date.now()}`
            });
            imageUrl = response.data.data.url;
        }

        const post = new Post({ title, content, imageUrl });
        await post.save();

        res.status(201).json(post);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create post' });
    }
});

// Get all posts
app.get('/posts', async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

// Get single post
app.get('/posts/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch post' });
    }
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'newswebsite',
}).then(() => {
    console.log('✅ Connected to MongoDB');
}).catch(err => {
    console.error('❌ MongoDB connection error:', err);
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`✅ Backend running on http://localhost:${port}`);
});
