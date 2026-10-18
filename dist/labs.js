// Original Arabic exercises. Only identifiers and filenames come from the inventory.
const rows = [
['1.5.5','تمثيل الشبكة','Network Representation','concept'],
['1.5.7','استكشاف مكوّنات الشبكة','Network Representation','concept'],
['2.3.7','التنقّل في نظام IOS','Navigate the IOS','navigation'],
['2.5.5','الإعدادات الأولية للمبدّل','Configure Initial Switch Settings','switch'],
['2.7.6','تطبيق الاتصال الأساسي','Implement Basic Connectivity','connect'],
['2.8.1','اختبار تعيين الواجهات','Test the Interface Assignment','connect','pkt'],
['2.8.2','اختبار الاتصال من طرف إلى طرف','Test End-to-End Connectivity','troubleshoot','pkt'],
['2.9.1','تهيئة المبدّل والأجهزة الطرفية','Basic Switch and End Device Configuration','switch'],
['3.5.5','نماذج OSI وTCP/IP عمليًا','Investigate the TCP-IP and OSI Models in Action','osi'],
['4.6.5','توصيل شبكة سلكية ولاسلكية','Connect a Wired and Wireless LAN','physical'],
['4.7.1','توصيل الطبقة المادية','Connect the Physical Layer','physical'],
['4.7.1-P','استكشاف الطبقة المادية — الوضع الفيزيائي','Physical Layer Exploration - Physical Mode','physical'],
['4.7.2','اختيار منافذ وكابلات الشبكة','Connect the Physical Layer','physical'],
['9.1.3','تحديد عناوين MAC وIP','Identify MAC and IP Addresses','mac'],
['9.2.9','فحص جدول ARP','Examine the ARP Table','arp'],
['9.3.4','اكتشاف الجيران في IPv6','IPv6 Neighbor Discovery','ndp'],
['10.1.4','الإعدادات الأولية للموجّه','Configure Initial Router Settings','router'],
['10.3.4','توصيل الموجّه بالشبكة المحلية','Connect a Router to a LAN','router'],
['10.3.5','معالجة أخطاء البوابة الافتراضية','Troubleshoot Default Gateway Issues','troubleshoot'],
['10.4.3','التهيئة الأساسية للأجهزة','Basic Device Configuration','router'],
['11.5.5','تقسيم شبكة IPv4','Subnet an IPv4 Network','subnet'],
['11.7.5','سيناريو تقسيم الشبكات','Subnetting Scenario','subnet'],
['11.9.3','تصميم VLSM وتطبيقه','VLSM Design and Implementation Practice','vlsm'],
['11.10.1','تصميم مخطط عنونة VLSM','Design and Implement a VLSM Addressing Scheme','vlsm'],
['11.10.2','مخطط VLSM — الوضع الفيزيائي','Design and Implement a VLSM Addressing Scheme - Physical Mode','vlsm'],
['12.4.5','تهيئة أجهزة IPv6','Basic Device Configuration','ipv6'],
['12.6.6','إعداد عنونة IPv6','Configure IPv6 Addressing','ipv6'],
['12.9.1','تقسيم شبكة IPv6','Implement a Subnetted IPv6 Addressing Scheme','ipv6subnet'],
['13.2.6','التحقق من عنونة IPv4 وIPv6','Verify IPv4 and IPv6 Addressing','ipv6'],
['13.2.7','اختبار الاتصال بـ Ping وTraceroute','Use Ping and Traceroute to Test Network Connectivity','troubleshoot'],
['13.3.1','اختبار الاتصال وإصلاحه بـ ICMP','Use ICMP to Test and Correct Network Connectivity','troubleshoot'],
['14.8.1','اتصالات TCP وUDP','TCP and UDP Communications','transport'],
['16.4.6','كلمات المرور الآمنة وSSH','Configure Secure Passwords and SSH','security'],
['16.5.1','تأمين أجهزة الشبكة','Secure Network Devices','security'],
['17.5.9','قراءة مخرجات أوامر show','Interpret show Command Output','show'],
['17.7.7','استكشاف أعطال الاتصال','Troubleshoot Connectivity Issues','troubleshoot'],
['17.8.2','تحدّي دمج المهارات','Skills Integration Challenge','challenge'],
['17.8.3','تحدّي استكشاف الأعطال','Troubleshooting Challenge','challenge']
];
export const moduleNames={1:'الشبكات اليوم',2:'تهيئة المبدّلات والأجهزة',3:'البروتوكولات والنماذج',4:'الطبقة المادية',9:'تحليل العناوين',10:'تهيئة الموجّهات',11:'عنونة IPv4',12:'عنونة IPv6',13:'ICMP',14:'طبقة النقل',16:'أمن الشبكات',17:'بناء شبكة صغيرة'};
const descriptions={concept:'تعرّف إلى الأجهزة الطرفية والوسيطة ودور كل منها في توصيل البيانات.',navigation:'جرّب الانتقال بين أوضاع IOS واقرأ حالة واجهات المبدّل.',switch:'اضبط اسم المبدّل وعنوان إدارته واحفظ التهيئة.',connect:'اضبط عنوان الحاسب والبوابة، ثم اختبر الوصول عبر شبكتين.',troubleshoot:'شخّص خطأ البوابة الافتراضية باستخدام أوامر العرض، وأصلحه ثم أعد الاختبار.',osi:'تتبّع تغليف البيانات وافهم وظيفة الطبقات أثناء إرسال حزمة.',physical:'اختر وصلة من المخطط، وحدّد الكابل المناسب، ثم اختبر الاتصال.',mac:'ميّز بين عنوان IP وعنوان MAC عند عبور الموجّه.',arp:'أرسل حزمة، ثم افحص كيف يربط ARP عنوان IP بعنوان MAC للبوابة.',ndp:'راقب اكتشاف الجيران في IPv6 وتعرّف إلى رسائل ICMPv6.',router:'اضبط واجهتي الموجّه وفعّلهما لتمرير البيانات بين الشبكتين.',subnet:'احسب عناوين الشبكات والبادئات والبث في مخطط IPv4.',vlsm:'وزّع العناوين حسب عدد المضيفين، بدءًا من أكبر شبكة.',ipv6:'اضبط عنواني IPv6 على الموجّه وفعّل التوجيه ثم اختبر الاتصال.',ipv6subnet:'قسّم بادئة IPv6 إلى شبكات /64 وحدّد أول ثلاث شبكات.',transport:'قارن بين TCP وUDP وافحص دور المنافذ في خدمة الويب.',security:'اضبط الدخول المحلي وSSH على الموجّه داخل نموذج تعليمي محدود.',show:'استخدم مخرجات أوامر العرض لفهم حالة الجهاز.',challenge:'اجمع تهيئة الموجّه، وإصلاح بوابة الحاسب، وحفظ الإعدادات واختبار الاتصال.'};
const quiz={
concept:['أي جهاز يربط شبكتين مختلفتين؟',['الموجّه R1','الحاسب PC-A','الكابل النحاسي'],0,'يستخدم الموجّه عنوان الوجهة في الطبقة الثالثة لاختيار مسار الحزمة.'],
osi:['ما وحدة البيانات في طبقة ربط البيانات؟',['حزمة Packet','إطار Frame','بت Bit'],1,'تُغلّف حزمة IP في إطار ذي عنواني MAC عند إرسالها على وصلة Ethernet.'],
mac:['عند إرسال PC-A إلى PC-B عبر R1، ما عنوان MAC للوجهة في الإطار الأول؟',['MAC للحاسب PC-B','MAC لواجهة R1 المحلية','MAC لواجهة R1 البعيدة'],1,'عند كون الوجهة خارج الشبكة المحلية يوجّه الحاسب إطار Ethernet إلى بوابته الافتراضية.'],
arp:['ما وظيفة ARP في هذه التجربة؟',['تحويل اسم الموقع إلى IP','اكتشاف عنوان IPv6','ربط عنوان IPv4 المحلي بعنوان MAC'],2,'يبحث الحاسب عن عنوان MAC للبوابة عندما تكون وجهة IPv4 في شبكة أخرى.'],
ndp:['ما البروتوكول الذي يحمل رسائل Neighbor Solicitation؟',['ICMPv6','ARP','DNS'],0,'يستخدم IPv6 رسائل اكتشاف الجيران ضمن ICMPv6، ولا يستخدم ARP.'],
transport:['أي بروتوكول ينشئ اتصالًا باستخدام مصافحة ثلاثية؟',['UDP','TCP','ICMP'],1,'يبدأ TCP عادةً بتبادل SYN ثم SYN-ACK ثم ACK.'],
show:['ماذا تعني حالة administratively down في show ip interface brief؟',['توقّف الواجهة بأمر shutdown','اختلاف عنوان MAC','نجاح اختبار ping'],0,'يلزم no shutdown لتفعيل الواجهة إداريًا؛ وقد تبقى down إذا لم تتوفر الوصلة.']
};
export const labs=rows.map(([id,title,en,kind,ext='pka'],i)=>({id,title,en,kind,module:Number(id.split('.')[0]),description:descriptions[kind],quiz:quiz[kind]||null,filename:`${id==='4.7.1-P'?'4.7.1':id} ${ext==='pkt'?'Video Activity':'Packet Tracer'} - ${en}.${ext}`,seed:i}));
export function subnetTask(lab){const base=10+lab.seed;return lab.kind==='vlsm'?{network:`192.168.${base}.0/24`,rows:[{hosts:60,network:`192.168.${base}.0`,prefix:26,broadcast:`192.168.${base}.63`},{hosts:28,network:`192.168.${base}.64`,prefix:27,broadcast:`192.168.${base}.95`},{hosts:12,network:`192.168.${base}.96`,prefix:28,broadcast:`192.168.${base}.111`}]}:{network:`192.168.${base}.0/24`,rows:[{hosts:50,network:`192.168.${base}.0`,prefix:26,broadcast:`192.168.${base}.63`},{hosts:50,network:`192.168.${base}.64`,prefix:26,broadcast:`192.168.${base}.127`},{hosts:50,network:`192.168.${base}.128`,prefix:26,broadcast:`192.168.${base}.191`}]};}
export const isQuiz=lab=>!!lab.quiz;
