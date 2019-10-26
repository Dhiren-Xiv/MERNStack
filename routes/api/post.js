const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const Posts = require('../../models/Posts');
const Profile = require('../../models/Profile');
const Users = require('../../models/Users');

// @rote    POST api/post
// @desc    Create a Post
// @access  Private
router.post("/", [auth, [
    check('text', 'Text is required.').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(404).json({ errors: errors.array() });
    }
    try {
        const user = await Users.findById(req.user.id).select('-password');
        const newPost = new Posts({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        });
        const post = await newPost.save();
        return res.status(200).json(post);
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Server Errors')
    }
});

// @rote    GET api/post
// @desc    Get all Post
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const posts = await Posts.find().sort({ date: -1 });
        res.json(posts)
    } catch (error) {
        console.error(error.message)
        res.status(500).send('server Errors');
    }
});

// @rote    GET api/post/:post_id
// @desc    Get Post by id.
// @access  Private
router.get('/:post_id', auth, async (req, res) => {
    try {
        const post = await Posts.findById(req.params.post_id);
        if (!post) res.status(404).json({ msg: "Post not found" });
        res.json(post)
    } catch (error) {
        console.error(error.message)
        if (error.kind === 'ObjectId') res.status(404).json({ msg: "Post not found" });
        res.status(500).send('server Errors');
    }
});

// @rote    DELETE api/post/:id
// @desc    Delete a Post by id
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const posts = await Posts.findById(req.params.id);
        if (!posts) res.status(404).json({ msg: "Post not found" });
        if (posts.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: "User not authorised." });
        }
        await posts.remove();
        res.json({ msg: "Post removed." });
    } catch (error) {
        console.error(error.message);
        if (error.kind === 'ObjectId') res.status(404).json({ msg: "Post not found" });
        res.status(500).send('server Errors');
    }
});

/**
 * Routes for Liking & Unlking a post 
**/
// @rote    PUT api/post/like/:id
// @desc    Add like to the posts
// @access  Private
router.put('/like/:id', auth, async (req, res) => {
    try {
        const post = await Posts.findById(req.params.id);
        if (!post) res.status(404).json({ msg: "Post not found" });
        console.log("post.likes => ", post.likes.filter(like => like.user.toString() == req.user.id).length > 0)
        if (post.likes.filter(like => like.user.toString() == req.user.id).length > 0) {
            return res.status(400).json({ msg: "Post already like" })
        }
        post.likes.unshift({ user: req.user.id });
        await post.save();
        return res.json(post.likes);
    } catch (error) {
        console.error(error.message);
        if (error.kind === 'ObjectId') res.status(404).json({ msg: "Post not found" });
        res.status(500).send('server Errors');
    }
});

// @rote    PUT api/post/unlike/:id
// @desc    Add like to the posts
// @access  Private
router.put('/unlike/:id', auth, async (req, res) => {
    try {
        const post = await Posts.findById(req.params.id);
        if (!post) res.status(404).json({ msg: "Post not found" });
        if (post.likes.filter(like => like.user.toString() == req.user.id).lenght == 0) {
            return res.status(400).json({ msg: "Post has not yet been liked" })
        }
        const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);
        post.likes.splice(removeIndex, 1);
        await post.save();
        return res.json(post.likes);
    } catch (error) {
        console.error(error.message);
        if (error.kind === 'ObjectId') res.status(404).json({ msg: "Post not found" });
        res.status(500).send('server Errors');
    }
});
/**
 * Routes to add and remove comments from Posts.
 **/
// @rote    POST api/post/comment/:id
// @desc    Add a Comment to a post.
// @access  Private
router.post("/comment/:id", [auth, [
    check('text', 'Text is required.').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(404).json({ errors: errors.array() });
    }
    try {
        const user = await Users.findById(req.user.id).select('-password');
        const post = await Posts.findById(req.params.id);
        const newComment = new Posts({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        });
        post.comments.unshift(newComment);
        await post.save();
        return res.status(200).json(post.comments);
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Server Errors')
    }
});
// @rote    DELETE api/post/comment/:id/:comment_id
// @desc    DElte Comment to a post.
// @access  Private
router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
    try {
        const post = await Posts.findById(req.params.id);
        const comment = post.comments.find(comment => comment.id === req.params.comment_id);
        if (!comment) {
            res.status(404).json({ msg: "Comment doesnot exists." });
        }
        if (comment.user.toString() !== req.user.id) {
            res.status(401).json({ msg: "User not authorised to delete the comment." })
        }
        const removeIndex = post.comments.map(comment => comment.user.toString()).indexOf(req.user.id);
        post.comments.splice(removeIndex, 1);
        await post.save();
        return res.json(post.comments);
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Server Errors')
    }
})

module.exports = router;