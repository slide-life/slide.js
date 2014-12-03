"use strict";var sjcl={cipher:{},hash:{},keyexchange:{},mode:{},misc:{},codec:{},exception:{corrupt:function(a){this.toString=function(){return"CORRUPT: "+this.message};this.message=a},invalid:function(a){this.toString=function(){return"INVALID: "+this.message};this.message=a},bug:function(a){this.toString=function(){return"BUG: "+this.message};this.message=a},notReady:function(a){this.toString=function(){return"NOT READY: "+this.message};this.message=a}}};if(typeof module!="undefined"&&module.exports){module.exports=sjcl}sjcl.cipher.aes=function(h){if(!this._tables[0][0][0]){this._precompute()}var d,c,e,g,l,f=this._tables[0][4],k=this._tables[1],a=h.length,b=1;if(a!==4&&a!==6&&a!==8){throw new sjcl.exception.invalid("invalid aes key size")}this._key=[g=h.slice(0),l=[]];for(d=a;d<4*a+28;d++){e=g[d-1];if(d%a===0||(a===8&&d%a===4)){e=f[e>>>24]<<24^f[e>>16&255]<<16^f[e>>8&255]<<8^f[e&255];if(d%a===0){e=e<<8^e>>>24^b<<24;b=b<<1^(b>>7)*283}}g[d]=g[d-a]^e}for(c=0;d;c++,d--){e=g[c&3?d:d-4];if(d<=4||c<4){l[c]=e}else{l[c]=k[0][f[e>>>24]]^k[1][f[e>>16&255]]^k[2][f[e>>8&255]]^k[3][f[e&255]]}}};sjcl.cipher.aes.prototype={encrypt:function(a){return this._crypt(a,0)},decrypt:function(a){return this._crypt(a,1)},_tables:[[[],[],[],[],[]],[[],[],[],[],[]]],_precompute:function(){var j=this._tables[0],q=this._tables[1],h=j[4],n=q[4],g,l,f,k=[],c=[],b,p,m,o,e,a;for(g=0;g<256;g++){c[(k[g]=g<<1^(g>>7)*283)^g]=g}for(l=f=0;!h[l];l^=b||1,f=c[f]||1){o=f^f<<1^f<<2^f<<3^f<<4;o=o>>8^o&255^99;h[l]=o;n[o]=l;m=k[p=k[b=k[l]]];a=m*16843009^p*65537^b*257^l*16843008;e=k[o]*257^o*16843008;for(g=0;g<4;g++){j[g][l]=e=e<<24^e>>>8;q[g][o]=a=a<<24^a>>>8}}for(g=0;g<5;g++){j[g]=j[g].slice(0);q[g]=q[g].slice(0)}},_crypt:function(k,n){if(k.length!==4){throw new sjcl.exception.invalid("invalid aes block size")}var y=this._key[n],v=k[0]^y[0],u=k[n?3:1]^y[1],t=k[2]^y[2],s=k[n?1:3]^y[3],w,e,m,x=y.length/4-2,p,o=4,q=[0,0,0,0],r=this._tables[n],j=r[0],h=r[1],g=r[2],f=r[3],l=r[4];for(p=0;p<x;p++){w=j[v>>>24]^h[u>>16&255]^g[t>>8&255]^f[s&255]^y[o];e=j[u>>>24]^h[t>>16&255]^g[s>>8&255]^f[v&255]^y[o+1];m=j[t>>>24]^h[s>>16&255]^g[v>>8&255]^f[u&255]^y[o+2];s=j[s>>>24]^h[v>>16&255]^g[u>>8&255]^f[t&255]^y[o+3];o+=4;v=w;u=e;t=m}for(p=0;p<4;p++){q[n?3&-p:p]=l[v>>>24]<<24^l[u>>16&255]<<16^l[t>>8&255]<<8^l[s&255]^y[o++];w=v;v=u;u=t;t=s;s=w}return q}};sjcl.bitArray={bitSlice:function(b,c,d){b=sjcl.bitArray._shiftRight(b.slice(c/32),32-(c&31)).slice(1);return(d===undefined)?b:sjcl.bitArray.clamp(b,d-c)},extract:function(c,d,f){var b,e=Math.floor((-d-f)&31);if((d+f-1^d)&-32){b=(c[d/32|0]<<(32-e))^(c[d/32+1|0]>>>e)}else{b=c[d/32|0]>>>e}return b&((1<<f)-1)},concat:function(c,a){if(c.length===0||a.length===0){return c.concat(a)}var d,e,f=c[c.length-1],b=sjcl.bitArray.getPartial(f);if(b===32){return c.concat(a)}else{return sjcl.bitArray._shiftRight(a,b,f|0,c.slice(0,c.length-1))}},bitLength:function(d){try{var c=d.length,b}catch(f){debugJS.stack()}if(c===0){return 0}b=d[c-1];return(c-1)*32+sjcl.bitArray.getPartial(b)},clamp:function(d,b){if(d.length*32<b){return d}d=d.slice(0,Math.ceil(b/32));var c=d.length;b=b&31;if(c>0&&b){d[c-1]=sjcl.bitArray.partial(b,d[c-1]&2147483648>>(b-1),1)}return d},partial:function(b,a,c){if(b===32){return a}return(c?a|0:a<<(32-b))+b*1099511627776},getPartial:function(a){return Math.round(a/1099511627776)||32},equal:function(e,d){if(sjcl.bitArray.bitLength(e)!==sjcl.bitArray.bitLength(d)){return false}var c=0,f;for(f=0;f<e.length;f++){c|=e[f]^d[f]}return(c===0)},_shiftRight:function(d,c,h,f){var g,b=0,e;if(f===undefined){f=[]}for(;c>=32;c-=32){f.push(h);h=0}if(c===0){return f.concat(d)}for(g=0;g<d.length;g++){f.push(h|d[g]>>>c);h=d[g]<<(32-c)}b=d.length?d[d.length-1]:0;e=sjcl.bitArray.getPartial(b);f.push(sjcl.bitArray.partial(c+e&31,(c+e>32)?h:f.pop(),1));return f},_xor4:function(a,b){return[a[0]^b[0],a[1]^b[1],a[2]^b[2],a[3]^b[3]]}};sjcl.codec.utf8String={fromBits:function(a){var b="",e=sjcl.bitArray.bitLength(a),d,c;for(d=0;d<e/8;d++){if((d&3)===0){c=a[d/4]}b+=String.fromCharCode(c>>>24);c<<=8}return decodeURIComponent(escape(b))},toBits:function(d){d=unescape(encodeURIComponent(d));var a=[],c,b=0;for(c=0;c<d.length;c++){b=b<<8|d.charCodeAt(c);if((c&3)===3){a.push(b);b=0}}if(c&3){a.push(sjcl.bitArray.partial(8*(c&3),b))}return a}};sjcl.codec.hex={fromBits:function(b){var c="",d,a;for(d=0;d<b.length;d++){c+=((b[d]|0)+263882790666240).toString(16).substr(4)}return c.substr(0,sjcl.bitArray.bitLength(b)/4)},toBits:function(d){var c,b=[],a;d=d.replace(/\s|0x/g,"");a=d.length;d=d+"00000000";for(c=0;c<d.length;c+=8){b.push(parseInt(d.substr(c,8),16)^0)}return sjcl.bitArray.clamp(b,a*4)}};sjcl.codec.base64={_chars:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",fromBits:function(g,k,b){var d="",e,j=0,h=sjcl.codec.base64._chars,f=0,a=sjcl.bitArray.bitLength(g);if(b){h=h.substr(0,62)+"-_"}for(e=0;d.length*6<a;){d+=h.charAt((f^g[e]>>>j)>>>26);if(j<6){f=g[e]<<(6-j);j+=26;e++}else{f<<=6;j-=6}}while((d.length&3)&&!k){d+="="}return d},toBits:function(h,f){h=h.replace(/\s|=/g,"");var d=[],e,g=0,j=sjcl.codec.base64._chars,b=0,a;if(f){j=j.substr(0,62)+"-_"}for(e=0;e<h.length;e++){a=j.indexOf(h.charAt(e));if(a<0){throw new sjcl.exception.invalid("this isn't base64!")}if(g>26){g-=26;d.push(b^a>>>g);b=a<<(32-g)}else{g+=6;b^=a<<(32-g)}}if(g&56){d.push(sjcl.bitArray.partial(g&56,b,1))}return d}};sjcl.codec.base64url={fromBits:function(a){return sjcl.codec.base64.fromBits(a,1,1)},toBits:function(a){return sjcl.codec.base64.toBits(a,1)}};sjcl.codec.bytes={fromBits:function(a){var b=[],e=sjcl.bitArray.bitLength(a),d,c;for(d=0;d<e/8;d++){if((d&3)===0){c=a[d/4]}b.push(c>>>24);c<<=8}return b},toBits:function(a){var b=[],d,c=0;for(d=0;d<a.length;d++){c=c<<8|a[d];if((d&3)===3){b.push(c);c=0}}if(d&3){b.push(sjcl.bitArray.partial(8*(d&3),c))}return b}};sjcl.hash.sha256=function(a){if(!this._key[0]){this._precompute()}if(a){this._h=a._h.slice(0);this._buffer=a._buffer.slice(0);this._length=a._length}else{this.reset()}};sjcl.hash.sha256.hash=function(a){return(new sjcl.hash.sha256()).update(a).finalize()};sjcl.hash.sha256.prototype={blockSize:512,reset:function(){this._h=this._init.slice(0);this._buffer=[];this._length=0;return this},update:function(f){if(typeof f==="string"){f=sjcl.codec.utf8String.toBits(f)}var e,a=this._buffer=sjcl.bitArray.concat(this._buffer,f),d=this._length,c=this._length=d+sjcl.bitArray.bitLength(f);for(e=512+d&-512;e<=c;e+=512){this._block(a.splice(0,16))}return this},finalize:function(){var c,a=this._buffer,d=this._h;a=sjcl.bitArray.concat(a,[sjcl.bitArray.partial(1,1)]);for(c=a.length+2;c&15;c++){a.push(0)}a.push(Math.floor(this._length/4294967296));a.push(this._length|0);while(a.length){this._block(a.splice(0,16))}this.reset();return d},_init:[],_key:[],_precompute:function(){var d=0,c=2,b;function a(e){return(e-Math.floor(e))*4294967296|0}outer:for(;d<64;c++){for(b=2;b*b<=c;b++){if(c%b===0){continue outer}}if(d<8){this._init[d]=a(Math.pow(c,1/2))}this._key[d]=a(Math.pow(c,1/3));d++}},_block:function(q){var e,f,t,s,u=q.slice(0),j=this._h,c=this._key,r=j[0],p=j[1],o=j[2],n=j[3],m=j[4],l=j[5],g=j[6],d=j[7];for(e=0;e<64;e++){if(e<16){f=u[e]}else{t=u[(e+1)&15];s=u[(e+14)&15];f=u[e&15]=((t>>>7^t>>>18^t>>>3^t<<25^t<<14)+(s>>>17^s>>>19^s>>>10^s<<15^s<<13)+u[e&15]+u[(e+9)&15])|0}f=(f+d+(m>>>6^m>>>11^m>>>25^m<<26^m<<21^m<<7)+(g^m&(l^g))+c[e]);d=g;g=l;l=m;m=n+f|0;n=o;o=p;p=r;r=(f+((p&o)^(n&(p^o)))+(p>>>2^p>>>13^p>>>22^p<<30^p<<19^p<<10))|0}j[0]=j[0]+r|0;j[1]=j[1]+p|0;j[2]=j[2]+o|0;j[3]=j[3]+n|0;j[4]=j[4]+m|0;j[5]=j[5]+l|0;j[6]=j[6]+g|0;j[7]=j[7]+d|0}};sjcl.hash.sha512=function(a){if(!this._key[0]){this._precompute()}if(a){this._h=a._h.slice(0);this._buffer=a._buffer.slice(0);this._length=a._length}else{this.reset()}};sjcl.hash.sha512.hash=function(a){return(new sjcl.hash.sha512()).update(a).finalize()};sjcl.hash.sha512.prototype={blockSize:1024,reset:function(){this._h=this._init.slice(0);this._buffer=[];this._length=0;return this},update:function(f){if(typeof f==="string"){f=sjcl.codec.utf8String.toBits(f)}var e,a=this._buffer=sjcl.bitArray.concat(this._buffer,f),d=this._length,c=this._length=d+sjcl.bitArray.bitLength(f);for(e=1024+d&-1024;e<=c;e+=1024){this._block(a.splice(0,32))}return this},finalize:function(){var c,a=this._buffer,d=this._h;a=sjcl.bitArray.concat(a,[sjcl.bitArray.partial(1,1)]);for(c=a.length+4;c&31;c++){a.push(0)}a.push(0);a.push(0);a.push(Math.floor(this._length/4294967296));a.push(this._length|0);while(a.length){this._block(a.splice(0,32))}this.reset();return d},_init:[],_initr:[12372232,13281083,9762859,1914609,15106769,4090911,4308331,8266105],_key:[],_keyr:[2666018,15689165,5061423,9034684,4764984,380953,1658779,7176472,197186,7368638,14987916,16757986,8096111,1480369,13046325,6891156,15813330,5187043,9229749,11312229,2818677,10937475,4324308,1135541,6741931,11809296,16458047,15666916,11046850,698149,229999,945776,13774844,2541862,12856045,9810911,11494366,7844520,15576806,8533307,15795044,4337665,16291729,5553712,15684120,6662416,7413802,12308920,13816008,4303699,9366425,10176680,13195875,4295371,6546291,11712675,15708924,1519456,15772530,6568428,6495784,8568297,13007125,7492395,2515356,12632583,14740254,7262584,1535930,13146278,16321966,1853211,294276,13051027,13221564,1051980,4080310,6651434,14088940,4675607],_precompute:function(){var d=0,c=2,b;function a(f){return(f-Math.floor(f))*4294967296|0}function e(f){return(f-Math.floor(f))*1099511627776&255}outer:for(;d<80;c++){for(b=2;b*b<=c;b++){if(c%b===0){continue outer}}if(d<8){this._init[d*2]=a(Math.pow(c,1/2));this._init[d*2+1]=(e(Math.pow(c,1/2))<<24)|this._initr[d]}this._key[d*2]=a(Math.pow(c,1/3));this._key[d*2+1]=(e(Math.pow(c,1/3))<<24)|this._keyr[d];d++}},_block:function(ao){var ae,al,ac,R=ao.slice(0),ah=this._h,ab=this._key,g=ah[0],d=ah[1],Z=ah[2],V=ah[3],D=ah[4],B=ah[5],m=ah[6],e=ah[7],af=ah[8],X=ah[9],G=ah[10],C=ah[11],p=ah[12],j=ah[13],aj=ah[14],aa=ah[15];var r=g,l=d,am=Z,ad=V,J=D,E=B,t=m,o=e,an=af,ai=X,L=G,H=C,u=p,q=j,ap=aj,ak=aa;for(ae=0;ae<80;ae++){if(ae<16){al=R[ae*2];ac=R[ae*2+1]}else{var Q=R[(ae-15)*2];var P=R[(ae-15)*2+1];var n=((P<<31)|(Q>>>1))^((P<<24)|(Q>>>8))^(Q>>>7);var f=((Q<<31)|(P>>>1))^((Q<<24)|(P>>>8))^((Q<<25)|(P>>>7));var M=R[(ae-2)*2];var I=R[(ae-2)*2+1];var ag=((I<<13)|(M>>>19))^((M<<3)|(I>>>29))^(M>>>6);var Y=((M<<13)|(I>>>19))^((I<<3)|(M>>>29))^((M<<26)|(I>>>6));var K=R[(ae-7)*2];var F=R[(ae-7)*2+1];var W=R[(ae-16)*2];var T=R[(ae-16)*2+1];ac=f+F;al=n+K+((ac>>>0)<(f>>>0)?1:0);ac+=Y;al+=ag+((ac>>>0)<(Y>>>0)?1:0);ac+=T;al+=W+((ac>>>0)<(T>>>0)?1:0)}R[ae*2]=al|=0;R[ae*2+1]=ac|=0;var A=(an&L)^(~an&u);var y=(ai&H)^(~ai&q);var U=(r&am)^(r&J)^(am&J);var S=(l&ad)^(l&E)^(ad&E);var a=((l<<4)|(r>>>28))^((r<<30)|(l>>>2))^((r<<25)|(l>>>7));var aq=((r<<4)|(l>>>28))^((l<<30)|(r>>>2))^((l<<25)|(r>>>7));var O=((ai<<18)|(an>>>14))^((ai<<14)|(an>>>18))^((an<<23)|(ai>>>9));var N=((an<<18)|(ai>>>14))^((an<<14)|(ai>>>18))^((ai<<23)|(an>>>9));var v=ab[ae*2];var s=ab[ae*2+1];var x=ak+N;var z=ap+O+((x>>>0)<(ak>>>0)?1:0);x+=y;z+=A+((x>>>0)<(y>>>0)?1:0);x+=s;z+=v+((x>>>0)<(s>>>0)?1:0);x+=ac;z+=al+((x>>>0)<(ac>>>0)?1:0);var b=aq+S;var c=a+U+((b>>>0)<(aq>>>0)?1:0);ap=u;ak=q;u=L;q=H;L=an;H=ai;ai=(o+x)|0;an=(t+z+((ai>>>0)<(o>>>0)?1:0))|0;t=J;o=E;J=am;E=ad;am=r;ad=l;l=(x+b)|0;r=(z+c+((l>>>0)<(x>>>0)?1:0))|0}d=ah[1]=(d+l)|0;ah[0]=(g+r+((d>>>0)<(l>>>0)?1:0))|0;V=ah[3]=(V+ad)|0;ah[2]=(Z+am+((V>>>0)<(ad>>>0)?1:0))|0;B=ah[5]=(B+E)|0;ah[4]=(D+J+((B>>>0)<(E>>>0)?1:0))|0;e=ah[7]=(e+o)|0;ah[6]=(m+t+((e>>>0)<(o>>>0)?1:0))|0;X=ah[9]=(X+ai)|0;ah[8]=(af+an+((X>>>0)<(ai>>>0)?1:0))|0;C=ah[11]=(C+H)|0;ah[10]=(G+L+((C>>>0)<(H>>>0)?1:0))|0;j=ah[13]=(j+q)|0;ah[12]=(p+u+((j>>>0)<(q>>>0)?1:0))|0;aa=ah[15]=(aa+ak)|0;ah[14]=(aj+ap+((aa>>>0)<(ak>>>0)?1:0))|0}};sjcl.hash.sha1=function(a){if(a){this._h=a._h.slice(0);this._buffer=a._buffer.slice(0);this._length=a._length}else{this.reset()}};sjcl.hash.sha1.hash=function(a){return(new sjcl.hash.sha1()).update(a).finalize()};sjcl.hash.sha1.prototype={blockSize:512,reset:function(){this._h=this._init.slice(0);this._buffer=[];this._length=0;return this},update:function(f){if(typeof f==="string"){f=sjcl.codec.utf8String.toBits(f)}var e,a=this._buffer=sjcl.bitArray.concat(this._buffer,f),d=this._length,c=this._length=d+sjcl.bitArray.bitLength(f);for(e=this.blockSize+d&-this.blockSize;e<=c;e+=this.blockSize){this._block(a.splice(0,16))}return this},finalize:function(){var c,a=this._buffer,d=this._h;a=sjcl.bitArray.concat(a,[sjcl.bitArray.partial(1,1)]);for(c=a.length+2;c&15;c++){a.push(0)}a.push(Math.floor(this._length/4294967296));a.push(this._length|0);while(a.length){this._block(a.splice(0,16))}this.reset();return d},_init:[1732584193,4023233417,2562383102,271733878,3285377520],_key:[1518500249,1859775393,2400959708,3395469782],_f:function(e,a,g,f){if(e<=19){return(a&g)|(~a&f)}else{if(e<=39){return a^g^f}else{if(e<=59){return(a&g)|(a&f)|(g&f)}else{if(e<=79){return a^g^f}}}}},_S:function(b,a){return(a<<b)|(a>>>32-b)},_block:function(n){var r,g,p,o,m,l,j,q=n.slice(0),i=this._h,f=this._key;p=i[0];o=i[1];m=i[2];l=i[3];j=i[4];for(r=0;r<=79;r++){if(r>=16){q[r]=this._S(1,q[r-3]^q[r-8]^q[r-14]^q[r-16])}g=(this._S(5,p)+this._f(r,o,m,l)+j+q[r]+this._key[Math.floor(r/20)])|0;j=l;l=m;m=this._S(30,o);o=p;p=g}i[0]=(i[0]+p)|0;i[1]=(i[1]+o)|0;i[2]=(i[2]+m)|0;i[3]=(i[3]+l)|0;i[4]=(i[4]+j)|0}};sjcl.mode.ccm={name:"ccm",encrypt:function(c,b,e,m,d){var j,g,f=b.slice(0),l,k=sjcl.bitArray,a=k.bitLength(e)/8,h=k.bitLength(f)/8;d=d||64;m=m||[];if(a<7){throw new sjcl.exception.invalid("ccm: iv must be at least 7 bytes")}for(j=2;j<4&&h>>>8*j;j++){}if(j<15-a){j=15-a}e=k.clamp(e,8*(15-j));l=sjcl.mode.ccm._computeTag(c,b,e,m,d,j);f=sjcl.mode.ccm._ctrMode(c,f,e,l,d,j);return k.concat(f.data,f.tag)},decrypt:function(b,c,e,n,d){d=d||64;n=n||[];var j,g,l=sjcl.bitArray,a=l.bitLength(e)/8,h=l.bitLength(c),f=l.clamp(c,h-d),m=l.bitSlice(c,h-d),k;h=(h-d)/8;if(a<7){throw new sjcl.exception.invalid("ccm: iv must be at least 7 bytes")}for(j=2;j<4&&h>>>8*j;j++){}if(j<15-a){j=15-a}e=l.clamp(e,8*(15-j));f=sjcl.mode.ccm._ctrMode(b,f,e,m,d,j);k=sjcl.mode.ccm._computeTag(b,f.data,e,n,d,j);if(!l.equal(f.tag,k)){throw new sjcl.exception.corrupt("ccm: tag doesn't match")}return f.data},_computeTag:function(d,c,f,p,e,m){var b,l,n=0,g=24,j,h,a=[],o=sjcl.bitArray,k=o._xor4;e/=8;if(e%2||e<4||e>16){throw new sjcl.exception.invalid("ccm: invalid tag length")}if(p.length>4294967295||c.length>4294967295){throw new sjcl.exception.bug("ccm: can't deal with 4GiB or more data")}l=[o.partial(8,(p.length?1<<6:0)|(e-2)<<2|m-1)];l=o.concat(l,f);l[3]|=o.bitLength(c)/8;l=d.encrypt(l);if(p.length){j=o.bitLength(p)/8;if(j<=65279){a=[o.partial(16,j)]}else{if(j<=4294967295){a=o.concat([o.partial(16,65534)],[j])}}a=o.concat(a,p);for(h=0;h<a.length;h+=4){l=d.encrypt(k(l,a.slice(h,h+4).concat([0,0,0])))}}for(h=0;h<c.length;h+=4){l=d.encrypt(k(l,c.slice(h,h+4).concat([0,0,0])))}return o.clamp(l,e*8)},_ctrMode:function(d,j,g,q,f,n){var h,k,p=sjcl.bitArray,m=p._xor4,c,o,e=j.length,a=p.bitLength(j);c=p.concat([p.partial(8,n-1)],g).concat([0,0,0]).slice(0,4);q=p.bitSlice(m(q,d.encrypt(c)),0,f);if(!e){return{tag:q,data:[]}}for(k=0;k<e;k+=4){c[3]++;h=d.encrypt(c);j[k]^=h[0];j[k+1]^=h[1];j[k+2]^=h[2];j[k+3]^=h[3]}return{tag:q,data:p.clamp(j,a)}}};if(sjcl.beware===undefined){sjcl.beware={}}sjcl.beware["CBC mode is dangerous because it doesn't protect message integrity."]=function(){sjcl.mode.cbc={name:"cbc",encrypt:function(h,b,e,k){if(k&&k.length){throw new sjcl.exception.invalid("cbc can't authenticate data")}if(sjcl.bitArray.bitLength(e)!==128){throw new sjcl.exception.invalid("cbc iv must be 128 bits")}var f,j=sjcl.bitArray,g=j._xor4,d=j.bitLength(b),a=0,c=[];if(d&7){throw new sjcl.exception.invalid("pkcs#5 padding only works for multiples of a byte")}for(f=0;a+128<=d;f+=4,a+=128){e=h.encrypt(g(e,b.slice(f,f+4)));c.splice(f,0,e[0],e[1],e[2],e[3])}d=(16-((d>>3)&15))*16843009;e=h.encrypt(g(e,j.concat(b,[d,d,d,d]).slice(f,f+4)));c.splice(f,0,e[0],e[1],e[2],e[3]);return c},decrypt:function(h,c,d,k){if(k&&k.length){throw new sjcl.exception.invalid("cbc can't authenticate data")}if(sjcl.bitArray.bitLength(d)!==128){throw new sjcl.exception.invalid("cbc iv must be 128 bits")}if((sjcl.bitArray.bitLength(c)&127)||!c.length){throw new sjcl.exception.corrupt("cbc ciphertext must be a positive multiple of the block size")}var f,j=sjcl.bitArray,g=j._xor4,e,a,b=[];k=k||[];for(f=0;f<c.length;f+=4){e=c.slice(f,f+4);a=g(d,h.decrypt(e));b.splice(f,0,a[0],a[1],a[2],a[3]);d=e}e=b[f-1]&255;if(e==0||e>16){throw new sjcl.exception.corrupt("pkcs#5 padding corrupt")}a=e*16843009;if(!j.equal(j.bitSlice([a,a,a,a],0,e*8),j.bitSlice(b,b.length*32-e*8,b.length*32))){throw new sjcl.exception.corrupt("pkcs#5 padding corrupt")}return j.bitSlice(b,0,b.length*32-e*8)}}};sjcl.mode.ocb2={name:"ocb2",encrypt:function(o,a,g,q,e,l){if(sjcl.bitArray.bitLength(g)!==128){throw new sjcl.exception.invalid("ocb iv must be 128 bits")}var h,m=sjcl.mode.ocb2._times2,n=sjcl.bitArray,j=n._xor4,k=[0,0,0,0],p=m(o.encrypt(g)),f,c,b=[],d;q=q||[];e=e||64;for(h=0;h+4<a.length;h+=4){f=a.slice(h,h+4);k=j(k,f);b=b.concat(j(p,o.encrypt(j(p,f))));p=m(p)}f=a.slice(h);c=n.bitLength(f);d=o.encrypt(j(p,[0,0,0,c]));f=n.clamp(j(f.concat([0,0,0]),d),c);k=j(k,j(f.concat([0,0,0]),d));k=o.encrypt(j(k,j(p,m(p))));if(q.length){k=j(k,l?q:sjcl.mode.ocb2.pmac(o,q))}return b.concat(n.concat(f,n.clamp(k,e)))},decrypt:function(p,d,g,r,e,m){if(sjcl.bitArray.bitLength(g)!==128){throw new sjcl.exception.invalid("ocb iv must be 128 bits")}e=e||64;var h,n=sjcl.mode.ocb2._times2,o=sjcl.bitArray,j=o._xor4,l=[0,0,0,0],q=n(p.encrypt(g)),f,b,k=sjcl.bitArray.bitLength(d)-e,a=[],c;r=r||[];for(h=0;h+4<k/32;h+=4){f=j(q,p.decrypt(j(q,d.slice(h,h+4))));l=j(l,f);a=a.concat(f);q=n(q)}b=k-h*32;c=p.encrypt(j(q,[0,0,0,b]));f=j(c,o.clamp(d.slice(h),b).concat([0,0,0]));l=j(l,f);l=p.encrypt(j(l,j(q,n(q))));if(r.length){l=j(l,m?r:sjcl.mode.ocb2.pmac(p,r))}if(!o.equal(o.clamp(l,e),o.bitSlice(d,k))){throw new sjcl.exception.corrupt("ocb: tag doesn't match")}return a.concat(o.clamp(f,b))},pmac:function(f,j){var b,e=sjcl.mode.ocb2._times2,g=sjcl.bitArray,c=g._xor4,d=[0,0,0,0],h=f.encrypt([0,0,0,0]),a;h=c(h,e(e(h)));for(b=0;b+4<j.length;b+=4){h=e(h);d=c(d,f.encrypt(c(h,j.slice(b,b+4))))}a=j.slice(b);if(g.bitLength(a)<128){h=c(h,e(h));a=g.concat(a,[2147483648|0,0,0,0])}d=c(d,a);return f.encrypt(c(e(c(h,e(h))),d))},_times2:function(a){return[a[0]<<1^a[1]>>>31,a[1]<<1^a[2]>>>31,a[2]<<1^a[3]>>>31,a[3]<<1^(a[0]>>>31)*135]}};sjcl.mode.gcm={name:"gcm",encrypt:function(h,g,c,e,d){var b,f=g.slice(0),a=sjcl.bitArray;d=d||128;e=e||[];b=sjcl.mode.gcm._ctrMode(true,h,f,e,c,d);return a.concat(b.data,b.tag)},decrypt:function(a,c,e,i,d){var f,g=c.slice(0),j,h=sjcl.bitArray,b=h.bitLength(g);d=d||128;i=i||[];if(d<=b){j=h.bitSlice(g,b-d);g=h.bitSlice(g,0,b-d)}else{j=g;g=[]}f=sjcl.mode.gcm._ctrMode(false,a,g,i,e,d);if(!h.equal(f.tag,j)){throw new sjcl.exception.corrupt("gcm: tag doesn't match")}return f.data},_galoisMultiply:function(k,g){var c,b,f,a,e,h,l=sjcl.bitArray,d=l._xor4;a=[0,0,0,0];e=g.slice(0);for(c=0;c<128;c++){f=(k[Math.floor(c/32)]&(1<<(31-c%32)))!==0;if(f){a=d(a,e)}h=(e[3]&1)!==0;for(b=3;b>0;b--){e[b]=(e[b]>>>1)|((e[b-1]&1)<<31)}e[0]=e[0]>>>1;if(h){e[0]=e[0]^(225<<24)}}return a},_ghash:function(c,f,e){var d,b,a=e.length;d=f.slice(0);for(b=0;b<a;b+=4){d[0]^=4294967295&e[b];d[1]^=4294967295&e[b+1];d[2]^=4294967295&e[b+2];d[3]^=4294967295&e[b+3];d=sjcl.mode.gcm._galoisMultiply(d,c)}return d},_ctrMode:function(m,k,u,r,e,a){var j,c,f,d,q,s,v,g,n,b,o,t,h=sjcl.bitArray,p=h._xor4;n=u.length;b=h.bitLength(u);o=h.bitLength(r);t=h.bitLength(e);j=k.encrypt([0,0,0,0]);if(t===96){c=e.slice(0);c=h.concat(c,[1])}else{c=sjcl.mode.gcm._ghash(j,[0,0,0,0],e);c=sjcl.mode.gcm._ghash(j,c,[0,0,Math.floor(t/4294967296),t&4294967295])}f=sjcl.mode.gcm._ghash(j,[0,0,0,0],r);s=c.slice(0);v=f.slice(0);if(!m){v=sjcl.mode.gcm._ghash(j,f,u)}for(q=0;q<n;q+=4){s[3]++;d=k.encrypt(s);u[q]^=d[0];u[q+1]^=d[1];u[q+2]^=d[2];u[q+3]^=d[3]}u=h.clamp(u,b);if(m){v=sjcl.mode.gcm._ghash(j,f,u)}g=[Math.floor(o/4294967296),o&4294967295,Math.floor(b/4294967296),b&4294967295];v=sjcl.mode.gcm._ghash(j,v,g);d=k.encrypt(c);v[0]^=d[0];v[1]^=d[1];v[2]^=d[2];v[3]^=d[3];return{tag:h.bitSlice(v,0,a),data:u}}};sjcl.misc.hmac=function(d,e){this._hash=e=e||sjcl.hash.sha256;var c=[[],[]],b,a=e.prototype.blockSize/32;this._baseHash=[new e(),new e()];if(d.length>a){d=e.hash(d)}for(b=0;b<a;b++){c[0][b]=d[b]^909522486;c[1][b]=d[b]^1549556828}this._baseHash[0].update(c[0]);this._baseHash[1].update(c[1])};sjcl.misc.hmac.prototype.encrypt=sjcl.misc.hmac.prototype.mac=function(b){var a=new (this._hash)(this._baseHash[0]).update(b).finalize();return new (this._hash)(this._baseHash[1]).update(a).finalize()};sjcl.misc.pbkdf2=function(o,h,l,a,q){l=l||1000;if(a<0||l<0){throw sjcl.exception.invalid("invalid params to pbkdf2")}if(typeof o==="string"){o=sjcl.codec.utf8String.toBits(o)}q=q||sjcl.misc.hmac;var c=new q(o),p,n,g,f,d,e=[],m=sjcl.bitArray;for(d=1;32*e.length<(a||1);d++){p=n=c.encrypt(m.concat(h,[d]));for(g=1;g<l;g++){n=c.encrypt(n);for(f=0;f<n.length;f++){p[f]^=n[f]}}e=e.concat(p)}if(a){e=m.clamp(e,a)}return e};sjcl.prng=function(a){this._pools=[new sjcl.hash.sha256()];this._poolEntropy=[0];this._reseedCount=0;this._robins={};this._eventId=0;this._collectorIds={};this._collectorIdNext=0;this._strength=0;this._poolStrength=0;this._nextReseed=0;this._key=[0,0,0,0,0,0,0,0];this._counter=[0,0,0,0];this._cipher=undefined;this._defaultParanoia=a;this._collectorsStarted=false;this._callbacks={progress:{},seeded:{}};this._callbackI=0;this._NOT_READY=0;this._READY=1;this._REQUIRES_RESEED=2;this._MAX_WORDS_PER_BURST=65536;this._PARANOIA_LEVELS=[0,48,64,96,128,192,256,384,512,768,1024];this._MILLISECONDS_PER_RESEED=30000;this._BITS_PER_RESEED=80};sjcl.prng.prototype={randomWords:function(a,f){var b=[],d,c=this.isReady(f),e;if(c===this._NOT_READY){throw new sjcl.exception.notReady("generator isn't seeded")}else{if(c&this._REQUIRES_RESEED){this._reseedFromPools(!(c&this._READY))}}for(d=0;d<a;d+=4){if((d+1)%this._MAX_WORDS_PER_BURST===0){this._gate()}e=this._gen4words();b.push(e[0],e[1],e[2],e[3])}this._gate();return b.slice(0,a)},setDefaultParanoia:function(a){this._defaultParanoia=a},addEntropy:function(e,l,a){a=a||"user";var b,f,g,j=(new Date()).valueOf(),c=this._robins[a],k=this.isReady(),d=0;b=this._collectorIds[a];if(b===undefined){b=this._collectorIds[a]=this._collectorIdNext++}if(c===undefined){c=this._robins[a]=0}this._robins[a]=(this._robins[a]+1)%this._pools.length;switch(typeof(e)){case"number":if(l===undefined){l=1}this._pools[c].update([b,this._eventId++,1,l,j,1,e|0]);break;case"object":var h=Object.prototype.toString.call(e);if(h==="[object Uint32Array]"){g=[];for(f=0;f<e.length;f++){g.push(e[f])}e=g}else{if(h!=="[object Array]"){d=1}for(f=0;f<e.length&&!d;f++){if(typeof(e[f])!="number"){d=1}}}if(!d){if(l===undefined){l=0;for(f=0;f<e.length;f++){g=e[f];while(g>0){l++;g=g>>>1}}}this._pools[c].update([b,this._eventId++,2,l,j,e.length].concat(e))}break;case"string":if(l===undefined){l=e.length}this._pools[c].update([b,this._eventId++,3,l,j,e.length]);this._pools[c].update(e);break;default:d=1}if(d){throw new sjcl.exception.bug("random: addEntropy only supports number, array of numbers or string")}this._poolEntropy[c]+=l;this._poolStrength+=l;if(k===this._NOT_READY){if(this.isReady()!==this._NOT_READY){this._fireEvent("seeded",Math.max(this._strength,this._poolStrength))}this._fireEvent("progress",this.getProgress())}},isReady:function(b){var a=this._PARANOIA_LEVELS[(b!==undefined)?b:this._defaultParanoia];if(this._strength&&this._strength>=a){return(this._poolEntropy[0]>this._BITS_PER_RESEED&&(new Date()).valueOf()>this._nextReseed)?this._REQUIRES_RESEED|this._READY:this._READY}else{return(this._poolStrength>=a)?this._REQUIRES_RESEED|this._NOT_READY:this._NOT_READY}},getProgress:function(b){var a=this._PARANOIA_LEVELS[b?b:this._defaultParanoia];if(this._strength>=a){return 1}else{return(this._poolStrength>a)?1:this._poolStrength/a}},startCollectors:function(){if(this._collectorsStarted){return}if(window.addEventListener){window.addEventListener("load",this._loadTimeCollector,false);window.addEventListener("mousemove",this._mouseCollector,false)}else{if(document.attachEvent){document.attachEvent("onload",this._loadTimeCollector);document.attachEvent("onmousemove",this._mouseCollector)}else{throw new sjcl.exception.bug("can't attach event")}}this._collectorsStarted=true},stopCollectors:function(){if(!this._collectorsStarted){return}if(window.removeEventListener){window.removeEventListener("load",this._loadTimeCollector,false);window.removeEventListener("mousemove",this._mouseCollector,false)}else{if(window.detachEvent){window.detachEvent("onload",this._loadTimeCollector);window.detachEvent("onmousemove",this._mouseCollector)}}this._collectorsStarted=false},addEventListener:function(a,b){this._callbacks[a][this._callbackI++]=b},removeEventListener:function(e,a){var f,d,c=this._callbacks[e],b=[];for(d in c){if(c.hasOwnProperty(d)&&c[d]===a){b.push(d)}}for(f=0;f<b.length;f++){d=b[f];delete c[d]}},_gen4words:function(){for(var a=0;a<4;a++){this._counter[a]=this._counter[a]+1|0;if(this._counter[a]){break}}return this._cipher.encrypt(this._counter)},_gate:function(){this._key=this._gen4words().concat(this._gen4words());this._cipher=new sjcl.cipher.aes(this._key)},_reseed:function(b){this._key=sjcl.hash.sha256.hash(this._key.concat(b));this._cipher=new sjcl.cipher.aes(this._key);for(var a=0;a<4;a++){this._counter[a]=this._counter[a]+1|0;if(this._counter[a]){break}}},_reseedFromPools:function(c){var a=[],d=0,b;this._nextReseed=a[0]=(new Date()).valueOf()+this._MILLISECONDS_PER_RESEED;for(b=0;b<16;b++){a.push(Math.random()*4294967296|0)}for(b=0;b<this._pools.length;b++){a=a.concat(this._pools[b].finalize());d+=this._poolEntropy[b];this._poolEntropy[b]=0;if(!c&&(this._reseedCount&(1<<b))){break}}if(this._reseedCount>=1<<this._pools.length){this._pools.push(new sjcl.hash.sha256());this._poolEntropy.push(0)}this._poolStrength-=d;if(d>this._strength){this._strength=d}this._reseedCount++;this._reseed(a)},_mouseCollector:function(b){var a=b.x||b.clientX||b.offsetX||0,c=b.y||b.clientY||b.offsetY||0;sjcl.random.addEntropy([a,c],2,"mouse")},_loadTimeCollector:function(a){sjcl.random.addEntropy((new Date()).valueOf(),2,"loadtime")},_fireEvent:function(d,a){var c,b=sjcl.random._callbacks[d],e=[];for(c in b){if(b.hasOwnProperty(c)){e.push(b[c])}}for(c=0;c<e.length;c++){e[c](a)}}};sjcl.random=new sjcl.prng(6);(function(){try{var a=new Uint32Array(32);crypto.getRandomValues(a);sjcl.random.addEntropy(a,1024,"crypto.getRandomValues")}catch(b){}})();sjcl.json={defaults:{v:1,iter:1000,ks:128,ts:64,mode:"ccm",adata:"",cipher:"aes"},encrypt:function(h,b,c,f){c=c||{};f=f||{};var d=sjcl.json,a=d._add({iv:sjcl.random.randomWords(4,0)},d.defaults),e,g,i;d._add(a,c);i=a.adata;if(typeof a.salt==="string"){a.salt=sjcl.codec.base64.toBits(a.salt)}if(typeof a.iv==="string"){a.iv=sjcl.codec.base64.toBits(a.iv)}if(!sjcl.mode[a.mode]||!sjcl.cipher[a.cipher]||(typeof h==="string"&&a.iter<=100)||(a.ts!==64&&a.ts!==96&&a.ts!==128)||(a.ks!==128&&a.ks!==192&&a.ks!==256)||(a.iv.length<2||a.iv.length>4)){throw new sjcl.exception.invalid("json encrypt: invalid parameters")}if(typeof h==="string"){e=sjcl.misc.cachedPbkdf2(h,a);h=e.key.slice(0,a.ks/32);a.salt=e.salt}else{if(sjcl.ecc&&h instanceof sjcl.ecc.elGamal.publicKey){e=h.kem();a.kemtag=e.tag;h=e.key.slice(0,a.ks/32)}}if(typeof b==="string"){b=sjcl.codec.utf8String.toBits(b)}if(typeof i==="string"){i=sjcl.codec.utf8String.toBits(i)}g=new sjcl.cipher[a.cipher](h);d._add(f,a);f.key=h;a.ct=sjcl.mode[a.mode].encrypt(g,b,a.iv,i,a.ts);return d.encode(a)},decrypt:function(k,b,c,f){c=c||{};f=f||{};var d=sjcl.json,a=d._add(d._add(d._add({},d.defaults),d.decode(b)),c,true),g,e,i,l=a.adata;if(typeof a.salt==="string"){a.salt=sjcl.codec.base64.toBits(a.salt)}if(typeof a.iv==="string"){a.iv=sjcl.codec.base64.toBits(a.iv)}if(!sjcl.mode[a.mode]||!sjcl.cipher[a.cipher]||(typeof k==="string"&&a.iter<=100)||(a.ts!==64&&a.ts!==96&&a.ts!==128)||(a.ks!==128&&a.ks!==192&&a.ks!==256)||(!a.iv)||(a.iv.length<2||a.iv.length>4)){throw new sjcl.exception.invalid("json decrypt: invalid parameters")}if(typeof k==="string"){e=sjcl.misc.cachedPbkdf2(k,a);k=e.key.slice(0,a.ks/32);a.salt=e.salt}else{if(sjcl.ecc&&k instanceof sjcl.ecc.elGamal.secretKey){k=k.unkem(sjcl.codec.base64.toBits(a.kemtag)).slice(0,a.ks/32)}}if(typeof l==="string"){l=sjcl.codec.utf8String.toBits(l)}i=new sjcl.cipher[a.cipher](k);g=sjcl.mode[a.mode].decrypt(i,a.ct,a.iv,l,a.ts);d._add(f,a);f.key=k;var h=sjcl.codec.utf8String.fromBits(g);return h},encode:function(d){var c,b="{",a="";for(c in d){if(d.hasOwnProperty(c)){if(!c.match(/^[a-z0-9]+$/i)){throw new sjcl.exception.invalid("json encode: invalid property name")}b+=a+'"'+c+'":';a=",";switch(typeof d[c]){case"number":case"boolean":b+=d[c];break;case"string":b+='"'+escape(d[c])+'"';break;case"object":b+='"'+sjcl.codec.base64.fromBits(d[c],0)+'"';break;default:throw new sjcl.exception.bug("json encode: unsupported type")}}}return b+"}"},decode:function(f){f=f.replace(/\s/g,"");if(!f.match(/^\{.*\}$/)){throw new sjcl.exception.invalid("json decode: this isn't json!")}var c=f.replace(/^\{|\}$/g,"").split(/,/),d={},e,b;for(e=0;e<c.length;e++){if(!(b=c[e].match(/^(?:(["']?)([a-z][a-z0-9]*)\1):(?:(\d+)|"([a-z0-9+\/%*_.@=\-]*)")$/i))){throw new sjcl.exception.invalid("json decode: this isn't json!")}if(b[3]){d[b[2]]=parseInt(b[3],10)}else{d[b[2]]=b[2].match(/^(ct|salt|iv)$/)?sjcl.codec.base64.toBits(b[4]):unescape(b[4])}}return d},_add:function(c,d,b){if(c===undefined){c={}}if(d===undefined){return c}var a;for(a in d){if(d.hasOwnProperty(a)){if(b&&c[a]!==undefined&&c[a]!==d[a]){throw new sjcl.exception.invalid("required parameter overridden")}c[a]=d[a]}}return c},_subtract:function(d,c){var a={},b;for(b in d){if(d.hasOwnProperty(b)&&d[b]!==c[b]){a[b]=d[b]}}return a},_filter:function(d,c){var a={},b;for(b=0;b<c.length;b++){if(d[c[b]]!==undefined){a[c[b]]=d[c[b]]}}return a}};sjcl.encrypt=sjcl.json.encrypt;sjcl.decrypt=sjcl.json.decrypt;sjcl.misc._pbkdf2Cache={};sjcl.misc.cachedPbkdf2=function(d,g){var b=sjcl.misc._pbkdf2Cache,i,f,h,e,a;g=g||{};a=g.iter||1000;f=b[d]=b[d]||{};i=f[a]=f[a]||{firstSalt:(g.salt&&g.salt.length)?g.salt.slice(0):sjcl.random.randomWords(2,0)};e=(g.salt===undefined)?i.firstSalt:g.salt;i[e]=i[e]||sjcl.misc.pbkdf2(d,e,g.iter);return{key:i[e].slice(0),salt:e.slice(0)}};sjcl.bn=function(a){this.initWith(a)};sjcl.bn.prototype={radix:24,maxMul:8,_class:sjcl.bn,copy:function(){return new this._class(this)},initWith:function(d){var c=0,b,e,a;switch(typeof d){case"object":this.limbs=d.limbs.slice(0);break;case"number":this.limbs=[d];this.normalize();break;case"string":d=d.replace(/^0x/,"");this.limbs=[];b=this.radix/4;for(c=0;c<d.length;c+=b){this.limbs.push(parseInt(d.substring(Math.max(d.length-c-b,0),d.length-c),16))}break;default:this.limbs=[0]}return this},equals:function(b){if(typeof b==="number"){b=new this._class(b)}var c=0,a;this.fullReduce();b.fullReduce();for(a=0;a<this.limbs.length||a<b.limbs.length;a++){c|=this.getLimb(a)^b.getLimb(a)}return(c===0)},getLimb:function(a){return(a>=this.limbs.length)?0:this.limbs[a]},greaterEquals:function(g){if(typeof g==="number"){g=new this._class(g)}var e=0,h=0,f,d,c;f=Math.max(this.limbs.length,g.limbs.length)-1;for(;f>=0;f--){d=this.getLimb(f);c=g.getLimb(f);h|=(c-d)&~e;e|=(d-c)&~h}return(h|~e)>>>31},toString:function(){this.fullReduce();var b="",c,d,a=this.limbs;for(c=0;c<this.limbs.length;c++){d=a[c].toString(16);while(c<this.limbs.length-1&&d.length<6){d="0"+d}b=d+b}return"0x"+b},addM:function(c){if(typeof(c)!=="object"){c=new this._class(c)}var b,a=this.limbs,d=c.limbs;for(b=a.length;b<d.length;b++){a[b]=0}for(b=0;b<d.length;b++){a[b]+=d[b]}return this},doubleM:function(){var d,f=0,c,e=this.radix,a=this.radixMask,b=this.limbs;for(d=0;d<b.length;d++){c=b[d];c=c+c+f;b[d]=c&a;f=c>>e}if(f){b.push(f)}return this},halveM:function(){var c,e=0,b,d=this.radix,a=this.limbs;for(c=a.length-1;c>=0;c--){b=a[c];a[c]=(b+e)>>1;e=(b&1)<<d}if(!a[a.length-1]){a.pop()}return this},subM:function(c){if(typeof(c)!=="object"){c=new this._class(c)}var b,a=this.limbs,d=c.limbs;for(b=a.length;b<d.length;b++){a[b]=0}for(b=0;b<d.length;b++){a[b]-=d[b]}return this},mod:function(c){var d=!this.greaterEquals(new sjcl.bn(0));c=new sjcl.bn(c).normalize();var a=new sjcl.bn(this).normalize(),b=0;if(d){a=(new sjcl.bn(0)).subM(a).normalize()}for(;a.greaterEquals(c);b++){c.doubleM()}if(d){a=c.sub(a).normalize()}for(;b>0;b--){c.halveM();if(a.greaterEquals(c)){a.subM(c).normalize()}}return a.trim()},inverseMod:function(h){var e=new sjcl.bn(1),d=new sjcl.bn(0),c=new sjcl.bn(this),k=new sjcl.bn(h),g,f,j=1;if(!(h.limbs[0]&1)){throw (new sjcl.exception.invalid("inverseMod: p must be odd"))}do{if(c.limbs[0]&1){if(!c.greaterEquals(k)){g=c;c=k;k=g;g=e;e=d;d=g}c.subM(k);c.normalize();if(!e.greaterEquals(d)){e.addM(h)}e.subM(d)}c.halveM();if(e.limbs[0]&1){e.addM(h)}e.normalize();e.halveM();for(f=j=0;f<c.limbs.length;f++){j|=c.limbs[f]}}while(j);if(!k.equals(1)){throw (new sjcl.exception.invalid("inverseMod: p and x must be relatively prime"))}return d},add:function(a){return this.copy().addM(a)},sub:function(a){return this.copy().subM(a)},mul:function(k){if(typeof(k)==="number"){k=new this._class(k)}var g,e,o=this.limbs,n=k.limbs,h=o.length,d=n.length,f=new this._class(),m=f.limbs,l,p=this.maxMul;for(g=0;g<this.limbs.length+k.limbs.length+1;g++){m[g]=0}for(g=0;g<h;g++){l=o[g];for(e=0;e<d;e++){m[g+e]+=l*n[e]}if(!--p){p=this.maxMul;f.cnormalize()}}return f.cnormalize().reduce()},square:function(){return this.mul(this)},power:function(a){if(typeof(a)==="number"){a=[a]}else{if(a.limbs!==undefined){a=a.normalize().limbs}}var d,c,b=new this._class(1),e=this;for(d=0;d<a.length;d++){for(c=0;c<this.radix;c++){if(a[d]&(1<<c)){b=b.mul(e)}e=e.square()}}return b},mulmod:function(a,b){return this.mod(b).mul(a.mod(b)).mod(b)},powermod:function(c,f){var b=new sjcl.bn(1),d=new sjcl.bn(this),e=new sjcl.bn(c);while(true){if(e.limbs[0]&1){b=b.mulmod(d,f)}e.halveM();if(e.equals(0)){break}d=d.mulmod(d,f)}return b.normalize().reduce()},trim:function(){var a=this.limbs,b;do{b=a.pop()}while(a.length&&b===0);a.push(b);return this},reduce:function(){return this},fullReduce:function(){return this.normalize()},normalize:function(){var h=0,c,g=this.placeVal,e=this.ipv,b,a,f=this.limbs,d=f.length,j=this.radixMask;for(c=0;c<d||(h!==0&&h!==-1);c++){b=(f[c]||0)+h;a=f[c]=b&j;h=(b-a)*e}if(h===-1){f[c-1]-=this.placeVal}return this},cnormalize:function(){var g=0,e,d=this.ipv,c,a,h=this.limbs,f=h.length,b=this.radixMask;for(e=0;e<f-1;e++){c=h[e]+g;a=h[e]=c&b;g=(c-a)*d}h[e]+=g;return this},toBits:function(a){this.fullReduce();a=a||this.exponent||this.bitLength();var d=Math.floor((a-1)/24),b=sjcl.bitArray,f=(a+7&-8)%this.radix||this.radix,c=[b.partial(f,this.getLimb(d))];for(d--;d>=0;d--){c=b.concat(c,[b.partial(Math.min(this.radix,a),this.getLimb(d))]);a-=this.radix}return c},bitLength:function(){this.fullReduce();var c=this.radix*(this.limbs.length-1),a=this.limbs[this.limbs.length-1];for(;a;a>>>=1){c++}return c+7&-8}};sjcl.bn.fromBits=function(g){var c=this,d=new c(),i=[],b=sjcl.bitArray,f=this.prototype,a=Math.min(this.bitLength||4294967296,b.bitLength(g)),h=a%f.radix||f.radix;i[0]=b.extract(g,0,h);for(;h<a;h+=f.radix){i.unshift(b.extract(g,h,f.radix))}d.limbs=i;return d};sjcl.bn.prototype.ipv=1/(sjcl.bn.prototype.placeVal=Math.pow(2,sjcl.bn.prototype.radix));sjcl.bn.prototype.radixMask=(1<<sjcl.bn.prototype.radix)-1;sjcl.bn.pseudoMersennePrime=function(f,b){function g(h){this.initWith(h)}var a=g.prototype=new sjcl.bn(),d,c,e;e=a.modOffset=Math.ceil(c=f/a.radix);a.exponent=f;a.offset=[];a.factor=[];a.minOffset=e;a.fullMask=0;a.fullOffset=[];a.fullFactor=[];a.modulus=g.modulus=new sjcl.bn(Math.pow(2,f));a.fullMask=0|-Math.pow(2,f%a.radix);for(d=0;d<b.length;d++){a.offset[d]=Math.floor(b[d][0]/a.radix-c);a.fullOffset[d]=Math.ceil(b[d][0]/a.radix-c);a.factor[d]=b[d][1]*Math.pow(1/2,f-b[d][0]+a.offset[d]*a.radix);a.fullFactor[d]=b[d][1]*Math.pow(1/2,f-b[d][0]+a.fullOffset[d]*a.radix);a.modulus.addM(new sjcl.bn(Math.pow(2,b[d][0])*b[d][1]));a.minOffset=Math.min(a.minOffset,-a.offset[d])}a._class=g;a.modulus.cnormalize();a.reduce=function(){var q,p,o,n=this.modOffset,t=this.limbs,j,m=this.offset,r=this.offset.length,h=this.factor,s;q=this.minOffset;while(t.length>n){o=t.pop();s=t.length;for(p=0;p<r;p++){t[s+m[p]]-=h[p]*o}q--;if(!q){t.push(0);this.cnormalize();q=this.minOffset}}this.cnormalize();return this};a._strongReduce=(a.fullMask===-1)?a.reduce:function(){var n=this.limbs,m=n.length-1,j,h;this.reduce();if(m===this.modOffset-1){h=n[m]&this.fullMask;n[m]-=h;for(j=0;j<this.fullOffset.length;j++){n[m+this.fullOffset[j]]-=this.fullFactor[j]*h}this.normalize()}};a.fullReduce=function(){var j,h;this._strongReduce();this.addM(this.modulus);this.addM(this.modulus);this.normalize();this._strongReduce();for(h=this.limbs.length;h<this.modOffset;h++){this.limbs[h]=0}j=this.greaterEquals(this.modulus);for(h=0;h<this.limbs.length;h++){this.limbs[h]-=this.modulus.limbs[h]*j}this.cnormalize();return this};a.inverse=function(){return(this.power(this.modulus.sub(2)))};g.fromBits=sjcl.bn.fromBits;return g};sjcl.bn.prime={p127:sjcl.bn.pseudoMersennePrime(127,[[0,-1]]),p25519:sjcl.bn.pseudoMersennePrime(255,[[0,-19]]),p192:sjcl.bn.pseudoMersennePrime(192,[[0,-1],[64,-1]]),p224:sjcl.bn.pseudoMersennePrime(224,[[0,1],[96,-1]]),p256:sjcl.bn.pseudoMersennePrime(256,[[0,-1],[96,1],[192,1],[224,-1]]),p384:sjcl.bn.pseudoMersennePrime(384,[[0,-1],[32,1],[96,-1],[128,-1]]),p521:sjcl.bn.pseudoMersennePrime(521,[[0,-1]])};sjcl.bn.random=function(c,f){if(typeof c!=="object"){c=new sjcl.bn(c)}var g,e,b=c.limbs.length,a=c.limbs[b-1]+1,d=new sjcl.bn();while(true){do{g=sjcl.random.randomWords(b,f);if(g[b-1]<0){g[b-1]+=4294967296}}while(Math.floor(g[b-1]/a)===Math.floor(4294967296/a));g[b-1]%=a;for(e=0;e<b-1;e++){g[e]&=c.radixMask}d.limbs=g;if(!d.greaterEquals(c)){return d}}};sjcl.ecc={};sjcl.ecc.asyncDelay=1;sjcl.ecc.point=function(b,a,c){if(a===undefined){this.isIdentity=true}else{this.x=a;this.y=c;this.isIdentity=false}this.curve=b};sjcl.ecc.point.prototype={toJac:function(){return new sjcl.ecc.pointJac(this.curve,this.x,this.y,new this.curve.field(1))},mult:function(a){return this.toJac().mult(a,this).toAffine()},multAsync:function(b,e,d,c){var a=null;if((d!=null)&&((d!=undefined)&&(d!="undefined"))){a=d}else{a=this}setTimeout(function(){sjcl.ecc.point.prototype.toJacAsync(b,e,a,c)},sjcl.ecc.asyncDelay)},toJacAsync:function(c,e,b,d){var a=b.toJac();setTimeout(function(){sjcl.ecc.point.prototype.multJacAsync(a,c,e,b,d)},sjcl.ecc.asyncDelay)},multJacAsync:function(c,d,f,b,e){var a=sjcl.ecc.point.prototype.multJacAsyncDone;c.multAsync(d,b,f,b,e,a)},multJacAsyncDone:function(h,g,e){var d=e.i;var c=e.j;var a=e.k;var b=e.out;e=e.transport_carrier;for(d=a.length-1;d>=0;d--){for(c=sjcl.bn.prototype.radix-4;c>=0;c-=4){b=b.doubl().doubl().doubl().doubl().add(h[a[d]>>c&15])}}var f=b;setTimeout(function(){sjcl.ecc.point.prototype.toAffineAsync(f,g,e)},sjcl.ecc.asyncDelay)},toAffineAsync:function(b,d,a){var c=b.toAffine();setTimeout(function(){sjcl.ecc.point.prototype.multAsyncDone(c,d,a)},sjcl.ecc.asyncDelay)},multAsyncDone:function(c,b,a){b(c,a)},mult2:function(a,c,b){return this.toJac().mult2(a,this,c,b).toAffine()},mult2Async:function(c,g,e,d,f){var a=d.toJac();var b={callback:sjcl.ecc.point.prototype.multjac2AsyncDone};setTimeout(function(){a.mult2Async(c,d,g,e,b,f)},sjcl.ecc.asyncDelay)},multjac2AsyncDone:function(c,a,b){var d=c.toAffine();setTimeout(function(){b.inner_callback(d,b)},sjcl.ecc.asyncDelay)},multiples:function(){var a,c,b;if(this._multiples===undefined){b=this.toJac().doubl();a=this._multiples=[new sjcl.ecc.point(this.curve),this,b.toAffine()];for(c=3;c<16;c++){b=b.add(this);a.push(b.toAffine())}}return this._multiples},multiplesAsync:function(b,f,e){var a,d,c;if(b._multiples===undefined){c=b.toJac().doubl();a=b._multiples=[new sjcl.ecc.point(b.curve),b,c.toAffine()];d=3;setTimeout(function(){sjcl.ecc.point.prototype.multiplesAsyncLoop(a,c,d,b,f,e)},sjcl.ecc.asyncDelay)}else{setTimeout(function(){f(b._multiples,e)},sjcl.ecc.asyncDelay)}},multiplesAsyncLoop:function(b,c,d,a,f,e){c=c.add(a);b.push(c.toAffine());a._multiples=b;d=d+1;if(d<16){setTimeout(function(){sjcl.ecc.point.prototype.multiplesAsyncLoop(b,c,d,a,f,e)},sjcl.ecc.asyncDelay)}else{setTimeout(function(){f(a._multiples,e)},sjcl.ecc.asyncDelay)}},isValid:function(){return this.y.square().equals(this.curve.b.add(this.x.mul(this.curve.a.add(this.x.square()))))},toBits:function(){return sjcl.bitArray.concat(this.x.toBits(),this.y.toBits())}};sjcl.ecc.pointJac=function(c,a,d,b){if(a===undefined){this.isIdentity=true}else{this.x=a;this.y=d;this.z=b;this.isIdentity=false}this.curve=c};sjcl.ecc.pointJac.prototype={add:function(e){var g=this,f,k,i,h,b,a,o,n,m,l,j;if(g.curve!==e.curve){throw ("sjcl.ecc.add(): Points must be on the same curve to add them!")}if(g.isIdentity){return e.toJac()}else{if(e.isIdentity){return g}}f=g.z.square();k=e.x.mul(f).subM(g.x);if(k.equals(0)){if(g.y.equals(e.y.mul(f.mul(g.z)))){return g.doubl()}else{return new sjcl.ecc.pointJac(g.curve)}}i=e.y.mul(f.mul(g.z)).subM(g.y);h=k.square();b=i.square();a=k.square().mul(k).addM(g.x.add(g.x).mul(h));o=b.subM(a);n=g.x.mul(h).subM(o).mul(i);m=g.y.mul(k.square().mul(k));l=n.subM(m);j=g.z.mul(k);return new sjcl.ecc.pointJac(this.curve,o,l,j)},doubl:function(){if(this.isIdentity){return this}var g=this.y.square(),f=g.mul(this.x.mul(4)),e=g.square().mul(8),h=this.z.square(),k=this.x.sub(h).mul(3).mul(this.x.add(h)),d=k.square().subM(f).subM(f),j=f.sub(d).mul(k).subM(e),i=this.y.add(this.y).mul(this.z);return new sjcl.ecc.pointJac(this.curve,d,j,i)},toAffine:function(){if(this.isIdentity||this.z.equals(0)){return new sjcl.ecc.point(this.curve)}var b=this.z.inverse(),a=b.square();return new sjcl.ecc.point(this.curve,this.x.mul(a).fullReduce(),this.y.mul(a.mul(b)).fullReduce())},mult:function(a,e){if(typeof(a)==="number"){a=[a]}else{if(a.limbs!==undefined){a=a.normalize().limbs}}var d,c,b=new sjcl.ecc.point(this.curve).toJac(),f=e.multiples();for(d=a.length-1;d>=0;d--){for(c=sjcl.bn.prototype.radix-4;c>=0;c-=4){b=b.doubl().doubl().doubl().doubl().add(f[a[d]>>c&15])}}return b},multAsync:function(b,f,m,l,h,a){if(typeof(b)==="number"){b=[b]}else{if(b.limbs!==undefined){b=b.normalize().limbs}}var e=new sjcl.ecc.point(this.curve).toJac();var d=new sjcl.ecc.point(this.curve).toJac();var c=new sjcl.ecc.point(this.curve).toJac();var g={transport_carrier:h,transport_callback:m,callback:a,i:e,j:d,k:b,out:c};m=sjcl.ecc.pointJac.prototype.multiplesAsyncDone;setTimeout(function(){f.multiplesAsync(l,m,g)},sjcl.ecc.asyncDelay)},multiplesAsyncDone:function(d,b){var c=b.transport_callback;var a=b.callback;a(d,c,b)},mult2:function(k,g,h,b){if(typeof(k)==="number"){k=[k]}else{if(k.limbs!==undefined){k=k.normalize().limbs}}if(typeof(h)==="number"){h=[h]}else{if(h.limbs!==undefined){h=h.normalize().limbs}}var f,d,e=new sjcl.ecc.point(this.curve).toJac(),m=g.multiples(),l=b.multiples(),c,a;for(f=Math.max(k.length,h.length)-1;f>=0;f--){c=k[f]|0;a=h[f]|0;for(d=sjcl.bn.prototype.radix-4;d>=0;d-=4){e=e.doubl().doubl().doubl().doubl().add(m[c>>d&15]).add(l[a>>d&15])}}return e},mult2Async:function(l,g,h,b,n,k){if(typeof(l)==="number"){l=[l]}else{if(l.limbs!==undefined){l=l.normalize().limbs}}if(typeof(h)==="number"){h=[h]}else{if(h.limbs!==undefined){h=h.normalize().limbs}}var f=new sjcl.ecc.point(this.curve).toJac();var e=new sjcl.ecc.point(this.curve).toJac();var d=new sjcl.ecc.point(this.curve).toJac();var m=g.multiples();var c={k1:l,k2:h,affine:g,affine2:b,i:f,j:e,out:d,m1:m};var a=sjcl.ecc.pointJac.prototype.mult2MultiplesAsync;setTimeout(function(){a(c,n,k)},sjcl.ecc.asyncDelay)},mult2MultiplesAsync:function(c,p,l){var n=c;var m=n.k1;var k=n.k2;var g=n.affine;var a=n.affine2;var f=n.i;var e=n.j;var d=n.out;var o=n.m1;var b=sjcl.ecc.pointJac.prototype.mult2MultiplesAsyncDone;var h={jaccarrier:c,innercarrier:p,carrier:l};setTimeout(function(){sjcl.ecc.point.prototype.multiplesAsync(a,b,h)},sjcl.ecc.asyncDelay)},mult2MultiplesAsyncDone:function(c,n){var d=n.jaccarrier;var r=n.innercarrier;var l=n.carrier;var o=d;var m=o.k1;var k=o.k2;var h=o.affine;var b=o.affine2;var g=o.i;var f=o.j;var e=o.out;var q=o.m1;var p=c;d={k1:m,k2:k,affine:h,affine2:b,i:g,j:f,out:e,m1:q,m2:p};var a=sjcl.ecc.pointJac.prototype.mult2LoopAsync;setTimeout(function(){a(d,r,l)},sjcl.ecc.asyncDelay)},mult2LoopAsync:function(d,r,l){var n=d;var m=n.k1;var k=n.k2;var h=n.affine;var b=n.affine2;var g=n.i;var f=n.j;var e=n.out;var q=n.m1;var p=n.m2;var c;var a;for(g=Math.max(m.length,k.length)-1;g>=0;g--){c=m[g]|0;a=k[g]|0;for(f=sjcl.bn.prototype.radix-4;f>=0;f-=4){e=e.doubl().doubl().doubl().doubl().add(q[c>>f&15]).add(p[a>>f&15])}}var o=r.callback;setTimeout(function(){o(e,r,l)},sjcl.ecc.asyncDelay)},isValid:function(){var c=this.z.square(),b=c.square(),a=b.mul(c);return this.y.square().equals(this.curve.b.mul(a).add(this.x.mul(this.curve.a.mul(b).add(this.x.square()))))}};sjcl.ecc.curve=function(f,g,e,d,c,h){this.field=f;this.r=f.prototype.modulus.sub(g);this.a=new f(e);this.b=new f(d);this.G=new sjcl.ecc.point(this,new f(c),new f(h))};sjcl.ecc.curve.prototype.fromBits=function(c){var b=sjcl.bitArray;var a=this.field.prototype.exponent+7&-8;var d=new sjcl.ecc.point(this,this.field.fromBits(b.bitSlice(c,0,a)),this.field.fromBits(b.bitSlice(c,a,2*a)));if(!d.isValid()){throw new sjcl.exception.corrupt("not on the curve!")}return d};sjcl.ecc.curves={c192:new sjcl.ecc.curve(sjcl.bn.prime.p192,"0x662107c8eb94364e4b2dd7ce",-3,"0x64210519e59c80e70fa7e9ab72243049feb8deecc146b9b1","0x188da80eb03090f67cbf20eb43a18800f4ff0afd82ff1012","0x07192b95ffc8da78631011ed6b24cdd573f977a11e794811"),c224:new sjcl.ecc.curve(sjcl.bn.prime.p224,"0xe95c1f470fc1ec22d6baa3a3d5c4",-3,"0xb4050a850c04b3abf54132565044b0b7d7bfd8ba270b39432355ffb4","0xb70e0cbd6bb4bf7f321390b94a03c1d356c21122343280d6115c1d21","0xbd376388b5f723fb4c22dfe6cd4375a05a07476444d5819985007e34"),c256:new sjcl.ecc.curve(sjcl.bn.prime.p256,"0x4319055358e8617b0c46353d039cdaae",-3,"0x5ac635d8aa3a93e7b3ebbd55769886bc651d06b0cc53b0f63bce3c3e27d2604b","0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296","0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5"),c384:new sjcl.ecc.curve(sjcl.bn.prime.p384,"0x389cb27e0bc8d21fa7e5f24cb74f58851313e696333ad68c",-3,"0xb3312fa7e23ee7e4988e056be3f82d19181d9c6efe8141120314088f5013875ac656398d8a2ed19d2a85c8edd3ec2aef","0xaa87ca22be8b05378eb1c71ef320ad746e1d3b628ba79b9859f741e082542a385502f25dbf55296c3a545e3872760ab7","0x3617de4a96262c6f5d9e98bf9292dc29f8f41dbd289a147ce9da3113b5f0b8c00a60b1ce1d7e819d7a431d7c90ea0e5f"),c521:new sjcl.ecc.curve(sjcl.bn.prime.p521,"0x5AE79787C40D069948033FEB708F65A2FC44A36477663B851449048E16EC79BF6",-3,"0x051953eb9618e1c9a1f929a21a0b68540eea2da725b99b315f3b8b489918ef109e156193951ec7e937b1652c0bd3bb1bf073573df883d2c34f1ef451fd46b503f00","0xc6858e06b70404e9cd9e3ecb662395b4429c648139053fb521f828af606b4d3dbaa14b5e77efe75928fe1dc127a2ffa8de3348b3c1856a429bf97e7e31c2e5bd66","0x11839296a789a3bc0045c8a5fb42c7d1bd998f54449579b446817afbd17273e662c97ee72995ef42640c550b9013fad0761353c7086a272c24088be94769fd16650")};sjcl.ecc._dh=function(a){sjcl.ecc[a]={publicKey:function(c,b){this._curve=c;this._curveBitLength=c.r.bitLength();if(b instanceof Array){this._point=c.fromBits(b)}else{this._point=b}this.get=function(){var f=this._point.toBits();var e=sjcl.bitArray.bitLength(f);var d=sjcl.bitArray.bitSlice(f,0,e/2);var g=sjcl.bitArray.bitSlice(f,e/2);return{x:d,y:g}}},secretKey:function(c,b){this._curve=c;this._curveBitLength=c.r.bitLength();this._exponent=b;this.get=function(){return this._exponent.toBits()}},generateKeys:function(e,d,b){if(e===undefined){e=256}if(typeof e==="number"){e=sjcl.ecc.curves["c"+e];if(e===undefined){throw new sjcl.exception.invalid("no such curve")}}if(b===undefined){var b=sjcl.bn.random(e.r,d)}var c=e.G.mult(b);return{pub:new sjcl.ecc[a].publicKey(e,c),sec:new sjcl.ecc[a].secretKey(e,b)}},generateKeysAsync:function(d,c,f,e){if(d===undefined){d=521}if(typeof d==="number"){d=sjcl.ecc.curves["c"+d];if(d===undefined){throw new sjcl.exception.invalid("no such curve")}}var b={callback:f,curve:d,outercarrier:e};setTimeout(function(){sjcl.ecc.elGamal.asyncSecretCurve(d.r,c,b)},sjcl.ecc.asyncDelay)},asyncSecretCurve:function(d,c,e){var b=sjcl.bn.random(d,c);setTimeout(function(){sjcl.ecc.elGamal.asyncPublicCurve(b,e)},sjcl.ecc.asyncDelay)},asyncPublicCurve:function(c,d){var b=this.asyncPublicCurveDone;var e={callback:d.callback,curve:d.curve,sec:c,outercarrier:d.outercarrier};if(d.curve.G._multiples!==undefined){d.curve.G._multiples=undefined}d.curve.G.multAsync(c,b,null,e)},asyncPublicCurveDone:function(b,c){setTimeout(function(){sjcl.ecc.elGamal.asyncFinalizeCurve(b,c.sec,c)},sjcl.ecc.asyncDelay)},asyncFinalizeCurve:function(c,b,d){c=new sjcl.ecc[a].publicKey(d.curve,c);b=new sjcl.ecc[a].secretKey(d.curve,b);d.callback({pub:c,sec:b},d.outercarrier)}}};sjcl.ecc._dh("elGamal");sjcl.ecc.elGamal.publicKey.prototype={kem:function(d){var c=sjcl.bn.random(this._curve.r,d),a=this._curve.G.mult(c).toBits(),b=sjcl.hash.sha256.hash(this._point.mult(c).toBits());return{key:b,tag:a}},kemAsync:function(d,g,f){var b=sjcl.bn.random(this._curve.r,d);var a=this.kemAsyncTagDone;var e=this._curve.G;var c={point:this._point,sec:b,callback:g,outercarrier:f};setTimeout(function(){e.multAsync(b,a,null,c)},sjcl.ecc.asyncDelay)},kemAsyncTagDone:function(c,e){var d=e.sec;var b=e.point;e={callback:e.callback,outercarrier:e.outercarrier};var a=c.toBits();setTimeout(function(){sjcl.ecc.elGamal.publicKey.prototype.kemAsyncDone(b,d,a,e)},sjcl.ecc.asyncDelay)},kemAsyncDone:function(b,e,a,f){var c=f.callback;var g=f.outercarrier;var d=sjcl.hash.sha256.hash(b.mult(e).toBits());setTimeout(function(){c({key:d,tag:a},g)},sjcl.ecc.asyncDelay)}};sjcl.ecc.elGamal.secretKey.prototype={unkem:function(a){return sjcl.hash.sha256.hash(this._curve.fromBits(a).mult(this._exponent).toBits())},unkemAsync:function(a,f,e){var b=this._curve.fromBits(a);var c={callback:f,outercarrier:e};var d=this._exponent;b.multAsync(d,sjcl.ecc.elGamal.secretKey.prototype.unkemAsyncMultDone,null,c)},unkemAsyncMultDone:function(b,a){var c=b.toBits();setTimeout(function(){sjcl.ecc.elGamal.secretKey.prototype.umkemAsyncHash(c,a)},sjcl.ecc.asyncDelay)},umkemAsyncHash:function(c,b){var a=sjcl.hash.sha256.hash(c);setTimeout(function(){sjcl.ecc.elGamal.secretKey.prototype.unkemAsyncDone(a,b.callback,b)},sjcl.ecc.asyncDelay)},unkemAsyncDone:function(b,c,a){c(b,a.outercarrier)},dh:function(a){return sjcl.hash.sha256.hash(a._point.mult(this._exponent).toBits())},dhAsync:function(a,c){var b={callback:c};a._point.multAsync(this._exponent,sjcl.ecc.elGamal.secretKey.prototype.dhAsyncMultDone,null,b)},dhAsyncMultDone:function(b,a){var c=b.toBits();setTimeout(function(){sjcl.ecc.elGamal.secretKey.prototype.dhAsyncHash(c,a)},sjcl.ecc.asyncDelay)},dhAsyncHash:function(c,b){var a=sjcl.hash.sha256.hash(c);setTimeout(function(){sjcl.ecc.elGamal.secretKey.prototype.dhAsyncDone(a,b.callback)},sjcl.ecc.asyncDelay)},dhAsyncDone:function(a,b){b(a)}};sjcl.ecc._dh("ecdsa");sjcl.ecc.ecdsa.secretKey.prototype={sign:function(f,h,b,c){if(sjcl.bitArray.bitLength(f)>this._curveBitLength){f=sjcl.bitArray.clamp(f,this._curveBitLength)}var g=this._curve.r,d=g.bitLength(),e=c||sjcl.bn.random(g.sub(1),h).add(1),a=this._curve.G.mult(e).x.mod(g),j=sjcl.bn.fromBits(f).add(a.mul(this._exponent)),i=b?j.inverseMod(g).mul(e).mod(g):j.mul(e.inverseMod(g)).mod(g);return sjcl.bitArray.concat(a.toBits(d),i.toBits(d))},signAsync:function(d,g,h,j){var e=this._curve.r;var a=e.bitLength();var c=sjcl.bn.random(e.sub(1),g).add(1);var i=this._curve.G;var b=this._exponent;var f={callback:h,R:e,l:a,k:c,exp:b,hash:d,outercarrier:j};setTimeout(function(){i.multAsync(c,sjcl.ecc.ecdsa.secretKey.prototype.signAsyncMultDone,null,f)},sjcl.ecc.asyncDelay)},signAsyncMultDone:function(b,c){b=b.x.mod(c.R);var a=sjcl.bn.fromBits(c.hash).add(b.mul(c.exp)).inverseMod(c.R).mul(c.k).mod(c.R);c={callback:c.callback,l:c.l,s:a,r:b,outercarrier:c.outercarrier};setTimeout(function(){sjcl.ecc.ecdsa.secretKey.prototype.signAsyncConcat(c)},sjcl.ecc.asyncDelay)},signAsyncConcat:function(d){var a=d.l;var b=d.s;var c=d.r;var e=sjcl.bitArray.concat(c.toBits(a),b.toBits(a));setTimeout(function(){sjcl.ecc.ecdsa.secretKey.prototype.signAsyncDone(e,d.callback,d.outercarrier)},sjcl.ecc.asyncDelay)},signAsyncDone:function(a,c,b){c(a,b)}};sjcl.ecc.ecdsa.publicKey.prototype={verify:function(f,e,b){if(sjcl.bitArray.bitLength(f)>this._curveBitLength){f=sjcl.bitArray.clamp(f,this._curveBitLength)}var i=sjcl.bitArray,g=this._curve.r,d=this._curveBitLength,a=sjcl.bn.fromBits(i.bitSlice(e,0,d)),m=sjcl.bn.fromBits(i.bitSlice(e,d,2*d)),k=b?m:m.inverseMod(g),h=sjcl.bn.fromBits(f).mul(k).mod(g),j=a.mul(k).mod(g),c=this._curve.G.mult2(h,j,this._point).x;if(a.equals(0)||m.equals(0)||a.greaterEquals(g)||m.greaterEquals(g)||!c.equals(a)){if(b===undefined){return this.verify(f,e,true)}else{return false}}return true},verifyAsync:function(f,e,n,o){var k=sjcl.bitArray;var g=this._curve.r;var d=g.bitLength();var a=sjcl.bn.fromBits(k.bitSlice(e,0,d));var q=sjcl.bn.fromBits(k.bitSlice(e,d,2*d));var i=sjcl.bn.fromBits(f).mul(q).mod(g);var p=a.mul(q).mod(g);var j=this._point;var m=this._curve.G;var c=sjcl.ecc.ecdsa.publicKey.prototype.verifyAsyncMult2Done;var h={callback:n,inner_callback:c,w:k,R:g,l:d,r:a,s:q,hG:i,hA:p,point:j,G:m,outercarrier:o};var b=sjcl.ecc.ecdsa.publicKey.prototype.verifyAsyncMult2;setTimeout(function(){b(h)},sjcl.ecc.asyncDelay)},verifyAsyncMult2:function(e){var h=e.w;var d=e.R;var c=e.l;var a=e.r;var k=e.s;var f=e.hG;var j=e.hA;var g=e.point;var i=e.G;var b=e.inner_callback;setTimeout(function(){i.mult2Async(f,j,g,i,e)},sjcl.ecc.asyncDelay)},verifyAsyncMult2Done:function(b,f){var c=b.x;var h=f.w;var e=f.R;var d=f.l;var a=f.r;var k=f.s;var g=f.hG;var j=f.hA;var i=f.callback;if(a.equals(0)||k.equals(0)||a.greaterEquals(e)||k.greaterEquals(e)||!c.equals(a)){i(false,f.outercarrier)}else{i(true,f.outercarrier)}}};sjcl.keyexchange.srp={makeVerifier:function(b,d,c,e){var a;a=sjcl.keyexchange.srp.makeX(b,d,c);a=sjcl.bn.fromBits(a);return e.g.powermod(a,e.N)},makeX:function(b,d,c){var a=sjcl.hash.sha1.hash(b+":"+d);return sjcl.hash.sha1.hash(sjcl.bitArray.concat(c,a))},knownGroup:function(a){if(typeof a!=="string"){a=a.toString()}if(!sjcl.keyexchange.srp._didInitKnownGroups){sjcl.keyexchange.srp._initKnownGroups()}return sjcl.keyexchange.srp._knownGroups[a]},_didInitKnownGroups:false,_initKnownGroups:function(){var b,a,c;for(b=0;b<sjcl.keyexchange.srp._knownGroupSizes.length;b++){a=sjcl.keyexchange.srp._knownGroupSizes[b].toString();c=sjcl.keyexchange.srp._knownGroups[a];c.N=new sjcl.bn(c.N);c.g=new sjcl.bn(c.g)}sjcl.keyexchange.srp._didInitKnownGroups=true},_knownGroupSizes:[1024,1536,2048],_knownGroups:{1024:{N:"EEAF0AB9ADB38DD69C33F80AFA8FC5E86072618775FF3C0B9EA2314C9C256576D674DF7496EA81D3383B4813D692C6E0E0D5D8E250B98BE48E495C1D6089DAD15DC7D7B46154D6B6CE8EF4AD69B15D4982559B297BCF1885C529F566660E57EC68EDBC3C05726CC02FD4CBF4976EAA9AFD5138FE8376435B9FC61D2FC0EB06E3",g:2},1536:{N:"9DEF3CAFB939277AB1F12A8617A47BBBDBA51DF499AC4C80BEEEA9614B19CC4D5F4F5F556E27CBDE51C6A94BE4607A291558903BA0D0F84380B655BB9A22E8DCDF028A7CEC67F0D08134B1C8B97989149B609E0BE3BAB63D47548381DBC5B1FC764E3F4B53DD9DA1158BFD3E2B9C8CF56EDF019539349627DB2FD53D24B7C48665772E437D6C7F8CE442734AF7CCB7AE837C264AE3A9BEB87F8A2FE9B8B5292E5A021FFF5E91479E8CE7A28C2442C6F315180F93499A234DCF76E3FED135F9BB",g:2},2048:{N:"AC6BDB41324A9A9BF166DE5E1389582FAF72B6651987EE07FC3192943DB56050A37329CBB4A099ED8193E0757767A13DD52312AB4B03310DCD7F48A9DA04FD50E8083969EDB767B0CF6095179A163AB3661A05FBD5FAAAE82918A9962F0B93B855F97993EC975EEAA80D740ADBF4FF747359D041D5C33EA71D281E446B14773BCA97B43A23FB801676BD207A436C6481F1D2B9078717461A5B9D32E688F87748544523B524B0D57D5EA77A2775D2ECFA032CFBDBF52FB3786160279004E57AE6AF874E7303CE53299CCC041C7BC308D82A5698F3A8D0C38271AE35F8E9DBFBB694B5C803D89F7AE435DE236D525F54759B65E372FCD68EF20FA7111F9E4AFF73",g:2}}};;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
var Crypto = require("./slide/crypto")["default"];
var Channel = require("./slide/channel")["default"];

$('body').append('<div class="modal fade" id="modal" tabindex="-1" role="dialog" aria-labelledby="modal-label" aria-hidden="true"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button><h4 class="modal-title text-center" id="modal-label">slide</h4></div><div class="modal-body"></div></div></div></div>');

window.Slide = {
    host: 'api-sandbox.slide.life',

    crypto: new Crypto(),

    extractBlocks: function (form) {
        return form.find('*').map(function () {
            return $(this).attr('data-slide');
        }).toArray();
    },

    populateFields: function (form, fields, cipherkey, sec) {
        form.find('*').each(function () {
            var field = $(this).attr('data-slide');
            if (!!field && fields[field]) {
                Slide.crypto.decryptString(fields[field], cipherkey, sec, function(clear, carry) {
                    $(this).val(clear);
                }, null);
            }
        });
    },

    createChannelFromForm: function (form, cb) {
        var blocks = this.extractBlocks(form);
        var channel = new Channel(blocks);
        channel.create(cb);
    },

    getBlocks: function (cb) {
        $.ajax({
            type: 'GET',
            url: 'http://' + Slide.host + '/blocks',
            contentType: 'application/json',
            success: cb
        });
    },

    Channel: Channel
};
},{"./slide/channel":2,"./slide/crypto":3}],2:[function(require,module,exports){
"use strict";
function Channel (blocks) {
    this.blocks = blocks;
    return this;
}

Channel.prototype.create = function (cb) {
    var self = this;
    Slide.crypto.generateKeys(384, '', function (keys, carry) {
        self.publicKey = keys.pub;
        self.privateKey = keys.sec;
        $.ajax({
            type: 'POST',
            url: 'http://' + Slide.host + '/channels',
            contentType: 'application/json',
            data: JSON.stringify({
                key: self.publicKey,
                blocks: self.blocks
            }),
            success: function (data) {
                self.id = data.id;

                if (!!cb.onCreate) {
                    cb.onCreate();
                }

                if (!!cb.listen) {
                    if (cb.listen === true) {
                        self.listen();
                    } else {
                        self.listen(cb.listen);
                    }
                }
            }
        });
    }, null, this);
}

Channel.prototype.getWSURL = function () {
    return 'ws://' + Slide.host + '/channels/' + this.id + '/listen';
};

Channel.prototype.getURL = function () {
    return 'http://' + Slide.host + '/channels/' + this.id;
};

Channel.prototype.getQRCodeURL = function () {
    return this.getURL() + '/qr';
};

Channel.prototype.updateState = function (state, cb) {
    $.ajax({
        type: 'PUT',
        url: this.getURL(),
        contentType: 'application/json',
        data: JSON.stringify({
            open: state
        }),
        success: cb
    });
};

Channel.prototype.open = function (cb) {
    this.updateState(true, cb);
};

Channel.prototype.close = function (cb) {
    this.updateState(false, cb);
};

Channel.prototype.listen = function (cb) {
    var socket = new WebSocket(this.getWSURL());
    var self = this;
    socket.onmessage = function (event) {
        cb(JSON.parse(event.data), self.privateKey);
    };
};

Channel.prototype.prompt = function (cb) {
    this.create({
        onCreate: function () {
            var frame = $('<iframe/>', {
                src: 'http://localhost:8000/frames/prompt.html?bucket=' + this.id,
                id: 'slide-bucket-frame'
            });
            $('#modal .modal-body').append(frame);
            $('#modal').modal('toggle');
        },
        listen: function () {
            $('#modal').modal('toggle');
            frame.remove();
        }
    });
};

exports["default"] = Channel;
},{}],3:[function(require,module,exports){
"use strict";
exports["default"] = function () {
    this.symmetricAlgorithm = "aes-twofish";
    this.asyncTimeout = 10;

    this.generateKeys = function(bits, pass, callback, carry, depth) {
        depth = typeof depth !== 'undefined' ? depth : 0;
        pass = typeof pass !== 'undefined' ? pass : ''; //in case of pin
        Slide.crypto.generateKeysF(bits, pass, function(keys, carry) {
            if (keys == null && depth < 3) {
                Slide.crypto.generateKeys(bits, pass, callback, carry, depth + 1);
            } else {
                callback(keys, carry);
            }
        }, carry);
    };

    this.generateKeysF = function(bits, pass, callback, carry) {
        var carrier = {"callback": callback, "outercarrier": carry};
        carrier.bits = bits; carrier.pass = pass;
        if (bits != 192 && bits != 224 && bits != 256 && bits != 384 && bits != 512) {
            bits = 512;
        }
        if (bits == 384) {
            sjcl.ecc.elGamal.generateKeysAsync(192, 10, function(keys, carrier) {
                sjcl.ecc.elGamal.generateKeysAsync(384, 10, function(keys, carrier) {
                    setTimeout(function() {
                        Slide.crypto.processKeys(keys, carrier);
                    }, Slide.crypto.asyncTimeout);
                }, carrier);
            }, carrier);
        } else {
            sjcl.ecc.elGamal.generateKeysAsync(bits, 10, function(keys, carrier) {
                setTimeout(function() {
                    Slide.crypto.processKeys(keys, carrier);
                }, Slide.crypto.asyncTimeout);
            }, carrier);
        }
    };

    this.processKeys = function(keys, carrier) {
        var sec = Slide.crypto.serializeSecretKey(keys.sec);
        var pub = Slide.crypto.serializePublicKey(keys.pub);
        var val = Slide.crypto.checkKeypair(keys.pub, sec);
        if (!val) {
            var cb = carrier.callback;
            carrier = carrier.outercarrier;
            setTimeout(function() {
                cb(null, carrier);
            }, Slide.crypto.asyncTimeout);
            return;
        }
        carrier.pub = pub;
        carrier.sec = sec;
        setTimeout(function() {
            Slide.crypto.processKeysF(carrier);
        }, Slide.crypto.asyncTimeout);
    };

    this.processKeysF = function(carrier) {
        var pass = carrier.pass;//unused
        var pub = carrier.pub;
        var sec = carrier.sec;
        var keys = {pub: pub,
            sec: sec};
        var cb = carrier.callback;
        carrier = carrier.outercarrier;
        setTimeout(function() {
            cb(keys, carrier);
        }, Slide.crypto.asyncTimeout);
    };

    this.randomKeyString = function(len) {
        var result = '';
        var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (var i = 0; i < len; i++) {
            result += chars[Math.round(Math.random() * (chars.length - 1))];
        }
        return result;
    };

    //TODO: modularize this as well
    this.encryptData = function(data, pubkey, callback, carry) {
        var rand = Slide.crypto.randomKeyString(64);
        var pk = (typeof pubkey == "string") ? Slide.crypto.deserializePublicKey(pubkey) : pubkey;
        var carrier = {
            "cleartext": data,
            "callback": callback,
            "outercarrier": carry,
            "rand": rand,
            "pubkey": pk,
            "enckey": new Object()
        };
        setTimeout(function(){
            Slide.crypto.encryptDataF(carrier);
        }, Slide.crypto.asyncTimeout);
    };

    this.encryptDataF = function(carrier) {
        var pk = carrier.pubkey;
        Slide.crypto.kemAsync(pk, function(symkey, carrier) {
            var enckey = Slide.crypto.symEncrypt(carrier.rand, symkey.key);
            var keyhash = Slide.crypto.hashPublicKey(pk);
            carrier.enckey = { enckey: enckey, keytag: symkey.tag, keyhash: keyhash };
            var ret = { key: Slide.crypto.deserializePublicKey(pk), cipherkey: carrier.enckey, fields: new Object() };
            for (var k in carrier.cleartext) {
                Slide.crypto.symEncryptAsync(carrier.cleartext[k], carrier.rand, function(ciphertext, carrier) {
                    ret.fields[k] = ciphertext;
                }, carrier);
            }
            carrier.callback(ret, carrier.outercarrier);
        }, carrier);
    };

    this.encryptString = function(text, pubkey, callback, carry) {
        var rand = Slide.crypto.randomKeyString(64);
        var pk = (typeof pubkey == "string") ? Slide.crypto.deserializePublicKey(pubkey) : pubkey;
        var carrier = {
            "cleartext": text,
            "callback": callback,
            "outercarrier": carry,
            "rand": rand,
            "pubkey": pk,
            "enckey": new Object()
        };
        setTimeout(function(){
            Slide.crypto.encryptStringF(carrier);
        }, Slide.crypto.asyncTimeout);
    };

    this.encryptStringF = function(carrier) {
        var pk = carrier.pubkey;
        Slide.crypto.kemAsync(pk, function(symkey, carrier) {
            var enckey = Slide.crypto.symEncrypt(carrier.rand, symkey.key);
            var keyhash = Slide.crypto.hashPublicKey(pk);
            carrier.enckey = { enckey: enckey, keytag: symkey.tag, keyhash: keyhash };
            Slide.crypto.symEncryptAsync(carrier.cleartext, carrier.rand, function(ciphertext, carrier) {
                var msg = { "enckey": carrier.enckey, "ciphertext": ciphertext };
                setTimeout(function() {
                    carrier.callback(msg, carrier.outercarrier);
                }, Slide.crypto.asyncTimeout);
            }, carrier);
        }, carrier);
    };

    this.encryptDataSync = function(data, pubkey) {
        var rand = Slide.crypto.randomKeyString(64);
        var pk = (typeof pubkey == "string") ? Slide.crypto.deserializePublicKey(pubkey) : pubkey;
        var keyData = pk.kem();
        var key = sjcl.codec.hex.fromBits(keyData.key);
        var tag = sjcl.codec.hex.fromBits(keyData.tag);
        var enckey = Slide.crypto.symEncrypt(rand, key);
        var keyhash = Slide.crypto.hashPublicKey(pk);
        var ret = { key: pk,
            cipherkey: {
                enckey: enckey,
                keytag: tag,
                keyhash: keyhash
            },
            fields: new Object()
        };
        for (var k in data) {
            ret.fields[k] = Slide.crypto.symEncrypt(data[k], rand);
        }
        return ret;
    };

    this.kemAsync = function(pub, cb, carrier) {
        //fuck it
        var keyData = pub.kem();
        cb({
            key: sjcl.codec.hex.fromBits(keyData.key),
            tag: sjcl.codec.hex.fromBits(keyData.tag)
        }, carrier);
    };

    this.symEncrypt = function(rand, sym) {
        return sjcl.encrypt(sym, rand);
    };

    this.symEncryptAsync = function(text, rand, cb, carrier) {
        //fuck it
        cb(Slide.crypto.symEncrypt(text, rand), carrier);
    };

    this.hashPublicKey = function(pub) {
        var hash1, hash2, c = 0;
        do {
            hash1 = sjcl.hash.sha1.hash(pub);
            hash1 = sjcl.codec.hex.fromBits(hash1);
            hash2 = sjcl.hash.sha1.hash(pub);
            hash2 = sjcl.codec.hex.fromBits(hash2);
            c++;
        } while (hash1 != hash2 && c <= 3);
        return hash1;
    };

    this.decryptString = function(text, cipherkey, sec, cb, carrier) {
        //decrypt enckey -sym> rand
        //decrypt text -rand> clear
        sec = Slide.crypto.deserializeSecretKey(sec);
        var sym = sec.unkem(sjcl.codec.hex.toBits(cipherkey.keytag));
        var rand = sjcl.decrypt(sjcl.codec.hex.fromBits(sym), cipherkey.enckey);
        setTimeout(function() {
            cb(sjcl.decrypt(rand, text), carrier);
        }, Slide.crypto.asyncTimeout);
    };

    this.serializeSecretKey = function(sec) {
        var exponent = sec._exponent.toBits();
        var curve = sec._curve.b.exponent;
        var sec_json = {exponent: exponent, curve: curve};
        return JSON.stringify(sec_json);
    };

    this.deserializeSecretKey = function(sec) {
        sec = JSON.parse(sec);
        var exponent = sec.exponent;
        var curve = sec.curve;
        exponent = sjcl.bn.fromBits(exponent);
        var sec_obj = new sjcl.ecc.elGamal.secretKey(sjcl.ecc.curves['c' + curve], exponent);
        return sec_obj;
    }

    this.serializePublicKey = function(pub) {
        var point = pub._point.toBits();
        var curve = pub._curve.b.exponent;
        var pub_json = {point: point, curve: curve};
        return JSON.stringify(pub_json);
    };

    this.deserializePublicKey = function(pub) {
        pub = JSON.parse(pub);
        var bits = pub.point;
        var curve = pub.curve;
        var point = sjcl.ecc.curves['c'+curve].fromBits(bits);
        var pubkey = new sjcl.ecc.elGamal.publicKey(point.curve, point);
        return pubkey;
    };

    this.checkKeypair = function(pub, sec) {
        var v_pub = Slide.crypto.checkPublicKey(pub);
        var v_sec = Slide.crypto.checkSecretKey(sec);
        return (v_pub && v_sec);
    };

    this.checkPublicKey = function(pub) {
        try {
            return pub._point.isValid();
        } catch (e) {
            return false;
        }
    };

    this.checkSecretKey = function(sec) {
        if (typeof sec == "String" || typeof sec == "string") {
            try {
                var dser = Slide.crypto.deserializeSecretKey(sec);
                return ((typeof dser == "object" || typeof dser == "Object") && dser != null);
            } catch (e) {
                return false;
            }
        } else {
            try {
                var ser = Slide.crypto.serializeSecretKey(sec);
                var dser = Slide.crypto.deserializeSecretKey(ser);
                return ((typeof dser == "object" || typeof dser == "Object") && dser != null);
            } catch (e) {
                return false;
            }
        }
    };
};
},{}]},{},[1])