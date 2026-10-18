export const clone=x=>JSON.parse(JSON.stringify(x));
export function ipv4(value){if(typeof value!=='string'||!/^\d{1,3}(\.\d{1,3}){3}$/.test(value))return null;const bytes=value.split('.').map(Number);return bytes.every(x=>x<=255)?bytes.reduce((n,b)=>(n*256+b)>>>0,0):null;}
export function maskValid(value){const n=ipv4(value);if(n===null)return false;const inv=(~n)>>>0;return ((inv&(inv+1))>>>0)===0;}
export function ipv6(value){if(typeof value!=='string'||value.includes(':::')||!value.includes(':'))return null;const halves=value.toLowerCase().split('::');if(halves.length>2)return null;const a=halves[0]?halves[0].split(':'):[],b=halves[1]?halves[1].split(':'):[];if(![...a,...b].every(x=>/^[\da-f]{1,4}$/.test(x)))return null;const missing=8-a.length-b.length;if(halves.length===1&&missing!==0||halves.length===2&&missing<1)return null;return [...a,...Array(halves.length===2?missing:0).fill('0'),...b].map(x=>Number.parseInt(x,16));}
export const same6=(a,b)=>{const x=ipv6(a),y=ipv6(b);return !!x&&!!y&&x.every((v,i)=>v===y[i]);};
const sameSubnet=(a,b,mask)=>{const n=ipv4(a),m=ipv4(b),k=ipv4(mask);return n!==null&&m!==null&&maskValid(mask)&&((n&k)>>>0)===((m&k)>>>0);};
function iface(ip='unassigned',up=false){return {ip,mask:'255.255.255.0',ipv6:'',prefix:64,up};}
function device(name,type){return {name,type,mode:'user',port:'',line:'',interfaces:type==='router'?{'gigabitethernet0/0':iface(),'gigabitethernet0/1':iface()}:type==='switch'?{'vlan1':iface(),'fastethernet0/1':iface('unassigned',true),'fastethernet0/2':iface('unassigned',true)}:{},gateway:'',secret:'',domain:'',username:'',password:'',rsa:false,ssh:1,loginLocal:false,sshOnly:false,ipv6Routing:false,saved:false};}
export function createState(lab){const devices={R1:device('R1','router'),S1:device('S1','switch'),S2:device('S2','switch'),'PC-A':{...device('PC-A','pc'),ip:'192.168.10.10',mask:'255.255.255.0',gateway:'192.168.10.1',ipv6:'2001:db8:10::10',prefix:64,gateway6:'2001:db8:10::1'},'PC-B':{...device('PC-B','pc'),ip:'192.168.20.10',mask:'255.255.255.0',gateway:'192.168.20.1',ipv6:'2001:db8:20::10',prefix:64,gateway6:'2001:db8:20::1'}};
devices.R1.interfaces['gigabitethernet0/0']=iface('192.168.10.1',true);devices.R1.interfaces['gigabitethernet0/1']=iface('192.168.20.1',true);devices.R1.interfaces['gigabitethernet0/0'].ipv6='2001:db8:10::1';devices.R1.interfaces['gigabitethernet0/1'].ipv6='2001:db8:20::1';devices.R1.ipv6Routing=true;
if(['router','challenge'].includes(lab.kind))Object.values(devices.R1.interfaces).forEach(x=>{x.ip='unassigned';x.up=false;});
if(lab.kind==='ipv6'){devices.R1.ipv6Routing=false;Object.values(devices.R1.interfaces).forEach(x=>x.ipv6='');}
if(['troubleshoot','challenge'].includes(lab.kind))devices['PC-A'].gateway='192.168.10.254';
if(lab.kind==='connect')devices['PC-A'].ip='192.168.30.10';
return {version:1,labId:lab.id,devices,links:[true,true,true,true].map(x=>lab.kind==='physical'?false:x),arp:{},events:[],visited:[],pingOK:false,traceOK:false,quizOK:false,subnetOK:false,subnetAnswers:[],observed:false};}
export function ping(state,source,target){const d=state.devices[source],a=state.devices['PC-A'],b=state.devices['PC-B'],r=state.devices.R1;const v6=target.includes(':');const dest=Object.keys(state.devices).find(k=>{const t=state.devices[k];return t.type==='pc'&&(v6?same6(t.ipv6,target):t.ip===target);});if(!dest||d.type!=='pc')return {ok:false,message:'Destination unreachable (educational model: use PC-A or PC-B as source and a PC address as destination).'};
if(dest===source)return {ok:true,message:`Reply from ${target}: self-test OK`};
const left=source==='PC-A',srcPort=r.interfaces[left?'gigabitethernet0/0':'gigabitethernet0/1'],dstPort=r.interfaces[left?'gigabitethernet0/1':'gigabitethernet0/0'],peer=state.devices[dest];
let ok=state.links.every(Boolean)&&srcPort.up&&dstPort.up;
if(v6){const sp=ipv6(srcPort.ipv6),dp=ipv6(dstPort.ipv6),ds=ipv6(d.ipv6),ps=ipv6(peer.ipv6);ok=ok&&r.ipv6Routing&&same6(d.gateway6,srcPort.ipv6)&&same6(peer.gateway6,dstPort.ipv6)&&d.prefix===64&&peer.prefix===64&&srcPort.prefix===64&&dstPort.prefix===64&&!!sp&&!!dp&&!!ds&&!!ps&&sp.slice(0,4).every((v,i)=>v===ds[i])&&dp.slice(0,4).every((v,i)=>v===ps[i]);}
else ok=ok&&d.gateway===srcPort.ip&&peer.gateway===dstPort.ip&&sameSubnet(d.ip,srcPort.ip,d.mask)&&sameSubnet(d.ip,srcPort.ip,srcPort.mask)&&sameSubnet(peer.ip,dstPort.ip,peer.mask)&&sameSubnet(peer.ip,dstPort.ip,dstPort.mask)&&!sameSubnet(a.ip,b.ip,a.mask)&&!sameSubnet(b.ip,a.ip,b.mask);
state.pingOK=!!ok;if(ok){state.arp[source]=v6?`${d.gateway6}  00D0.BA10.000${left?1:2}  REACH (NDP)`:`${d.gateway}  00D0.BA10.000${left?1:2}  dynamic`;state.events=[v6?'ICMPv6 Neighbor Solicitation → Neighbor Advertisement':'ARP Request → ARP Reply (gateway MAC)',`Ethernet → R1 → Ethernet (${v6?'IPv6':'IPv4'} forwarding)`,'ICMP Echo Request → Echo Reply'];}
return {ok:!!ok,message:ok?Array.from({length:4},()=>`Reply from ${target}: ${v6?'time<1ms':'bytes=32 time<1ms TTL=127'}`).join('\n'):'Request timed out.\nPackets: Sent = 4, Received = 0, Lost = 4 (100% loss)'};}
const portAliases={'g0/0':'gigabitethernet0/0','gi0/0':'gigabitethernet0/0','g0/1':'gigabitethernet0/1','gi0/1':'gigabitethernet0/1','vlan 1':'vlan1','vlan1':'vlan1','f0/1':'fastethernet0/1','f0/2':'fastethernet0/2'};
export function prompt(d){return `${d.name}${({user:'>',priv:'#',config:'(config)#',interface:'(config-if)#',line:'(config-line)#'})[d.mode]}`;}
function running(d){return `hostname ${d.name}\n${d.secret?'enable secret [configured]\n':''}${d.domain?'ip domain-name '+d.domain+'\n':''}${d.username?'username '+d.username+' secret [configured]\n':''}${d.ipv6Routing?'ipv6 unicast-routing\n':''}${Object.entries(d.interfaces).map(([p,v])=>`interface ${p}\n ${v.ip==='unassigned'?'no ip address':`ip address ${v.ip} ${v.mask}`}\n${v.ipv6?' ipv6 address '+v.ipv6+'/'+v.prefix+'\n':''} ${v.up?'no shutdown':'shutdown'}`).join('\n')}\n${d.gateway?'ip default-gateway '+d.gateway+'\n':''}${d.rsa?'! RSA key generated (simulated)\n':''}${d.loginLocal?'line vty 0 4\n login local\n':''}${d.sshOnly?' transport input ssh\n':''}end`;}
const help=`Supported educational commands (subset):\nPC: ipconfig | ipconfig /all | arp -a | ping <PC IP> | tracert <PC IP>\nIOS: enable | disable | configure terminal | exit | end\nshow ip interface brief | show ipv6 interface brief | show running-config\nshow startup-config | show ip route | show arp | show ipv6 neighbors | show interfaces | show ip ssh\nhostname <name> | interface g0/0 | interface g0/1 | interface vlan 1\nip address <IPv4> <mask> | no shutdown | shutdown\nip default-gateway <IPv4> | ipv6 address <IPv6>/64 | ipv6 unicast-routing\nenable secret <value> | ip domain-name <domain>\nusername <name> secret <value> | crypto key generate rsa modulus 2048\nip ssh version 2 | line vty 0 4 | login local | transport input ssh\ncopy running-config startup-config | write memory\nNo real IOS, SSH, RSA or packet processing is executed.`;
export function execute(state,key,raw){const d=state.devices[key];if(!d)return 'Unknown device';const cmd=raw.trim().replace(/\s+/g,' '),c=cmd.toLowerCase();if(!cmd)return '';if(c==='?'||c==='help')return help;const visited=()=>{if(!state.visited.includes(c))state.visited.push(c);};
if(d.type==='pc'){
if(['ipconfig','ipconfig /all'].includes(c)){visited();return `Ethernet adapter ${key}\n IPv4 Address . . . : ${d.ip}\n Subnet Mask . . . .: ${d.mask}\n Default Gateway . : ${d.gateway}\n IPv6 Address . . .: ${d.ipv6}/${d.prefix}\n IPv6 Gateway . . .: ${d.gateway6}\n Physical Address .: 00D0.BA20.000${key==='PC-A'?1:2}`;}
if(c==='arp -a'){visited();return state.arp[key]||'No ARP/neighbor entries. Run a successful ping first.';}
if(c.startsWith('ping '))return ping(state,key,cmd.slice(5)).message;
if(c.startsWith('tracert ')||c.startsWith('traceroute ')){const target=cmd.split(' ')[1],p=ping(state,key,target);state.traceOK=p.ok;return p.ok?`Tracing route to ${target}\n 1  <1ms  ${target.includes(':')?d.gateway6:d.gateway}\n 2  <1ms  ${target}\nTrace complete.`:' 1  * * *\nDestination unreachable.';}
return '% Unsupported PC command. Type ? for help.';}
if(c==='enable'||c==='en'){d.mode='priv';visited();return '';}
if(c==='disable'){d.mode='user';return '';}
if(c==='end'){if(d.mode!=='user')d.mode='priv';return '';}
if(c==='exit'){d.mode=['interface','line'].includes(d.mode)?'config':d.mode==='config'?'priv':'user';return '';}
if(c.startsWith('show ')){
if(!['priv','user'].includes(d.mode))return '% Exit configuration mode with end first.';
if(c==='show running-config'||c==='show startup-config'){if(d.mode!=='priv')return '% Privileged EXEC required: enable';visited();return c==='show running-config'?running(d):d.startup||'Startup configuration is not present';}
if(c==='show ip interface brief'||c==='show ipv6 interface brief'){visited();return 'Interface                  Address                       Status / Protocol\n'+Object.entries(d.interfaces).map(([p,v])=>`${p.padEnd(27)}${(c.includes('ipv6')?(v.ipv6||'unassigned')+'/'+v.prefix:v.ip).padEnd(30)}${v.up?'up / up':'administratively down / down'}`).join('\n');}
if(c==='show interfaces'){visited();return Object.entries(d.interfaces).map(([p,v])=>`${p} is ${v.up?'up':'administratively down'}, line protocol is ${v.up?'up':'down'}\n  Educational Ethernet interface, MTU 1500 bytes`).join('\n');}
if(c==='show ip route'){visited();return Object.entries(d.interfaces).filter(([,v])=>v.up&&ipv4(v.ip)!==null).map(([p,v])=>{const n=(ipv4(v.ip)&ipv4(v.mask))>>>0;const network=[24,16,8,0].map(shift=>(n>>>shift)&255).join('.');return `C ${network} (mask ${v.mask}) is directly connected, ${p}`;}).join('\n')||'No connected routes';}
if(c==='show arp'||c==='show ipv6 neighbors'){visited();return Object.values(state.arp).join('\n')||'No entries. Generate traffic from a PC first.';}
if(c==='show ip ssh'){visited();return d.rsa&&d.ssh===2?'SSH Enabled - version 2.0 (configuration model only)':'SSH not enabled';}
return '% Unsupported show command. Type ? for help.';
}
if(c==='configure terminal'||c==='conf t'){if(d.mode!=='priv')return '% Privileged EXEC required: enable';d.mode='config';visited();return 'Enter configuration commands, one per line. End with CNTL/Z.';}
if(c==='copy running-config startup-config'||c==='write memory'||c==='wr'){if(d.mode!=='priv')return '% Return to privileged EXEC with end first.';d.startup=running(d);d.saved=true;visited();return 'Building configuration...\n[OK]';}
if(!['config','interface','line'].includes(d.mode))return '% Enter configuration mode, or type ? for help.';
let changed=false;
if(c.startsWith('hostname ')&&d.mode==='config'){const name=cmd.slice(9);if(!/^[a-zA-Z][a-zA-Z0-9-]{0,30}$/.test(name))return '% Invalid hostname';d.name=name;changed=true;}
else if(c.startsWith('interface ')&&d.mode==='config'){const p=c.slice(10),port=portAliases[p]||p;if(!d.interfaces[port])return '% Interface not present on this device';d.port=port;d.mode='interface';return '';}
else if(c.startsWith('ip address ')&&d.mode==='interface'){const [, ,ip,mask,...rest]=cmd.split(' ');if(rest.length||ipv4(ip)===null||!maskValid(mask))return '% Invalid IPv4 address or subnet mask';Object.assign(d.interfaces[d.port],{ip,mask});changed=true;}
else if(['no shutdown','shutdown','no shut'].includes(c)&&d.mode==='interface'){d.interfaces[d.port].up=c!=='shutdown';changed=true;}
else if(c.startsWith('ipv6 address ')&&d.mode==='interface'){const value=cmd.slice(13),[ip,prefix]=value.split('/');if(!ipv6(ip)||Number(prefix)!==64)return '% Educational model supports valid IPv6 /64 addresses';Object.assign(d.interfaces[d.port],{ipv6:ip,prefix:64});changed=true;}
else if(c.startsWith('ip default-gateway ')&&d.mode==='config'){const gateway=cmd.slice(19);if(ipv4(gateway)===null)return '% Invalid gateway';d.gateway=gateway;changed=true;}
else if(c==='ipv6 unicast-routing'&&d.mode==='config'){d.ipv6Routing=true;changed=true;}
else if(c.startsWith('enable secret ')&&d.mode==='config'){d.secret=cmd.slice(14);if(!d.secret)return '% Secret required';changed=true;}
else if(c.startsWith('ip domain-name ')&&d.mode==='config'){d.domain=cmd.slice(15);changed=true;}
else if(/^username \S+ secret \S+$/.test(c)&&d.mode==='config'){const parts=cmd.split(' ');d.username=parts[1];d.password=parts[3];changed=true;}
else if(c==='crypto key generate rsa modulus 2048'&&d.mode==='config'){if(!d.domain||d.name==='R1')return '% Set a new hostname and domain name first';d.rsa=true;changed=true;}
else if(c==='ip ssh version 2'&&d.mode==='config'){d.ssh=2;changed=true;}
else if(c==='line vty 0 4'&&d.mode==='config'){d.mode='line';d.line='vty';return '';}
else if(c==='login local'&&d.mode==='line'){d.loginLocal=true;changed=true;}
else if(c==='transport input ssh'&&d.mode==='line'){d.sshOnly=true;changed=true;}
else return '% Unsupported command in this mode. Type ? for supported syntax.';
if(changed){d.saved=false;d.startup=d.startup||'';state.pingOK=false;state.traceOK=false;return '';}
return '';
}
export function objectives(lab,s){const d=s.devices,r=d.R1,sw=d.S1;const linkOK=s.links.every(Boolean);const routeOK=['gigabitethernet0/0','gigabitethernet0/1'].every((p,i)=>r.interfaces[p].ip===`192.168.${i?20:10}.1`&&r.interfaces[p].mask==='255.255.255.0'&&r.interfaces[p].up);const check=(text,ok)=>({text,ok:!!ok});const pingGoal=check('نجاح ping من PC-A إلى PC-B بعد آخر تعديل',s.pingOK);switch(lab.kind){
case 'navigation':return [check('الدخول إلى وضع enable',s.visited.includes('enable')||s.visited.includes('en')),check('الدخول إلى وضع configure terminal',s.visited.includes('configure terminal')||s.visited.includes('conf t')),check('قراءة show ip interface brief',s.visited.includes('show ip interface brief'))];
case 'switch':return [check('تغيير اسم S1 إلى Access-SW',sw.name==='Access-SW'),check('ضبط VLAN 1 على 192.168.10.2/24 وتفعيلها',sw.interfaces.vlan1.ip==='192.168.10.2'&&sw.interfaces.vlan1.mask==='255.255.255.0'&&sw.interfaces.vlan1.up),check('ضبط بوابة S1 على 192.168.10.1',sw.gateway==='192.168.10.1'),check('حفظ تهيئة S1 بعد آخر تعديل',sw.saved)];
case 'router':return [check('ضبط G0/0 = 192.168.10.1/24 وG0/1 = 192.168.20.1/24 وتفعيلهما',routeOK),pingGoal,check('حفظ تهيئة R1 بعد آخر تعديل',r.saved)];
case 'challenge':return [check('ضبط واجهتي R1 بعناوين .10.1/24 و.20.1/24 وتفعيلهما',routeOK),check('إصلاح بوابة PC-A إلى 192.168.10.1',d['PC-A'].gateway==='192.168.10.1'),pingGoal,check('حفظ تهيئة R1 بعد آخر تعديل',r.saved)];
case 'ipv6':return [check('ضبط G0/0 = 2001:db8:10::1/64 وG0/1 = 2001:db8:20::1/64',same6(r.interfaces['gigabitethernet0/0'].ipv6,'2001:db8:10::1')&&same6(r.interfaces['gigabitethernet0/1'].ipv6,'2001:db8:20::1')),check('تفعيل ipv6 unicast-routing',r.ipv6Routing),check('نجاح ping إلى عنوان IPv6 للحاسب PC-B',s.pingOK&&s.events.some(e=>e.includes('IPv6')))];
case 'security':return [check('ضبط اسم R1 إلى Edge-R1 ونطاق lab.local',r.name==='Edge-R1'&&r.domain==='lab.local'),check('ضبط enable secret ومستخدم admin بسر لا يقل عن 8 محارف',r.secret.length>=8&&r.username==='admin'&&r.password.length>=8),check('توليد مفتاح RSA افتراضي 2048 واستخدام SSH v2',r.rsa&&r.ssh===2),check('ضبط VTY: login local وtransport input ssh',r.loginLocal&&r.sshOnly),check('حفظ تهيئة R1',r.saved)];
case 'physical':return [check('توصيل الوصلات الأربع باستخدام Copper Straight-Through',linkOK),pingGoal];
case 'subnet':case 'vlsm':case 'ipv6subnet':return [check('إكمال جدول العنونة بالقيم الصحيحة',s.subnetOK)];
case 'connect':return [check('ضبط PC-A: 192.168.10.10/24 وبوابة 192.168.10.1',d['PC-A'].ip==='192.168.10.10'&&d['PC-A'].mask==='255.255.255.0'&&d['PC-A'].gateway==='192.168.10.1'),pingGoal];
case 'troubleshoot':return [check('قراءة ipconfig لتشخيص عنونة PC-A',s.visited.includes('ipconfig')||s.visited.includes('ipconfig /all')),check('إصلاح بوابة PC-A إلى 192.168.10.1',d['PC-A'].gateway==='192.168.10.1'),pingGoal,check('نجاح tracert إلى PC-B',s.traceOK)];
default:return [check('تشغيل تتبّع الحزمة وقراءة تسلسل الأحداث',s.observed),check('الإجابة عن سؤال الفهم إجابة صحيحة',s.quizOK)];}}
