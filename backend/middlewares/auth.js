const jwt = require('jsonwebtoken');
const User = require('../models/users');

const protect = async (req, res, next) => {
  try {
    let token;


    if (req.headers['token']) {
      token = req.headers['token'];
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ 
          success: false,
          message: 'Not authorized, user not found'
        });
      }

      return next();
    }

    // If no token found
    return res.status(401).json({ 
      success: false,
      message: 'Not authorized, no token provided'
    });

  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized, invalid token'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized, token expired'
      });
    }

    return res.status(500).json({ 
      success: false,
      message: 'Server error during authentication'
    });
  }
};

module.exports = { protect };