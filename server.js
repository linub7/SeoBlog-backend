const express = require('express');
const csrf = require('csurf');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const csrfProtection = csrf({ cookie: true });

// routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const categoryRoutes = require('./routes/category');
const tagRoutes = require('./routes/tag');
const blogRoutes = require('./routes/blog');
const formRoutes = require('./routes/form');

// app
const app = express();

// cors
if (process.env.NODE_ENV === 'development') {
  app.use(cors({ origin: `${process.env.CLIENT_URL}` }));
}

// database
mongoose
  .connect(process.env.DATABASE)
  .then(() => console.log('DB Connected'))
  .catch((err) => console.log(err));

// middleware
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// routes middleware
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', categoryRoutes);
app.use('/api', tagRoutes);
app.use('/api', blogRoutes);
app.use('/api', formRoutes);

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`Server is running on PORT=${port}`);
});
