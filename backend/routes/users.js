const express = require('express');
const router = express.Router();
const { dbHelpers } = require('../config/database');
const bcrypt = require('bcryptjs');

router.get('/', async (req, res) => {
  try {
    const users = await dbHelpers.getAllUsers();
    
    res.json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users',
      message: error.message
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await dbHelpers.getUserById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user',
      message: error.message
    });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      });
    }
    
    const existingUser = await dbHelpers.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }
    
    const newUser = await dbHelpers.createUser(name, email, password);
    
    res.status(201).json({
      success: true,
      data: newUser,
      message: 'User created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create user',
      message: error.message
    });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Name and email are required'
      });
    }
    
    const existingUser = await dbHelpers.getUserById(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    const userWithEmail = await dbHelpers.getUserByEmail(email);
    if (userWithEmail && userWithEmail.id !== parseInt(id)) {
      return res.status(400).json({
        success: false,
        error: 'Email is already taken by another user'
      });
    }
    
    const updatedUser = await dbHelpers.updateUser(id, name, email);
    
    res.json({
      success: true,
      data: updatedUser,
      message: 'User updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update user',
      message: error.message
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingUser = await dbHelpers.getUserById(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    const result = await dbHelpers.deleteUser(id);
    
    res.json({
      success: true,
      message: `User with ID ${id} deleted successfully`,
      deletedRows: result.deletedRows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete user',
      message: error.message
    });
  }
});

router.post('/:id/start-session', async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingUser = await dbHelpers.getUserById(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    const updatedUser = await dbHelpers.startSession(id);
    
    res.json({
      success: true,
      data: updatedUser,
      message: 'User session started successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to start user session',
      message: error.message
    });
  }
});

router.post('/:id/end-session', async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingUser = await dbHelpers.getUserById(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    const updatedUser = await dbHelpers.endSession(id);
    
    res.json({
      success: true,
      data: updatedUser,
      message: 'User session ended successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to end user session',
      message: error.message
    });
  }
});

module.exports = router;
