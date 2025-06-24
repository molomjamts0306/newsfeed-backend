const multer = require('multer');
const path = require('path');
    const express = require('express');
    const mongoose = require('mongoose');
    const cors = require('cors');
    const Post = require('./models/Post');
    
    const app = express();
    app.use(cors());
    app.use(express.json());

    const fs = require('fs');
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      // Append timestamp to avoid collisions
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });
  
  const upload = multer({ storage: storage });
  
  // Serve files from uploads folder statically
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
  
  // Your existing JSON middleware
  app.use(express.json());
  
  // POST /upload-image endpoint to upload image files
  app.post('/upload-image', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  
    // Return the URL where image can be accessed
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ imageUrl });
  });
    
    // Connect to MongoDB Atlas
    mongoose.connect('mongodb+srv://molomjamts21:J4VXy7UgjrX32wlb@railway0.po6cf4z.mongodb.net/?retryWrites=true&w=majority&appName=railway0', {
      dbName: 'newswebsite',
    });
    
    // Get all posts
    app.get('/posts', async (req, res) => {
      const posts = await Post.find().sort({ createdAt: -1 });
      res.json(posts);
    });
    
    // Get one post
    app.get('/posts/:id', async (req, res) => {
      const post = await Post.findById(req.params.id);
      res.json(post);
    });
    
    // Admin can create post
    app.post('/posts', async (req, res) => {
      const { title, content, token, imageUrl } = req.body;
    
      if (token !== 'admin123') {
        return res.status(401).json({ message: 'Unauthorized' });
      }
    
      const post = new Post({ title, content, imageUrl });
      await post.save();
      res.json(post);
    });
    
    app.listen(5000, () => {
      console.log('✅ Backend running on http://localhost:5000');
    });
    