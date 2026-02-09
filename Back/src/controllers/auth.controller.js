import bcrypt from "bcrypt";
import { pool } from "../config/db.js";
import { generateToken } from "../config/jwt.js";

export const register = async (req, res) => {
  const { Nombre, Apellido1, Apellido2, Email, Password } = req.body;

  // Validación mínima
  if (!Nombre || !Apellido1 || !Email || !Password) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  try {
    // Comprobar si el usuario ya existe
    const [exist] = await pool.query(
      "SELECT idUsuario FROM Usuarios WHERE Email = ?",
      [Email]
    );

    if (exist.length > 0) {
      return res.status(409).json({ error: "El usuario ya existe" });
    }

    // Hashear contraseña
    const hash = await bcrypt.hash(Password, 10);

    // Insertar usuario
    await pool.query(
      `INSERT INTO Usuarios 
       (Nombre, Apellido1, Apellido2, Rol, Email, Contraseña)
       VALUES (?, ?, ?, 'CLIENTE', ?, ?)`,
      [Nombre, Apellido1, Apellido2 || null, Email, hash]
    );

    res.status(201).json({ message: "Usuario creado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear el usuario" });
  }
};

export const login = async (req, res) => {
  const { Email, Password } = req.body;

  if (!Email || !Password) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  try {
    const [rows] = await pool.query(
      "SELECT * FROM Usuarios WHERE Email = ?",
      [Email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const user = rows[0];

    const passwordOk = await bcrypt.compare(Password, user.Contraseña);

    if (!passwordOk) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const token = generateToken({
      idUsuario: user.idUsuario,
      rol: user.Rol,
    });

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
};
