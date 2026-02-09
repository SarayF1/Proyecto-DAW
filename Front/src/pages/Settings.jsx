import { useState, useEffect } from "react";
import {
    Typography,
    Button,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Alert,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";

const USER_KEY = "user";

export default function Settings() {
    const { logout } = useAuth();

    /* ---------- States ---------- */
    const [user, setUser] = useState({ name: "", email: "", password: "" });
    const [openProfile, setOpenProfile] = useState(false);
    const [openSecurity, setOpenSecurity] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [msg, setMsg] = useState("");

    /* ---------- Load user ---------- */
    useEffect(() => {
        const stored = localStorage.getItem(USER_KEY);
        if (stored) setUser(JSON.parse(stored));
    }, []);

    /* ---------- Save profile ---------- */
    const handleSaveProfile = () => {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        setOpenProfile(false);
        setMsg("Perfil actualizado correctamente ✅");
        setTimeout(() => setMsg(""), 3000);
    };

    /* ---------- Change password ---------- */
    const handleChangePassword = () => {
        if (!newPassword) return;
        const updatedUser = { ...user, password: newPassword };
        localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
        setUser(updatedUser);
        setNewPassword("");
        setOpenSecurity(false);
        setMsg("Contraseña cambiada correctamente ✅");
        setTimeout(() => setMsg(""), 3000);
    };

    return (
        <>
            <Typography variant="h4" mb={2}>
                Configuración
            </Typography>

            {msg && <Alert severity="success">{msg}</Alert>}

            <Stack spacing={2} mt={2}>
                {/* Edit Profile */}
                <Button variant="outlined" onClick={() => setOpenProfile(true)}>
                    Editar perfil
                </Button>

                {/* Security */}
                <Button variant="outlined" onClick={() => setOpenSecurity(true)}>
                    Seguridad
                </Button>

                {/* Logout */}
                <Button color="error" variant="contained" onClick={logout}>
                    Cerrar sesión
                </Button>
            </Stack>

            {/* ---------- Profile Dialog ---------- */}
            <Dialog open={openProfile} onClose={() => setOpenProfile(false)}>
                <DialogTitle>Editar perfil</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} mt={1}>
                        <TextField
                            label="Nombre"
                            fullWidth
                            value={user.name}
                            onChange={(e) => setUser({ ...user, name: e.target.value })}
                        />
                        <TextField
                            label="Email"
                            fullWidth
                            value={user.email}
                            onChange={(e) => setUser({ ...user, email: e.target.value })}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenProfile(false)}>Cancelar</Button>
                    <Button variant="contained" onClick={handleSaveProfile}>
                        Guardar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ---------- Security Dialog ---------- */}
            <Dialog open={openSecurity} onClose={() => setOpenSecurity(false)}>
                <DialogTitle>Cambiar contraseña</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} mt={1}>
                        <TextField
                            label="Nueva contraseña"
                            type="password"
                            fullWidth
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenSecurity(false)}>Cancelar</Button>
                    <Button variant="contained" onClick={handleChangePassword}>
                        Cambiar
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
