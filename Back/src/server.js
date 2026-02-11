import "dotenv/config";
import app from "./app.js";

console.log("DB_NAME =", process.env.DB_NAME);

app.listen(process.env.PORT, () => {
  console.log(`Backend activo en puerto ${process.env.PORT}`);
});
