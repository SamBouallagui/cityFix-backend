const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    //fields check
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    //checks if the email exist before hashing
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }
    //hashing the password using salt and 10 rounds
    const hashedPassword = await bcrypt.hash(password, 10);
    //hard code the role to citizen for registering new users and manually create agent users in DB because they have admin rights
    const newUser = await User.create({
          name, email, password: hashedPassword,
          role: 'citizen'
        });
    //returns the created users info
    return res.status(201).json({
      id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
      });
  } catch (err) {
    console.log('Register error:', err);
    return res.status(500).json({ message: 'error' });
  }
}
//login function to verify credentials and create JWT if corect
async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and pass required' });
    }
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    //check if the hash of the user is the same one registered in the db
    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ error: 'invalid email or password' });
    }
    //creates JWt
    const token = jwt.sign({ id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    return res.status(200).json({
      token, user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'something went wrong' });
  }
}

module.exports = {
  register,
  login,
};
