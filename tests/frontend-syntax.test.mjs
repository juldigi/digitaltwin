import test from 'node:test';
import {readdirSync,statSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {execFileSync} from 'node:child_process';

function collect(dir){
  const out=[];
  for(const name of readdirSync(dir)){
    const file=join(dir,name),stat=statSync(file);
    if(stat.isDirectory())out.push(...collect(file));
    else if(name.endsWith('.js'))out.push(file);
  }
  return out;
}

test('every frontend JavaScript file parses before deployment',()=>{
  const files=collect(resolve('frontend'));
  for(const file of files)execFileSync(process.execPath,['--check',file],{stdio:'pipe'});
});
