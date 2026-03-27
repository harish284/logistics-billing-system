const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../db');

const registerUser = async (email, password, name) => {
  // Check if user exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error('User already exists');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
    },
  });

  return { id: user.id, email: user.email, name: user.name, role: user.role };
};

const loginUser = async (email, password) => {
  // Find user by email or name
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: email },
        { name: email }
      ]
    }
  });
  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Verify password
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    throw new Error('Invalid email or password');
  }

  // Generate token
  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '1d' }
  );

  return { token, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
};

module.exports = { registerUser, loginUser };
