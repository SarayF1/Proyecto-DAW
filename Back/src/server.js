import "dotenv/config";
import app from "./app.js";

const PORT = process.env.PORT || 3001;

console.log("DB_NAME =", process.env.DB_NAME);

app.listen(PORT, () => {
  console.log(`Backend activo en puerto ${PORT}`);
});