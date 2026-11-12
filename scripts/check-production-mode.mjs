if (process.env.TELECOMAI_FIXTURES === "1") {
  throw new Error("Use npm run build:fixtures to isolate fixture output. Standard builds use the active src/data records.");
}
