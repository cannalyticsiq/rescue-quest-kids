
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname=path.dirname(fileURLToPath(import.meta.url));
const DB=path.join(__dirname,'data','profiles.json');

export async function readProfiles(){
  try{return JSON.parse(await fs.readFile(DB,'utf8'))}
  catch{return {}}
}
export async function writeProfiles(data){
  await fs.mkdir(path.dirname(DB),{recursive:true});
  await fs.writeFile(DB,JSON.stringify(data,null,2));
}
