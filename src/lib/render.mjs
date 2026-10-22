import {load} from 'cheerio';
import {rewriteLink} from './paths.mjs';
export function renderContent(html,base) {
 const $=load(html,null,false);
 $('a[href]').each((_,el)=>{$(el).attr('href',rewriteLink($(el).attr('href'),base));if($(el).attr('target')==='_blank')$(el).attr('rel','noopener noreferrer');});
 return $.html();
}
