import { readFileSync } from 'fs';
import zlib from 'zlib';
function decodePNG(buf){
  if(buf.readUInt32BE(0)!==0x89504e47) throw new Error('not png');
  let pos=8, width=0,height=0,bitDepth=0,colorType=0,idat=[];
  while(pos<buf.length){
    const len=buf.readUInt32BE(pos); const type=buf.toString('ascii',pos+4,pos+8); const dataStart=pos+8, dataEnd=dataStart+len;
    if(type==='IHDR'){ width=buf.readUInt32BE(dataStart); height=buf.readUInt32BE(dataStart+4); bitDepth=buf[dataStart+8]; colorType=buf[dataStart+9]; }
    else if(type==='IDAT') idat.push(buf.slice(dataStart,dataEnd));
    pos=dataEnd+4;
  }
  const raw=zlib.inflateSync(Buffer.concat(idat));
  const channels = colorType===6?4:(colorType===2?3:(colorType===0?1: (colorType===3?1:4)));
  const bpp=channels*(bitDepth/8);
  const stride=width*bpp;
  const pixels=Buffer.alloc(height*stride);
  let off=0;
  for(let y=0;y<height;y++){
    const filter=raw[off++];
    for(let x=0;x<stride;x++){
      const rawByte=raw[off++];
      const a=x>=bpp?pixels[y*stride+x-bpp]:0;
      const c=y>0?pixels[(y-1)*stride+x]:0;
      const b2=y>0&&x>=bpp?pixels[(y-1)*stride+x-bpp]:0;
      let val;
      switch(filter){
        case 0: val=rawByte; break;
        case 1: val=rawByte+a; break;
        case 2: val=rawByte+c; break;
        case 3: val=rawByte+((a+c)>>1); break;
        case 4: { const p=a+c-b2, pa=Math.abs(p-a),pb=Math.abs(p-c),pc=Math.abs(p-b2); val=rawByte+(pa<=pb&&pa<=pc?a:(pb<=pc?c:b2)); } break;
        default: val=rawByte;
      }
      pixels[y*stride+x]=val&255;
    }
  }
  return {width,height,channels,pixels};
}
function sample(file, pts){
  const b=readFileSync(file); const img=decodePNG(b);
  const out=pts.map(([x,y])=>{ if(x<0)x=img.width+x; if(y<0)y=img.height+y; const i=(y*img.width+x)*img.channels; return {x,y,rgba:[img.pixels[i],img.pixels[i+1],img.pixels[i+2],img.channels>3?img.pixels[i+3]:255]}; });
  console.log(file, img.width+'x'+img.height, JSON.stringify(out));
}
sample('/tmp/lb-zoom1.png', [[5,70],[640,200],[1275,800],[10,810],[640,430]]);
sample('/tmp/lb-zoom3.png', [[5,70],[640,200],[1275,800],[10,810],[640,430]]);
