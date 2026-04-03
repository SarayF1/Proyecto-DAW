// src/middlewares/admin.middleware.js
export const isAdmin = (req, res, next) => {
  // El middleware auth ya decodificó el token y lo puso en req.user
  if (!req.user) {
    return res.status(401).json({ error: "No autenticado" });
  }

  if (req.user.rol !== "ADMIN") {
    return res.status(403).json({ error: "Acceso denegado. Solo administradores." });
  }

  next();
};
