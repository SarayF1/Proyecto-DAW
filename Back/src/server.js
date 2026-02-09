import "dotenv/config";
import app from "./app.js";

app.listen(process.env.PORT, () => {
  console.log(`Backend activo en puerto ${process.env.PORT}`);
});
