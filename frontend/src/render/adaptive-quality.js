// Samples only completed frames. A single slow load or camera move must not
// downgrade the scene; the automatic profile can drop once per session.
export class AdaptiveQuality{
 constructor(onSustainedSlowdown){this.onSustainedSlowdown=onSustainedSlowdown;this.reset();}
 reset(){this.sampleStart=0;this.frames=0;this.slowWindows=0;this.downgraded=false;this.lastFps=null;}
 frame(now){
  if(this.downgraded)return;
  if(!this.sampleStart){this.sampleStart=now;return;}
  this.frames++;
  const elapsed=now-this.sampleStart;
  if(elapsed<5000)return;
  const fps=this.frames*1000/elapsed;
  this.lastFps=Math.round(fps);
  this.slowWindows=fps<24?this.slowWindows+1:0;
  this.frames=0;this.sampleStart=now;
  if(this.slowWindows>=2){this.downgraded=true;this.onSustainedSlowdown?.(fps);}
 }
}
