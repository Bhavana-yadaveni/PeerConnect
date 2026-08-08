const express = require("express");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// GET /api/posts?tag=react&type=study-group  -> list posts, newest first, optional filters
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { tag, type, search } = req.query;
    const filter = {};

    if (tag) filter.tags = tag.toLowerCase();
    if (type) filter.type = type;
    if (search) filter.title = { $regex: search, $options: "i" };

    const posts = await Post.find(filter)
      .populate("author", "name email course year")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong fetching posts." });
  }
});

// GET /api/posts/:id -> single post with its comments
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("author", "name email course year");
    if (!post) return res.status(404).json({ message: "Post not found." });

    const comments = await Comment.find({ post: post._id })
      .populate("author", "name")
      .sort({ createdAt: 1 });

    res.json({ post, comments });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong fetching the post." });
  }
});

// POST /api/posts -> create a new post
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, description, type, tags } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required." });
    }

    const post = await Post.create({
      author: req.userId,
      title,
      description,
      type: type || "study-group",
      tags: Array.isArray(tags)
        ? tags.map((t) => t.toLowerCase().trim())
        : [],
    });

    const populated = await post.populate("author", "name email course year");
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong creating the post." });
  }
});

// PUT /api/posts/:id -> edit a post (author only)
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found." });
    if (post.author.toString() !== req.userId) {
      return res.status(403).json({ message: "You can only edit your own posts." });
    }

    const { title, description, type, tags } = req.body;
    if (title !== undefined) post.title = title;
    if (description !== undefined) post.description = description;
    if (type !== undefined) post.type = type;
    if (tags !== undefined) post.tags = tags.map((t) => t.toLowerCase().trim());

    await post.save();
    const populated = await post.populate("author", "name email course year");
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong updating the post." });
  }
});

// DELETE /api/posts/:id -> delete a post (author only)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found." });
    if (post.author.toString() !== req.userId) {
      return res.status(403).json({ message: "You can only delete your own posts." });
    }

    await post.deleteOne();
    await Comment.deleteMany({ post: post._id });

    res.json({ message: "Post deleted." });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong deleting the post." });
  }
});

// POST /api/posts/:id/like -> toggle like on a post
router.post("/:id/like", authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found." });

    const alreadyLiked = post.likes.some((id) => id.toString() === req.userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== req.userId);
    } else {
      post.likes.push(req.userId);
    }

    await post.save();
    res.json({ likesCount: post.likes.length, liked: !alreadyLiked });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong." });
  }
});

// POST /api/posts/:id/comments -> add a comment to a post
router.post("/:id/comments", authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Comment text is required." });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found." });

    const comment = await Comment.create({
      post: post._id,
      author: req.userId,
      text,
    });

    const populated = await comment.populate("author", "name");
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong adding the comment." });
  }
});

module.exports = router;
