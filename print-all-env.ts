for (const key of Object.keys(process.env)) {
  if (key.match(/database|sql|port|api|better|vite|google|auth|user|pass|secret|host/i)) {
    console.log(`${key}: ${process.env[key] ? 'PRESENT' : 'EMPTY'}`);
  }
}
