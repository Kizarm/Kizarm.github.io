var VT52=[];function vt52Initialize(unit,elementId,readRoutine){"use strict";VT52[unit]={graphics:0,elementId:elementId,escape:0,keypad:0,mode:0,col:0,row:0,typeAhead:'',readRoutine:readRoutine,screen:[]};elementId.onkeydown=vt52KeydownEvent;elementId.onkeypress=vt52KeyPressEvent;elementId.onpaste=vt52KeyPasteEvent}function vt52Reset(unit){"use strict";VT52[unit].escape=0;VT52[unit].mode=0;VT52[unit].typeAhead=''}function vt52Paint(unit,remove,ch){"use strict";var i,textPosition,screenUpdates,vt52,elementId;screenUpdates=0;vt52=VT52[unit];elementId=vt52.elementId;if(!vt52.mode){vt52.screen=elementId.value.split('\n');if(vt52.screen.length>24){vt52.screen.splice(0,vt52.screen.length-24)}for(i=0;i<vt52.screen.length;i++){if(vt52.screen[i].length>80){vt52.screen[i]=vt52.screen[i].substr(0,79)}}for(i=vt52.screen.length;i<24;i++){vt52.screen[i]=""}screenUpdates++;vt52.mode=1}if(remove<0){for(i=23;i>=1;i--){vt52.screen[i]=vt52.screen[i-1]}vt52.screen[0]="";screenUpdates++}if(remove>0){vt52.screen[vt52.row]=vt52.screen[vt52.row].substr(0,vt52.col);if(remove&2){for(i=vt52.row+1;i<24;i++){vt52.screen[i]=""}}screenUpdates++}if(vt52.screen[vt52.row].length<vt52.col){vt52.screen[vt52.row]+=" ".repeat(vt52.col-vt52.screen[vt52.row].length);screenUpdates++}if(ch){if(vt52.graphics){if(ch==97){ch=182}}vt52.screen[vt52.row]=vt52.screen[vt52.row].substr(0,vt52.col)+String.fromCharCode(ch)+vt52.screen[vt52.row].substr(vt52.col+1);if(vt52.col<79)vt52.col++;screenUpdates++}if(screenUpdates){elementId.value=vt52.screen.join('\n')}textPosition=vt52.col;for(i=0;i<vt52.row;i++){textPosition+=vt52.screen[i].length+1}setTimeout(function(){elementId.setSelectionRange(textPosition,textPosition)},0)}function vt52Put(unit,ch){"use strict";var vt52,elementId;if(typeof VT52[unit]==="undefined"){panic()}vt52=VT52[unit];elementId=vt52.elementId;switch(vt52.escape){case 0:switch(vt52.mode){case 0:switch(ch){case 8:elementId.value=elementId.value.substring(0,elementId.value.length-1);break;case 9:elementId.value+='\t';break;case 10:elementId.value+='\n';elementId.scrollTop=elementId.scrollHeight;break;case 13:if(elementId.value.length>16000){elementId.value=elementId.value.substring(elementId.value.length-4000)}break;case 27:vt52.escape=1;break;default:if(ch>=32&&ch<=126){elementId.value+=String.fromCharCode(ch)}}break;case 1:switch(ch){case 8:if(vt52.col)vt52.col--;vt52Paint(unit,0,0);break;case 9:if(vt52.col<79){if(vt52.col<72){vt52.col=(~~(vt52.col/8)+1)*8}else{vt52.col++}}vt52Paint(unit,0,0);break;case 10:if(vt52.row<23){vt52.row++;vt52Paint(unit,0,0)}else{elementId.value+='\n';elementId.scrollTop=elementId.scrollHeight;vt52.mode=0}break;case 13:vt52.col=0;vt52Paint(unit,0,0);break;case 27:vt52.escape=1;break;default:if(ch>=32&&ch<=126){vt52Paint(unit,0,ch)}}break}break;case 1:vt52.escape=0;switch(String.fromCharCode(ch)){case'=':vt52.keypad=1;break;case'>':vt52.keypad=0;break;case'F':vt52.graphics=1;break;case'G':vt52.graphics=0;break;case'A':if(vt52.row)vt52.row--;vt52Paint(unit,0,0);break;case'B':if(vt52.row<23)vt52.row++;vt52Paint(unit,0,0);break;case'C':if(vt52.col<79)vt52.col++;vt52Paint(unit,0,0);break;case'D':if(vt52.col)vt52.col--;vt52Paint(unit,0,0);break;case'H':vt52.col=0;vt52.row=0;vt52Paint(unit,0,0);break;case'I':vt52Paint(unit,-1,0);break;case'J':vt52Paint(unit,2,0);break;case'K':vt52Paint(unit,1,0);break;case'Y':vt52.escape=2;break;case'Z':vt52Input(unit,String.fromCharCode(27)+"/K");break}break;case 2:if(ch>=32&&ch<32+24){vt52.escape=3;vt52.row=ch-32}else{vt52.escape=0}break;case 3:if(ch>=32&&ch<32+80){vt52.col=ch-32;vt52Paint(unit,0,0)}vt52.escape=0;break}}const vt52KeyMap=[[12,"?u"],[33,"?l"],[33,"?y"],[34,"?s"],[35,"?q"],[36,"?w"],[37,"?t"],[37,"D"],[38,"?x"],[38,"A"],[39,"?v"],[39,"C"],[40,"?r"],[40,"B"],[45,"?p"],[96,"?p"],[97,"?q"],[98,"?r"],[99,"?s"],[100,"?t"],[101,"?u"],[102,"?v"],[103,"?w"],[104,"?x"],[105,"?y"],[106,"R"],[107,"?l"],[111,"Q"],[111,"S"],[144,"P"],];function vt52RemapKeys(unit,code,event){"use strict";var i;if(typeof VT52[unit]!=="undefined"&&VT52[unit].keypad){for(i=0;i<vt52KeyMap.length;i++){if(code==vt52KeyMap[i][0]){vt52Input(unit,String.fromCharCode(27)+vt52KeyMap[i][1]);return false}if(code<vt52KeyMap[i][0]){break}}if(code==13&&event.location===3){vt52Input(unit,String.fromCharCode(27)+"?M");return false}}return true}var vt52LastUnit=0;function vt52KeydownEvent(event){"use strict";var code=event.charCode||event.keyCode;vt52LastUnit=event.target.id;if(event.ctrlKey&&code>64&&code<96){vt52Input(vt52LastUnit,String.fromCharCode(event.keyCode-64))}else{if(event.code=="Escape"){vt52Input(vt52LastUnit,String.fromCharCode(27))}else{if(event.code=="Tab"){vt52Input(vt52LastUnit,String.fromCharCode(9))}else{if(code==8||code==127){vt52Input(vt52LastUnit,String.fromCharCode(127))}else{return vt52RemapKeys(vt52LastUnit,code,event)}}}}return false}function vt52KeyPressEvent(event){"use strict";var code=event.charCode||event.keyCode;vt52LastUnit=event.target.id;vt52Input(vt52LastUnit,String.fromCharCode(code));return false}function vt52KeyPasteEvent(event){"use strict";var cb=event.clipboardData.getData('text/plain')||window.clipboardData.getData('Text');vt52LastUnit=event.target.id;if(cb&&cb.length>0){vt52Input(vt52LastUnit,cb)}return false}function vt52Input(unit,string){"use strict";var vt52=VT52[unit];if(string.length>0){if(string.charCodeAt(0)==3){vt52.typeAhead=string}else{vt52.typeAhead+=string}vt52.elementId.focus()}if(vt52.typeAhead.length>0){if(vt52.readRoutine(unit,vt52.typeAhead.charCodeAt(0))){vt52.typeAhead=vt52.typeAhead.substring(1)}if(vt52.typeAhead.length>0){setTimeout(vt52Input,10,unit,"")}}}

