const { DatabaseSync } = require('node:sqlite');
try {
  const db = new DatabaseSync(':memory:');
  db.exec(`
    CREATE TABLE data(
      key INTEGER PRIMARY KEY,
      val TEXT
    )
  `);
  console.log("SUCCESS");
} catch (e) {
  console.error("FAIL:", e);
}
