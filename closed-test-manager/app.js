const KEY="closedtest14.v1";
const today=()=>new Date().toISOString().slice(0,10);
const daysBetween=(start,end=today())=>{if(!start)return 0;const a=new Date(start+"T00:00:00"),b=new Date(end+"T00:00:00");return Math.max(0,Math.floor((b-a)/86400000)+1)};
let state={app:{name:"공부핏",packageName:"",groupLink:"",optInLink:"",storeLink:""},testers:[],logs:[]};
try{const s=JSON.parse(localStorage.getItem(KEY));if(s)state={...state,...s}}catch(e){}
const $=id=>document.getElementById(id);
function save(){localStorage.setItem(KEY,JSON.stringify(state));render()}
function toast(msg){const t=$("toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),1800)}
function render(){
  $("appName").value=state.app.name||"";$("packageName").value=state.app.packageName||"";$("groupLink").value=state.app.groupLink||"";$("optInLink").value=state.app.optInLink||"";$("storeLink").value=state.app.storeLink||"";
  $("appTitle").textContent=state.app.name||"앱";
  const registered=state.testers.length, opted=state.testers.filter(t=>t.opted).length, completed=state.testers.filter(t=>t.opted&&daysBetween(t.start)>=14).length;
  const ranToday=state.testers.filter(t=>(t.runs||[]).includes(today())).length;
  $("kpiRegistered").textContent=registered;$("kpiOpted").textContent=opted;$("kpiCompleted").textContent=completed;$("kpiToday").textContent=ranToday;
  const pct=Math.min(100,Math.round((Math.min(completed,12)/12)*100));$("readyPercent").textContent=pct+"%";$("progressRing").style.setProperty("--pct",pct+"%");
  $("readyText").textContent=completed>=12?"프로덕션 신청 준비":"준비 중";$("readySub").textContent="연속 14일 완료 테스터 "+completed+"명";
  const body=$("testerBody");body.innerHTML="";
  state.testers.forEach((t,i)=>{const d=t.opted?daysBetween(t.start):0;const tr=document.createElement("tr");tr.innerHTML='<td>'+(i+1)+'</td><td><strong>'+esc(t.name)+'</strong></td><td>'+esc(t.email)+'</td><td>'+esc(t.device||"-")+'</td><td>'+(t.start||"-")+'</td><td><span class="badge '+(t.opted?"ok":"no")+'">'+(t.opted?"완료":"대기")+'</span></td><td><span class="badge '+(t.installed?"ok":"no")+'">'+(t.installed?"완료":"대기")+'</span></td><td><span class="badge '+((t.runs||[]).includes(today())?"ok":"no")+'">'+((t.runs||[]).includes(today())?"확인":"미확인")+'</span></td><td class="days '+(d>=14?"done":"")+'">'+d+'일</td><td><button class="mini ghost" onclick="editTester('+i+')">수정</button> <button class="mini ghost danger" onclick="removeTester('+i+')">삭제</button></td>';body.appendChild(tr)});
  $("emptyTesters").style.display=registered?"none":"block";
  const list=$("todayChecklist");list.innerHTML="";
  state.testers.filter(t=>t.opted&&t.installed).forEach((t,i)=>{const idx=state.testers.indexOf(t),checked=(t.runs||[]).includes(today());const row=document.createElement("div");row.className="checkrow";row.innerHTML='<div><strong>'+esc(t.name)+'</strong><small>'+esc(t.device||t.email)+'</small></div><button class="'+(checked?"primary":"ghost")+'" onclick="toggleRun('+idx+')">'+(checked?"오늘 확인됨":"오늘 실행 확인")+'</button>';list.appendChild(row)});
  if(!list.children.length)list.innerHTML='<div class="empty">Opt-in + 설치 완료 테스터가 표시됩니다.</div>';
  const logs=$("logList");logs.innerHTML="";
  [...state.logs].reverse().forEach(l=>{const el=document.createElement("div");el.className="log";el.innerHTML='<strong>'+esc(l.type)+'</strong><p>'+esc(l.text)+'</p><time>'+new Date(l.at).toLocaleString("ko-KR")+'</time>';logs.appendChild(el)});
  if(!logs.children.length)logs.innerHTML='<div class="empty">아직 기록이 없습니다.</div>';
}
function esc(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
$("saveAppBtn").onclick=()=>{state.app={name:$("appName").value.trim()||"공부핏",packageName:$("packageName").value.trim(),groupLink:$("groupLink").value.trim(),optInLink:$("optInLink").value.trim(),storeLink:$("storeLink").value.trim()};save();toast("앱 설정을 저장했습니다.")};
document.querySelectorAll("[data-copy]").forEach(b=>b.onclick=async()=>{const v=$(b.dataset.copy).value.trim();if(!v)return toast("먼저 링크를 입력해 주세요.");await navigator.clipboard.writeText(v);toast("링크를 복사했습니다.")});
$("inviteBtn").onclick=async()=>{const a=state.app;const txt='['+(a.name||"앱")+' 비공개 테스트 참여]\n1) Google Group 가입: '+(a.groupLink||"(링크 입력)")+'\n2) 테스트 참여(Opt-in): '+(a.optInLink||"(링크 입력)")+'\n3) 앱 설치: '+(a.storeLink||"(링크 입력)")+'\n\n설치 후 14일 동안 테스트 참여 상태를 유지해 주세요. 가능하면 여러 날 앱을 직접 사용해 주시고 오류나 불편한 점을 알려주세요.';await navigator.clipboard.writeText(txt);toast("초대문구를 복사했습니다.")};
$("addTesterBtn").onclick=()=>{if(state.testers.length>=20)return toast("최대 20명까지 등록할 수 있습니다.");$("testerForm").reset();$("editIndex").value="";$("testerStart").value=today();$("testerDialog").showModal()};
window.editTester=i=>{const t=state.testers[i];$("editIndex").value=i;$("testerName").value=t.name;$("testerEmail").value=t.email;$("testerDevice").value=t.device||"";$("testerStart").value=t.start||today();$("testerOpted").checked=!!t.opted;$("testerInstalled").checked=!!t.installed;$("testerDialog").showModal()};
$("saveTesterBtn").onclick=e=>{e.preventDefault();if(!$("testerForm").reportValidity())return;const i=$("editIndex").value;const old=i!==""?state.testers[+i]:{};const t={...old,name:$("testerName").value.trim(),email:$("testerEmail").value.trim(),device:$("testerDevice").value.trim(),start:$("testerStart").value,opted:$("testerOpted").checked,installed:$("testerInstalled").checked,runs:old.runs||[]};if(i==="")state.testers.push(t);else state.testers[+i]=t;$("testerDialog").close();save();toast("테스터를 저장했습니다.")};
window.removeTester=i=>{if(confirm(state.testers[i].name+" 테스터를 삭제할까요?")){state.testers.splice(i,1);save()}};
window.toggleRun=i=>{const t=state.testers[i];t.runs=t.runs||[];const k=t.runs.indexOf(today());if(k>=0)t.runs.splice(k,1);else t.runs.push(today());save()};
$("addLogBtn").onclick=()=>{$("logForm").reset();$("logDialog").showModal()};
$("saveLogBtn").onclick=e=>{e.preventDefault();if(!$("logForm").reportValidity())return;state.logs.push({type:$("logType").value,text:$("logText").value.trim(),at:new Date().toISOString()});$("logDialog").close();save();toast("기록을 추가했습니다.")};
$("resetBtn").onclick=()=>{if(confirm("저장된 테스트 데이터를 모두 초기화할까요?")){localStorage.removeItem(KEY);location.reload()}};
render();