// middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
// middleware/authorize.js
const User = require('./models/userModel');
const Category = require('./models/categoryModel');


// Middleware to protect routes
const protect = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, 'JWT_SECRET');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Middleware for admin access
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied, Only admin can access' });
  }
  next();
};



const protectt = async (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Set the user to request object
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};



const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, 'JWT_SECRET');  
    const user = await User.findOne({ _id: decoded._id });

    if (!user) {
      throw new Error('User not found');
    }

    // Check if the user is an admin
    if (user.role !== 'admin') {
      return res.status(403).send({ error: 'Access denied. Admins only.' });
    }

    req.user = user;  // Attach the user to the request for further use
    next();  // Proceed to the next middleware/route handler
  } catch (e) {
    res.status(401).send({ error: 'Please authenticate as admin.' });
  }
};



module.exports = { protect, isAdmin, protectt, adminAuth};
