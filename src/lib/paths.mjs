import routes from './routes.json' with {type:'json'};
export const sourceOrigin='https://shigekiisogai.wordpress.com';
export function withBase(path,base='/') {return base.replace(/\/$/,'')+'/'+path.replace(/^\//,'');}
export function rewriteLink(href,base='/') {
 if(!href||href.startsWith('#'))return href;
 let url;try{url=new URL(href,sourceOrigin);}catch{return href;}
 if(url.origin!==sourceOrigin)return href;
 const route=decodeURIComponent(url.pathname);
 if(!routes.some(p=>p.route===route))return href;
 return withBase(route,base)+url.search+url.hash;
}
