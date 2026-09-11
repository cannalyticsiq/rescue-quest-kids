
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {readProfiles,writeProfiles} from './storage.js';

const __dirname=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(__dirname,'..');
const app=express();

app.use(cors());
app.use(express.json({limit:'1mb'}));
app.use(express.static(root));

app.get('/api/health',(req,res)=>res.json({ok:true}));

app.get('/api/content',async(req,res)=>{
  const raw=await fs.readFile(path.join(__dirname,'data','content.json'),'utf8');
  res.type('json').send(raw);
});

app.get('/api/profile/:id',async(req,res)=>{
  const profiles=await readProfiles();
  res.json(profiles[req.params.id] || null);
});

app.put('/api/profile/:id',async(req,res)=>{
  const profiles=await readProfiles();
  profiles[req.params.id]={...req.body,playerId:req.params.id,updatedAt:new Date().toISOString()};
  await writeProfiles(profiles);
  res.json(profiles[req.params.id]);
});

app.get('*',(req,res)=>{
  res.sendFile(path.join(root,'index.html'));
});

const port=process.env.PORT || 3000;
app.listen(port,()=>console.log(`Rescue Quest Kids listening on ${port}`));
