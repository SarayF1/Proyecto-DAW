# Backend additions required for new features

This file documents the new backend endpoints that need to be added to
the Express server to support the new frontend features.

## 1. Google OAuth login

Add to `src/routes/auth.routes.js`:
```js
router.post('/google', googleLogin)
```

Add to `src/controllers/auth.controller.js`:
```js
import { OAuth2Client } from 'google-auth-library'
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID

export const googleLogin = async (req, res) => {
  const { credential } = req.body
  try {
    const client = new OAuth2Client(GOOGLE_CLIENT_ID)
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    })
    const { email, given_name, family_name } = ticket.getPayload()

    // Find or create user
    let [users] = await pool.query('SELECT * FROM Usuarios WHERE Email = ?', [email])
    let isNew = false

    if (users.length === 0) {
      const hash = await bcrypt.hash(Math.random().toString(36), 10)
      const [result] = await pool.query(
        `INSERT INTO Usuarios (Nombre, Apellido1, Rol, Email, Contraseña) VALUES (?, ?, 'CLIENTE', ?, ?)`,
        [given_name, family_name || '', email, hash]
      )
      await pool.query('INSERT INTO Monedero (id_Usuario, saldo, moneda) VALUES (?, 0, "EUR")', [result.insertId])
      const [newUsers] = await pool.query('SELECT * FROM Usuarios WHERE idUsuario = ?', [result.insertId])
      users = newUsers
      isNew = true
    }

    const token = generateToken({ idUsuario: users[0].idUsuario, rol: users[0].Rol })
    res.json({ token, isNew })
  } catch (err) {
    res.status(401).json({ error: 'Token de Google inválido' })
  }
}
```

Install: `npm install google-auth-library`

Add to `.env`: `GOOGLE_CLIENT_ID=798420012132-75ftcllpv2hje8lokrmhmgp85i58o760.apps.googleusercontent.com`

---

## 2. Admin: Users CRUD

Add to `src/routes/admin.routes.js`:
```js
router.get('/usuarios', getUsuarios)
router.put('/usuarios/:id', updateUsuario)
router.delete('/usuarios/:id', deleteUsuario)
```

Add to `src/controllers/admin.controller.js`:
```js
export const getUsuarios = async (req, res) => {
  const [rows] = await pool.query(
    'SELECT idUsuario, Nombre, Apellido1, Apellido2, Email, Rol FROM Usuarios ORDER BY idUsuario'
  )
  res.json(rows)
}

export const updateUsuario = async (req, res) => {
  const { id } = req.params
  const { Nombre, Apellido1, Apellido2, Email, Rol } = req.body
  await pool.query(
    'UPDATE Usuarios SET Nombre=?, Apellido1=?, Apellido2=?, Email=?, Rol=? WHERE idUsuario=?',
    [Nombre, Apellido1, Apellido2, Email, Rol, id]
  )
  res.json({ message: 'Usuario actualizado' })
}

export const deleteUsuario = async (req, res) => {
  const { id } = req.params
  const [[user]] = await pool.query('SELECT Rol FROM Usuarios WHERE idUsuario=?', [id])
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' })
  if (user.Rol === 'ADMIN') return res.status(403).json({ error: 'No se puede eliminar un admin' })
  await pool.query('DELETE FROM Usuarios WHERE idUsuario=?', [id])
  res.json({ message: 'Usuario eliminado' })
}
```

---

## 3. Admin: Plazas update

Add to `src/routes/admin.routes.js`:
```js
router.get('/plazas', getPlazasAdmin)
router.put('/plazas/:id', updatePlazaAdmin)
```

Add to `src/controllers/admin.controller.js`:
```js
export const getPlazasAdmin = async (req, res) => {
  const [rows] = await pool.query(`
    SELECT p.idPlaza, p.Estado_Plaza, z.nombre AS zona, z.Localidad, z.Tarifa
    FROM Plaza p JOIN Zona z ON p.id_Zona = z.idZona ORDER BY p.idPlaza
  `)
  res.json(rows)
}

export const updatePlazaAdmin = async (req, res) => {
  const { id } = req.params
  const { Estado_Plaza } = req.body
  await pool.query('UPDATE Plaza SET Estado_Plaza=? WHERE idPlaza=?', [Estado_Plaza, id])
  res.json({ message: 'Plaza actualizada' })
}
```

---

## 4. Admin: All Reservas

Add to `src/routes/admin.routes.js`:
```js
router.get('/reservas', getAllReservas)
router.delete('/reservas/:id', deleteReserva)
```

Add to `src/controllers/admin.controller.js`:
```js
export const getAllReservas = async (req, res) => {
  const [rows] = await pool.query(`
    SELECT r.idReserva, r.Estado, r.Fecha_inicio, r.Fecha_fin,
           u.Nombre, u.Apellido1, p.idPlaza, z.nombre AS Zona
    FROM Reserva r
    JOIN Usuarios u ON r.id_Usuario = u.idUsuario
    JOIN Plaza p ON r.id_Plaza = p.idPlaza
    JOIN Zona z ON p.id_Zona = z.idZona
    ORDER BY r.Fecha_inicio DESC LIMIT 200
  `)
  res.json(rows)
}

export const deleteReserva = async (req, res) => {
  const { id } = req.params
  await pool.query('DELETE FROM Reserva WHERE idReserva=?', [id])
  res.json({ message: 'Reserva eliminada' })
}
```

---

## 5. CORS update (app.js)

Add `http://localhost:5173` to the allowed origins array (already done in existing backend).

## 6. Stripe backend (for production)

For production Stripe integration, add a payment intent endpoint:
```js
router.post('/me/monedero/stripe-intent', authMiddleware, async (req, res) => {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
  const { cantidad } = req.body
  const intent = await stripe.paymentIntents.create({
    amount: Math.round(cantidad * 100), // cents
    currency: 'eur',
    metadata: { idUsuario: req.user.idUsuario }
  })
  res.json({ clientSecret: intent.client_secret })
})
```
