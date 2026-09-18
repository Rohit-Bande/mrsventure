import { scryptSync, pbkdf2Sync, timingSafeEqual, randomBytes, createHash } from 'node:crypto';
export const digest = value => createHash('sha256').update(value).digest('hex');
export function equal(a,b) {const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length && timingSafeEqual(x,y);}
export function verifyPassword(password,hash) {
  try {
    const parts=hash.split('$');
    if(parts[0]==='scrypt' && parts.length===3) return equal(scryptSync(password,parts[1],64),Buffer.from(parts[2],'hex'));
    if(parts[0]==='pbkdf2_sha256' && parts.length===4) {
      const iterations=Number(parts[1]); if(!Number.isInteger(iterations)||iterations<10000||iterations>1000000)return false;
      return equal(pbkdf2Sync(password,Buffer.from(parts[2],'base64url'),iterations,32,'sha256'),Buffer.from(parts[3],'base64url'));
    }
  } catch {} return false;
}
export function createSession(store) {
  const token=randomBytes(32).toString('hex'), expires_at=Date.now()+8*60*60*1000;
  store.insert('sessions',digest(token),{expires_at});return {token,expires_at};
}
export function authenticated(store,token) {
  if(typeof token!=='string')return false;
  const key=digest(token),session=store.get('sessions',key);
  if(!session)return false;
  if(session.expires_at<=Date.now()){store.remove('sessions',key);return false;}return true;
}
