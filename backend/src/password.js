import { randomBytes, scryptSync } from 'node:crypto';
import { createInterface } from 'node:readline/promises';
const rl = createInterface({input: process.stdin, output: process.stdout});
console.log('Use a private terminal: password input is visible.');
const password = await rl.question('New admin password (at least 12 characters): '); rl.close();
if(password.length < 12) { console.error('Password is too short'); process.exit(1); }
const salt = randomBytes(16).toString('hex');
console.log(`ADMIN_PASSWORD_HASH=scrypt$${salt}$${scryptSync(password,salt,64).toString('hex')}`);
