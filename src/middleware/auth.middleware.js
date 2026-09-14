const jwt = require('jsonwebtoken');
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startWith('Bearer ')) {
    return res.status(401).json({ error: 'no token' });
  }
  const token = authHeader.split('')[1]; //to only keep the token and remove the bearer word
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  }
  catch (err) {
    return res.status(401).json({ error: 'invalid token' });
  }
}
module.exports = verifyToken;

}
