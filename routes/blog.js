const express = require('express');
const router = express.Router();
const {
  requireSignin,
  adminMiddleware,
  authMiddleware,
  canUpdateDeleteBlog,
} = require('../controllers/auth');
const {
  createBlog,
  list,
  read,
  updateBlog,
  removeBlog,
  listAllBlogsCategoriesTags,
  photo,
  listRelatedBlogs,
  listSearch,
  listByUser,
} = require('../controllers/blog');

router.post('/blog', requireSignin, adminMiddleware, createBlog);

router.get('/blogs', list);
router.post('/blogs-categories-tags', listAllBlogsCategoriesTags);
router.get('/blog/:slug', read);
router.put('/blog/:slug', requireSignin, adminMiddleware, updateBlog);
router.delete('/blog/:slug', requireSignin, adminMiddleware, removeBlog);
router.get('/blog/photo/:slug', photo);
router.post('/blogs/related', listRelatedBlogs);
router.get('/blogs/search', listSearch);

// auth user blog crud
router.post('/user/blog', requireSignin, authMiddleware, createBlog);
router.get('/:username/blogs', listByUser);
router.put(
  '/user/blog/:slug',
  requireSignin,
  authMiddleware,
  canUpdateDeleteBlog,
  updateBlog
);
router.delete(
  '/user/blog/:slug',
  requireSignin,
  authMiddleware,
  canUpdateDeleteBlog,
  removeBlog
);

module.exports = router;
