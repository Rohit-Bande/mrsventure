const {spawn}=require('node:child_process');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const command=process.platform==='win32'?'npm.cmd':'npm';
function run(folder,args){return new Promise((resolve,reject)=>{const p=spawn(command,args,{cwd:path.join(root,folder),stdio:'inherit',shell:process.platform==='win32'});p.on('error',reject);p.on('exit',code=>code===0?resolve():reject(new Error(`${folder} exited with ${code}`)));});}
async function main(){const mode=process.argv[2];
 if(mode==='setup'){await run('backend',['ci']);await run('frontend',['ci']);}
 else if(mode==='build')await run('frontend',['run','build']);
 else if(mode==='test')await run('backend',['test']);
 else if(mode==='start')await run('backend',['start']);
 else if(mode==='dev'){
  const children=[spawn(command,['run','dev'],{cwd:path.join(root,'backend'),stdio:'inherit',shell:process.platform==='win32'}),spawn(command,['run','dev'],{cwd:path.join(root,'frontend'),stdio:'inherit',shell:process.platform==='win32'})];
  let stopping=false;const stop=code=>{if(stopping)return;stopping=true;for(const p of children)p.kill();process.exitCode=code;};for(const p of children){p.on('error',()=>stop(1));p.on('exit',code=>stop(code||0));}for(const sig of ['SIGINT','SIGTERM'])process.on(sig,()=>stop(0));
 }else throw Error('Unknown command');
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
