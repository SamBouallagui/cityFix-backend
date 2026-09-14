//middleware function with factory patern to check any role
function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ error: 'you dont have permission' })
    }
    next();
  };
}

module.exports = requireRole;
