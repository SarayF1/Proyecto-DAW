import bcrypt from "bcrypt";
import { pool } from "../config/db.js";
import { generateToken } from "../config/jwt.js";

/**
 * REGISTRO DE USUARIO
 * - Crea usuario
 * - Crea monedero asociado
 * - Todo en una transacción
 */
export const register = async (req, res) => {
  const { Nombre, Apellido1, Apellido2, Email, Password } = req.body;

  // Validación mínima
  if (!Nombre || !Apellido1 || !Email || !Password) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  const conn = await pool.getConnection();

  try {
    // Comprobar si el usuario ya existe
    const [exist] = await conn.query(
      "SELECT idUsuario FROM Usuarios WHERE Email = ?",
      [Email]
    );

    if (exist.length > 0) {
      return res.status(409).json({ error: "El usuario ya existe" });
    }

    // Hashear contraseña
    const hash = await bcrypt.hash(Password, 10);

    await conn.beginTransaction();

    // Insertar usuario
    const [result] = await conn.query(
      `INSERT INTO Usuarios 
       (Nombre, Apellido1, Apellido2, Rol, Email, Contraseña)
       VALUES (?, ?, ?, 'CLIENTE', ?, ?)`,
      [Nombre, Apellido1, Apellido2 || null, Email, hash]
    );

    const idUsuario = result.insertId;

    // Crear monedero automáticamente
    await conn.query(
      `INSERT INTO Monedero (id_Usuario, saldo, moneda)
       VALUES (?, 0.00, 'EUR')`,
      [idUsuario]
    );

    await conn.commit();

    res.status(201).json({ message: "Usuario creado correctamente" });
  } catch (error) {
    await conn.rollback();
    console.error("Error en register:", error);
    res.status(500).json({ error: "Error al crear el usuario" });
  } finally {
    conn.release();
  }
};

/**
 * LOGIN
 * - Verifica credenciales
 * - Devuelve JWT
 */
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
    console.error("Error en login:", error);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
};
