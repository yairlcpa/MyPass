// GLOBAL
var myPass, myItem, passDB, passArr, keysArr, timer, exitTimer, pageSender, changedPass, addItemSender=0, path="root", movePath="root";
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register("./sw.js")
  .then((reg) => console.log("sw Registred", reg))
  .catch((err) => console.log ("sw NOT Registred !", err));
}

// ON LOAD
function On_Load(){
  if (navigator.platform.search('Win') != 0) document.getElementsByTagName("HTML")[0].style.fontSize = '18px';
  localStorage.setItem("passChanged", false);
  keyEntries = ["nameEn", "nameHe", "user", "password", "url", "notes"];
  window.history.pushState({}, ''); window.addEventListener('popstate', ()=> {window.history.pushState({}, '')});
  cl = (txt) => console.log(txt);
  qs = (el, parent = document) => parent.querySelector(el);
  qsAll = (el, parent = document) => [...parent.querySelectorAll(el)];
  Encrypt = (txt,pass) => {return CryptoJS.AES.encrypt(txt, pass).toString();}
  Decrypt = (txt,pass) => {return CryptoJS.AES.decrypt(txt, pass).toString(CryptoJS.enc.Utf8);}
  Side_Menu  = (pg) => {qs("#"+pg).classList.toggle("mask-show"); qs("#"+pg).children[0].classList.toggle("side-menu-show");}
  Action = (pg) => {qs("#"+pg).classList.toggle("mask-show"); qs("#"+pg).children[0].classList.toggle("action-show");}
  Mask   = (pg) => qs("#"+pg).classList.toggle("mask-show");
  Msgbox = (pg,title,txt) => {qs("#"+pg).classList.toggle("mask-show"); qs("#"+pg).children[0].classList.toggle("msgbox-show"); qs("#msg-title").innerText=title; qs("#msg-txt").innerHTML=txt; }
  Toggle_MsgBox = (pg) => {qs("#"+pg).classList.toggle("mask-show"); qs("#"+pg).children[0].classList.toggle("msgbox-show");}
  Warning = (pg,title,txt) => {qs("#"+pg).classList.toggle("mask-show"); qs("#"+pg).children[0].classList.toggle("msgbox-show"); qs("#warning-title").innerText=title; qs("#warning-txt").innerHTML=txt;}
  Toast  = (txt) => {qs(".toast-msg").innerHTML = txt; qs(".toast-box").classList.toggle("toast-show"); setTimeout(() => qs(".toast-box").classList.toggle("toast-show"), 3000); } 
// EXIT AFTER 180 SECONDS WITHOUT ACTIVITY
  Run_Exit_Timer = () => {exitTimer = setTimeout(Reset_App, 180000);}
  document.body.onfocus = () => {clearTimeout(exitTimer);}
  document.body.onblur = () => {if (qs("#page-locker").className.search("page-hide")>-1) Run_Exit_Timer();}
// KEYBOARD EVENT LISTENERS
  document.body.addEventListener("keydown", (e)=> {
    if (e.key == "Enter") Keyboard_Enter_Click(e);
    if (e.ctrlKey && e.key == 'ArrowLeft') Keyboard_Backspace_Click(e);
    if (e.ctrlKey && e.key=="כ" || e.ctrlKey && e.key=="f" || e.ctrlKey && e.key=="F") Keyboard_Search_Click(e);
    });  
  Check_LocalStorage(); Check_Theme()
}
function Reset_App(){
  myPass="", myItem="", path="root", passDB=[], passArr=[], keysArr=[], timer="", pageSender="", addItemSender=0, movePath="root", changedPass="";
  localStorage.setItem("passChanged", false);
  qs("#pass-list").innerHTML = ""; qs("#search-list").innerHTML = ""; qs("#move-item-list").innerHTML = "";
  Goto_Page("page-locker"); qs("#main-password").focus()
  clearTimeout(exitTimer);
}
function Goto_Page(pg){
  ["#page-locker","#page-main","#page-key-form","#page-search","#page-move-item"].forEach (p => qs(p).classList.add("page-hide"));
  qs("#"+pg).classList.remove("page-hide")
}

// KEYBOARD
function Keyboard_Enter_Click(e) {
  if (qs("#page-locker").className.search("page-hide") == -1) {e.preventDefault(); Btn_Unlock_Click()};
}
function Keyboard_Search_Click(e) {
  if (qs("#page-main").className.search("page-hide") == -1) {e.preventDefault(); Btn_Search_Click()};
}
function Keyboard_Backspace_Click(e) {
  if (qs("#page-main").className.search("page-hide")==-1 && path=="root") {e.preventDefault(); Icon_Exit_App_Click()};
  if (qs("#page-main").className.search("page-hide")==-1 && path!="root") {e.preventDefault(); Icon_Main_Back_Click()};
  if (qs("#page-key-form").className.search("page-hide")==-1) {e.preventDefault(); Icon_KeyForm_Back_Click()};
  if (qs("#page-search").className.search("page-hide")==-1) {e.preventDefault(); Icon_Search_Back_Click();} 
}

// THEME
function Check_Theme(){
  if (localStorage.getItem("theme")==null) localStorage.setItem("theme","dark"); 
  theme = localStorage.getItem("theme");  Update_Theme()
}
function Action_Locker_Theme_Mode() {
  theme = document.body.getAttribute("data-bs-theme")=="dark" ? "light" : "dark"
  localStorage.setItem("theme",theme); 
  Action("locker-menu-action"); Update_Theme()
}
function Update_Theme(){
  document.body.setAttribute("data-bs-theme", theme); 
  if (theme=="dark"){
    qsAll(".theme-icon").forEach (i => i.setAttribute("class", "theme-icon bi-sun px-3")); 
    qsAll(".theme-text").forEach (i => i.innerText="תאורת יום")}
  else{
    qsAll(".theme-icon").forEach (i => i.setAttribute("class", "theme-icon bi-moon px-3")); 
    qsAll(".theme-text").forEach (i => i.innerText="תאורת לילה")}
}

// LOCKER
function Check_LocalStorage(){
  if (localStorage.getItem("encData") == null) {
    qs("#load-message").innerHTML = "<br>נא לטעון קובץ סיסמאות<br>או ליצור קובץ סיסמאות חדש"; 
    qs("#load-message").classList.remove("d-none"); 
    qs("#main-pass-row").classList.add("d-none"); qs("#unlock-btn").classList.add("d-none"); }
  else {
    qs("#main-password").focus();
    qs("#file-name").innerText="שם הקובץ: "+localStorage.getItem("fileName")}
}
function Btn_Unlock_Click(){
  myPass = qs("#main-password").value
  if(Decode_PassDB()) {
    Fill_Pass_List();
    Goto_Page("page-main");}
    // Page(["#page-locker","#page-main"]);  }
}
function Decode_PassDB(){
  try {
    let data = localStorage.getItem("encData");
    let decDB = Decrypt(data,myPass);
    passDB = JSON.parse(decDB);
    qs("#main-password").value="";
    return true; }
  catch {
    Warning('warning','סיסמה שגויה','אנא נסה שוב'); 
    return false;}
}

// LOCKER ACTION
function Action_Load_PassDB(f){
  Action("locker-menu-action");
  let file = f.files[0]; let reader = new FileReader();
  localStorage.setItem("fileName",(f.files[0].name)); qs("#file-name").innerText="שם הקובץ: "+f.files[0].name;
  reader.readAsText(file);
  reader.onload = () => {
    localStorage.setItem("encData", reader.result);
    qs("#load-message").classList.add("d-none"); 
    qs("#main-pass-row").classList.remove("d-none"); qs("#unlock-btn").classList.remove("d-none"); }
}
function Action_Load_Dropbox_File(){
  Action("locker-menu-action");
  let link = localStorage.getItem("dropbox-link");
  if (link==undefined) Toggle_MsgBox("load-dropbox-msgbox");
  else Fetch_DropBox(link)
}
function Load_Dropbox_File(f){
    Toggle_MsgBox("load-dropbox-msgbox"); 
    let file = f.files[0]; let reader = new FileReader();
    reader.readAsText(file);
    reader.onload = ()=> {
      localStorage.setItem("dropbox-link", reader.result);
      Fetch_DropBox(reader.result);}
}
async function Fetch_DropBox(link){
  Toggle_MsgBox("loading-msgbox");
  let drp = await fetch (link);
  let txt = await drp.text();
  localStorage.setItem("encData", txt); localStorage.setItem("fileName","MyPass.txt"); 
  qs("#load-message").classList.add("d-none"); qs("#file-name").innerText="שם הקובץ: MyPass.txt";
  qs("#main-pass-row").classList.remove("d-none"); qs("#unlock-btn").classList.remove("d-none"); 
  Toggle_MsgBox("loading-msgbox"); Toast("הקובץ נטען בהצלחה");
}
function Action_Import_Csv(f) {
  Action("locker-menu-action");
  let file = f.files[0]; let reader = new FileReader(); 
  // reader.readAsText(file, "ISO-8859-8");
  reader.readAsText(file, "utf-8");
  reader.onload = () => {
    csvData = reader.result;
    const [keys, ...rest] = csvData.trim().split("\n").map((item) => item.split(","));
    passDB = rest.map((item) => {
      const object = {};
      keys.forEach((key, index) => (object[key] = item.at(index)));
      return object;
    });
  localStorage.setItem("encData", Encrypt(JSON.stringify(passDB),""));
  Show_Change_Password_Msg();}
}
function Action_Create_NewDB(){
  Action("locker-menu-action");
  passDB = [{"id":Generate_NewID(), "path":"root", "type":"dir", "nameEn":"תיקייה חדשה", "nameHe":"", "user":"", "password":"", "url":"", "notes":""}, {"id":Generate_NewID(), "path":"root", "type":"key", "nameEn":"מפתח חדש", "nameHe":"", "user":"MyKey", "password":"1234", "url":"", "notes":"Hello"}];
  Show_Change_Password_Msg();
}
function Show_Change_Password_Msg(){
  changedPass=""; fromNewDB=true;
  qs("#change-password-msg").innerHTML = "<div class='fs-6 text-success text-center py-2'>קובץ הסיסמאות נוצר בהצלחה</div><div class='fs-6 text-center pb-2'>נא להזין סיסמת אב לקובץ החדש</div>"
  qs("#btn-cancel-new-password").classList.add("d-none"); qs("#input-change-password").value = ""; qs("#input-change-password").placeholder = "הזן סיסמה";
  qs("#btn-change-password").classList.remove("d-none"); qs("#btn-confirm-password").classList.add("d-none"); 
  Toggle_MsgBox("change-password-msgbox");
  qs("#input-change-password").focus();
  Goto_Page("page-main");
}

// MAIN
function Fill_Pass_List() {
  myList = [...passDB.filter(c => c.path==path)];
  qs("#main-title").innerText = path.slice(path.lastIndexOf("/")+1).replace("root","ראשי"); 
  if(path=="root") {
    qs("#main-back-btn").classList.add("d-none"); qs("#main-exit-btn").classList.remove("d-none")}
  else {
    qs("#main-back-btn").classList.remove("d-none"); qs("#main-exit-btn").classList.add("d-none")}
  qs("#pass-list").innerHTML = ""
  for (let i of myList){
    if(i.user == "") i.user="-"    
    if(i.type == "dir") {
      let childPath = path+`/${i.nameEn}`
      let childrens = passDB.filter(c => c.path==childPath).length
      qs("#pass-list").innerHTML += `
        <li class="flex py-2 px-2 pointer text-info">
          <b class="bi-folder px-2" onclick="Main_Item_Click('${i.id}')"></b>
          <div class="flex-grow-1 flex-column px-2" onclick="Main_Item_Click('${i.id}')">
            <span class="fs-6">${i.nameEn}</span>
            <div class="text-secondary fs-small px-2">פריטים: ${childrens}</div>
          </div>
          <b class="bi-three-dots-vertical px-2 text-secondary fs-6" title="פעולות" onclick="Icon_Item_Click('${i.id}')"></b>
          
        </li>`}
    else
      qs("#pass-list").innerHTML += `
        <li class="flex pt-2 px-2 pointer flex" >
          <b class="bi-key px-2" onclick="Main_Item_Click('${i.id}')"></b>
          <div class="flex-grow-1 flex-column px-2" onclick="Main_Item_Click('${i.id}')">
            <span>${i.nameEn}</span>
            <div class="text-secondary fs-small px-2">${i.user}</div>
          </div>
          <b class="bi-three-dots-vertical px-2 text-secondary fs-6" title="פעולות" onclick="Icon_Item_Click('${i.id}')"></b>
        </li>`
    }
}
function Main_Item_Click(e) {
  myItem = passDB.filter(c => c.id==e)[0];
  if (myItem.type=="dir") {
    path+=`/${myItem.nameEn}`; Fill_Pass_List()}
  else {
    pageSender="page-main"; 
    Fill_Key_Entries();
    Goto_Page("page-key-form");}
}
function Icon_Main_Back_Click(){
  path = path.slice(0,path.lastIndexOf("/")); 
  Fill_Pass_List();
}
function Btn_SaveDB_Click() {
  Toggle_MsgBox("save-msgbox"); Save_PassDB(true);
}
function Btn_Cancel_SaveDB_Click(){
  Toggle_MsgBox("save-msgbox"); Reset_App();
  // Goto_Page("page-locker"); setTimeout(_=>location.reload(),500)
}
function Icon_Exit_App_Click(){
  if (localStorage.getItem("passChanged")==true) 
    Toggle_MsgBox("save-msgbox");
  else
    Reset_App();
}

// MAIN SIDE MENU ACTIONS
function Action_Add_New_Folder(){
  Side_Menu('side-menu');
  qs("#add-folderEn").value=""; Toggle_MsgBox("add-folder-msgbox");
}
function Btn_Add_Folder_Confirm(){
  if(qs("#add-folderEn").value=="") Warning("warning", "Error", "Fill Folder Name")
  else if (passDB.filter(i => i.path==path && i.type=="dir" && i.nameEn==qs("#add-folderEn").value).length>0)
    Warning("warning","שגיאה!","שם זהה כבר קיים בתיקייה זו<br>אנא בחר שם תיקייה אחר");
  else { 
    let newFolder = {"id":Generate_NewID(),"path":path, "type":"dir", "nameEn":qs("#add-folderEn").value, "nameHe":"", "user":"", "password":"", "url":"", "notes":""}; 
    passDB.push(newFolder); 
    Write_PassDB(); Fill_Pass_List(); Btn_Add_Folder_Cancel()}
}
function Btn_Add_Folder_Cancel(){
  qs("#add-folderEn").value=""; Toggle_MsgBox("add-folder-msgbox");
}
function Action_Add_New_Key(){
  Side_Menu('side-menu');
  qs("#key-name").innerText="מפתח חדש"; 
  for (i of keyEntries) qs("#key-"+i).value = "";   
  Toggle_Entries();
  pageSender="page-main"; addItemSender=1
  Goto_Page("page-key-form");
}
function Action_Main_Theme_Mode() {
  theme = document.body.getAttribute("data-bs-theme")=="dark" ? "light" : "dark"
  localStorage.setItem("theme",theme); 
  Side_Menu('side-menu'); Update_Theme()
}
function Action_Change_Password_Click(){
  Side_Menu("side-menu"); 
  fromNewDB=false; qs("#btn-cancel-new-password").classList.remove("d-none");
  Change_Password_Message()
}
function Action_Save_PassDB_Click(){
  Side_Menu("side-menu"); Save_PassDB(false)
}
function Action_Share_PassDB_Click(){
  Side_Menu("side-menu");
  let passData = Encrypt(JSON.stringify(passDB),myPass);
  const shareData = {title: "MyPass", text: passData};
  navigator.share(shareData);
}
function Action_Export_Csv_Click(){
  Side_Menu("side-menu");
  Warning("warning","שים לב","הסיסמאות בקובץ CSV אינן מוצפנות !!!<br>אל תשאיר את הקובץ ללא הצפנה");  
  qs("#btn-warning").addEventListener("click",Export_To_Csv);
}
function Export_To_Csv()  {
  qs("#btn-warning").removeEventListener("click",Export_To_Csv);
  let csvArr=[], csvData=""; tmp=[]
  for (let i of passDB) {
    if(i.notes != null) 
      i.notes=i.notes.replaceAll("\n", "~~"); 
    tmp.push(i);}
  csvArr.push(Object.keys(tmp[0]));
  tmp.forEach(i => csvArr.push(Object.values(i)));
  csvArr.forEach(row => {csvData += row.join(',') + '\n'});
  if (navigator.platform.search('Win')==0)
    Win_Save_Csv(csvData)
  else {
    let file = new Blob([csvData], { type:"text/csv;charset=utf-8,"});
    let blobURL = URL.createObjectURL(file);
    let a = document.createElement("a");
    a.href = blobURL; a.download = "pass.csv"; a.style.display = 'none';
    document.body.append(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(blobURL); a.remove(); }, 1000); }
}
function Action_Exit_App_Click(){
  Side_Menu('side-menu');
  if (localStorage.getItem("passChanged")==true) 
    Toggle_MsgBox("save-msgbox");
  else
    Reset_App()
}
function Btn_Change_Password_Click(){
  changedPass=qs("#input-change-password").value; 
  qs("#change-password-msg").innerHTML = "<div class='fs-6 text-success text-center py-2'>אימות סיסמה</div><div class='fs-6 text-center pb-2'>נא להזין שוב את הסיסמה</div>"
  qs("#input-change-password").value = ""; qs("#input-change-password").placeholder = "אימות סיסמה";
  qs("#btn-change-password").classList.add("d-none");  qs("#btn-confirm-password").classList.remove("d-none");
  qs("#input-change-password").focus()
}
function Btn_Confirm_Password_Click(){
  Toggle_MsgBox("change-password-msgbox");
  if(changedPass==qs("#input-change-password").value) {
    myPass=qs("#input-change-password").value
    if (fromNewDB)
      Msgbox('msgbox','','הסיסמה נוצרה בהצלחה');
    else
      Msgbox('msgbox','','הסיסמה הוחלפה בהצלחה<br>מומלץ לשמור את קובץ הנתונים');
    Write_PassDB(); Fill_Pass_List(); fromNewDB=false;}
    // qs("#btn-cancel-new-password").classList.remove("invisible")}
  else{
    changedPass=""; 
    Warning('warning','שגיאה','הסיסמאות אינן תואמות<br>נסה שוב');
    qs("#btn-warning").addEventListener("click", Change_Password_Message)
  }
}
function Change_Password_Message(){
  qs("#btn-warning").removeEventListener("click", Change_Password_Message)
  changedPass=""; 
  qs("#change-password-msg").innerHTML = "<div class='fs-6 text-success text-center py-2'>החלפת סיסמה</div><div class='fs-6 text-center pb-2'>הזן סיסמה חדשה</div>"
  qs("#input-change-password").value = ""; qs("#input-change-password").placeholder = "הזן סיסמה";
  qs("#btn-change-password").classList.remove("d-none"); qs("#btn-confirm-password").classList.add("d-none"); 
  Toggle_MsgBox("change-password-msgbox");
  qs("#input-change-password").focus()
}
function Btn_Change_Password_Cancel(){
  Toggle_MsgBox("change-password-msgbox");
}
function Save_PassDB(exit){
  let passData = Encrypt(JSON.stringify(passDB),myPass);
  if (navigator.platform.search('Win')==0)
    Win_Save_PassDB(passData, exit)
  else{
    let file = new Blob([passData], { type: 'text/plain' });
    let blobURL = URL.createObjectURL(file); 
    let a = document.createElement('a');
    a.href = blobURL; a.download = "pass.txt"; a.style.display = 'none';
    document.body.append(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(blobURL); a.remove(); }, 1000); }
}
function Write_PassDB(){
  passDB.sort((a, b) => {return a.nameEn.localeCompare(b.nameEn)});
  passDB.sort((a, b) => {return a.type.localeCompare(b.type)});
  let data = Encrypt(JSON.stringify(passDB),myPass);
  localStorage.setItem("encData", data);  localStorage.setItem("passChanged", true);
}
async function Win_Save_PassDB(text, exit) {
  try {
    const options = { types: [ { description: 'Text Files', accept: { 'text/plain': ['.txt'], }, }, ], };
    let file = await window.showSaveFilePicker(options);
    let writable = await file.createWritable();
    await writable.write(text); await writable.close();
    Msgbox("msgbox","","הקובץ נשמר בהצלחה");
    localStorage.setItem("passChanged",false)
    if(exit) Reset_App();}
  catch {
    Warning("warning","שגיאה","אירעה שגיאה בשמירת הקובץ"); }
}
async function Win_Save_Csv(data) {
  try {  
    let options = { types: [ { description: 'Csv Files', accept: { 'text/csv': ['.csv'], }, }, ], };
    let file = await window.showSaveFilePicker(options);
    let writable = await file.createWritable();
    await writable.write(data); await writable.close();
    Msgbox("msgbox","","הקובץ נשמר בהצלחה");}
  catch {
    Warning("warning","שגיאה","אירעה שגיאה בשמירת הקובץ"); }
}

// MAIN ITEM ACTIONS
function Icon_Item_Click(e){
  myItem = passDB.filter(c => c.id==e)[0];
  let keyDir = myItem.type=="dir" ?"תיקיית: " :"מפתח: "
  qs("#edit-item-title").innerText = keyDir + myItem.nameEn
  Action("edit-item-action"); 
}
function Action_Delete_Item_Click(){
  Action("edit-item-action");
  if (myItem.type=="dir"){
    qs("#delete-folder-text").innerHTML = `<div>פעולה זו תמחק את תיקיית "${myItem.nameEn}"<br>ואת כל הפריטים שבתוכה לצמיתות! </div>`
    Toggle_MsgBox("delete-folder-msgbox");}
  else {
    qs("#delete-key-text").innerHTML = `<div>פעולה זו תמחק את מפתח "${myItem.nameEn}" לצמיתות! </div>`
    Toggle_MsgBox("delete-key-msgbox");}
  }
function Action_Rename_Item_Click() {
  Action("edit-item-action");
  qs("#rename-item-name").value = myItem.nameEn; 
  Toggle_MsgBox("rename-item-msgbox");
}
function Action_Move_Item_Click() {
  Action("edit-item-action"); 
  movePath=myItem.path; itemAction="אל: "
  qs("#move-item-icon").classList.remove("d-none"); qs("#copy-item-icon").classList.add("d-none");
  qs("#move-item-title").classList.add("move-color"); qs("#move-item-title").classList.remove("copy-color");
  Toast("בחר תיקייה לתוכה יועבר הפריט")
  Fill_Move_List(); Goto_Page("page-move-item");
}
function Action_Copy_Item_Click() {
  Action("edit-item-action"); 
  movePath=myItem.path; itemAction="אל: "
  qs("#copy-item-icon").classList.remove("d-none"); qs("#move-item-icon").classList.add("d-none");
  qs("#move-item-title").classList.add("copy-color"); qs("#move-item-title").classList.remove("move-color");
  Toast("בחר תיקייה לתוכה יועתק הפריט")
  Fill_Move_List(); Fill_Move_List(); Goto_Page("page-move-item");
}
function Btn_Delete_Item_Confirm(){
  if (myItem.type=="dir") {
    let delPath = path+`/${myItem.nameEn}`;
    let tmpArr = passDB.filter(i => i.path.search(delPath)==-1);
    passDB = tmpArr.filter(i => i.id != myItem.id); tmpArr=[]; 
    Write_PassDB(); Fill_Pass_List(); 
    Toggle_MsgBox("delete-folder-msgbox");
    Toast('התיקייה נמחקה!');}
  else {
    let tmpArr = passDB.filter(i => i.id != myItem.id)
    passDB = tmpArr; tmpArr=[]
    Write_PassDB(); Fill_Pass_List(); 
    Toggle_MsgBox("delete-key-msgbox");
    Toast('המפתח נמחק!');}
}
function Btn_Delete_Item_Cancel(){
  if (myItem.type=="dir")
    Toggle_MsgBox("delete-folder-msgbox");
  else
    Toggle_MsgBox("delete-key-msgbox");
}
function Btn_Rename_Item_Confirm(){
  if(qs("#rename-item-name").value=="") 
    {Warning("warning", "שגיאה", "נא להזין שם פריט"); return;}
  if (myItem.type=="dir"){
    if (passDB.filter(i => i.path==path && i.nameEn==qs("#rename-item-name").value).length>0)
      { Warning("warning", "שגיאה", "שם הפריט כבר קיים"); return;}
    let oldPath = path+'/'+myItem.nameEn; let newPath = path+'/'+qs("#rename-item-name").value;
    for (j in passDB)
      if(passDB[j].path.search(oldPath)==0) 
        passDB[j].path = passDB[j].path.replace(oldPath,newPath);}
  let i = passDB.findIndex(o => o.id==myItem.id)
  passDB[i].nameEn=qs("#rename-item-name").value; 
  Toast('שם הפריט הוחלף')
  Write_PassDB(); Fill_Pass_List(); 
  Toggle_MsgBox("rename-item-msgbox");
}
function Btn_Rename_Item_Cancel(){
  Toggle_MsgBox("rename-item-msgbox");
}
function Icon_Move_Item_Cancel(){
  movePath="root"; Goto_Page('page-main');
}
function Icon_Move_Item_Confirm(){
  let oldPath = myItem.path+'/'+myItem.nameEn; 
  let newPath = movePath+'/'+myItem.nameEn; 
  if (movePath==myItem.path)
    {Warning("warning","שגיאה!","הפריט כבר נמצא בתיקייה זו"); return;}
  else if (movePath.search(oldPath)==0)
    {Warning("warning","שגיאה!","לא ניתן להעביר את התיקייה לתוך עצמה"); return;}
  else if (myItem.type=="dir" && passDB.filter(o => o.path==movePath).filter(o=> o.nameEn==myItem.nameEn).length>0)
    {Warning("warning","שגיאה!","שם זהה כבר קיים בתיקייה זו<br>אנא בחר תיקייה אחרת"); return;}
  else {
    if (myItem.type=="dir")
      for (j in passDB)
        if(passDB[j].path.search(oldPath)==0) 
          passDB[j].path = passDB[j].path.replace(oldPath,newPath);
  let i = passDB.findIndex(o => o.id==myItem.id); passDB[i].path=movePath;
  Toast('הפריט הועבר'); Move_Item_Close();}
}
function Icon_Copy_Item_Confirm(){
  let oldPath = myItem.path+'/'+myItem.nameEn;
  let newPath = movePath+'/'+myItem.nameEn; 
  if (movePath==myItem.path)
    {Warning("warning","שגיאה!","הפריט כבר נמצא בתיקייה זו"); return;}
  else if (movePath.search(oldPath)==0)
    {Warning("warning","שגיאה!","לא ניתן להעתיק את התיקייה לתוך עצמה"); return;}
  else if (myItem.type=="dir" && passDB.filter(o => o.path==movePath).filter(o=> o.nameEn==myItem.nameEn).length>0)
    {Warning("warning","שגיאה!","שם זהה כבר קיים בתיקייה זו<br>אנא בחר תיקייה אחרת"); return;}
  else if (myItem.type == "dir"){
    let copyArr = passDB.filter(c => c.path.search(oldPath)==0).map(el => ({...el}));
    copyArr.forEach(i => {i.id=Generate_NewID(); i.path=i.path.replace(oldPath,newPath); passDB.push(i);});}
  let newItem = {...myItem}; newItem.id = Generate_NewID(); newItem.path=movePath; 
  passDB.push(newItem); 2
  Toast('הפריט הועתק'); Move_Item_Close();
}
function Fill_Move_List(){
  if (movePath != "root") 
    qs("#move-item-back").classList.remove("d-none")
  else
    qs("#move-item-back").classList.add("d-none")  
  moveList = [...passDB.filter(c => c.path==movePath)]; 
  qs("#move-item-list").innerHTML = "";
  moveList = [...passDB.filter(c => c.path==movePath)]; 
  let ttl = movePath=="root" ? "ראשי" : movePath.slice(movePath.lastIndexOf("/")+1);
  qs("#move-to-title").innerHTML = itemAction + ttl;
  for (let i of moveList){
    if(i.type=="dir")
      qs("#move-item-list").innerHTML += `
      <div class="flex w-100 py-2 px-2 pointer select-none" onclick="Move_Item_Click('${i.id}')">
        <b class="bi-folder px-2 text-info"></b>
        <div class="flex-column px-2">
          <span class="text-info overflow-auto fs-6">${i.nameEn}</span>
          <small class="px-1 fs-small text-secondary">( ${i.path.replaceAll("/"," - ").replace("root","ראשי")} )</small>
        </div>
      </div>`
    else
      qs("#move-item-list").innerHTML +=`
        <li class="flex pt-2 px-2 flex select-none">
          <b class="bi-key px-2"></b>
          <div class="flex-grow-1 flex-column px-2">
            <span>${i.nameEn}</span>
            <div class="text-secondary fs-small px-2">${i.user}</div>
          </div>
        </li>`
  }
}
function Move_Item_Click(e){
  movePath+=`/${passDB.filter(c => c.id==e)[0].nameEn}`; 
  Fill_Move_List()
}
function Move_Item_Back(){
  movePath = movePath.slice(0,movePath.lastIndexOf("/")); 
  Fill_Move_List();
}
function Move_Item_Close(){
  Write_PassDB(); path=movePath;
  Fill_Pass_List(); 
  Goto_Page('page-main');
}

// SEARCH
function Btn_Search_Click() { 
  Goto_Page('page-search');
  let keysArr = passDB.filter(c => c.type=='key'); 
  qs("#search-input").value = ""; qs("#search-input").focus();
  qs("#search-list").innerHTML = ""; qs("#search-list").scrollTop=0;
  if(keysArr.length>20){
    Search_Fill_List(keysArr.slice(0,20));
    setTimeout(_=>Search_Fill_List(keysArr.slice(20)),50);}
}
function Search_Fill_List(keys){
  if (qs("#search-input").value == "")  qs("#clean-seach-input").classList.add("invisible");
  else qs("#clean-seach-input").classList.remove("invisible");
  for (let i of keys)
    qs("#search-list").innerHTML += `
      <div id="${i.id}" class="flex-column px-2 pt-1 pointer" onclick="Search_Key_Click(this.id)">
        <i>${i.nameEn}</i>
        <div class="px-1 text-secondary" style="font-size:0.75rem">${i.path.replace("root/","").replaceAll("/"," - ")}</div>
      </div>`
}
function Search_Filter_List() {
  let sEn=qs("#search-input").value.toUpperCase(), sHe=qs("#search-input").value.toUpperCase(); 
  let srcHe = passDB.filter(c => c.type=='key' && c.nameHe.toUpperCase().includes(sHe) && qs("#search-input").value !="")
  let srcEn = passDB.filter(c => c.type=='key' && c.nameEn.toUpperCase().includes(sEn));
  qs("#search-list").innerHTML = "";
  Search_Fill_List([...srcHe,...srcEn]);
}
function Search_Key_Click(id){
  myItem = passDB.filter(c => c.id==id)[0]; 
  pageSender="page-search"; 
  Fill_Key_Entries();
  Goto_Page("page-key-form");
}
function Icon_Search_Back_Click(){
  Goto_Page('page-main');
}
function Icon_Search_Clean_Input(){
  qs("#search-input").value = ""; qs("#search-input").focus();
  Search_Filter_List()
}
function Icon_Search_Clean_Input(){
  Btn_Search_Click();
}

// KEY FORM
function Fill_Key_Entries(){
  qs("#key-name").innerText=myItem.nameEn; 
  for (i of keyEntries) qs("#key-"+i).value = myItem[i]; 
  if(myItem.notes==null) qs("#key-notes").value = "";
}
function Icon_Cancel_Edit_Key(){
  if (addItemSender==1) {
    addItemSender=0; Toggle_Entries(); Goto_Page(pageSender)}
  else {
    Fill_Key_Entries(); Toggle_Entries();}
}
function Icon_Save_Key_Entries(){
  if (addItemSender==1) {
    let newKey = {"id":Generate_NewID(),"path":path, "type":"key", "nameEn":qs("#key-nameEn").value, "nameHe":qs("#key-nameHe").value, "user":qs("#key-user").value, "password":qs("#key-password").value, "url":qs("#key-url").value, "notes":qs("#key-notes").value}; 
    passDB.push(newKey); Write_PassDB(); Fill_Pass_List(); Search_Filter_List();
    addItemSender=0; Toggle_Entries(); Goto_Page(pageSender)}
  else {
    let i = passDB.findIndex(o => o.id==myItem.id)
    for (j of keyEntries) 
      passDB[i][j] = qs("#key-"+j).value;
    Write_PassDB(); Toggle_Entries(); Fill_Pass_List();Search_Filter_List();}
}
function Icon_Copy_Text(e){
  if (navigator.vibrate) navigator.vibrate(300)
  Toast("הטקסט הועתק")
  navigator.clipboard.writeText(qs(e).value); 
  clearTimeout(timer);
  timer = setTimeout(()=> navigator.clipboard.writeText(""),10000);
  }
function Toggle_Entries(){
  for (let j of qsAll('.key-entry', qs('#page-key-form')))
    if (j.type != null) j.disabled = j.disabled == true ?false :true; 
  for (let i of qsAll(".key-form-action",qs("#page-key-form")))
    i.classList.toggle("d-none")
}
function Icon_Toggle_Pass(e) {
  let type = e.previousElementSibling.getAttribute('type') == 'password' ?'text' : 'password';
  e.previousElementSibling.setAttribute('type', type);
  e.classList.toggle('bi-eye'); e.classList.toggle('bi-eye-slash'); 
}
function Icon_Open_Url(){window.open(myItem.url)}
function Icon_KeyForm_Back_Click(){
  Goto_Page(pageSender);
}
function Generate_NewID(){ 
  let tmp='';
  for (let i in '_'.repeat(12))
    tmp += String.fromCharCode(Math.floor(Math.random()*26)+65);
  return tmp.slice(0,4)+"-"+tmp.slice(4,8)+"-"+tmp.slice(-4)
}
function Generate_Password(){
  let newPass='', txt = 'ABCDEFGHIJKLMNPQRSTUVWXYZ23456789abcdefghijkmnopqrstuvwxyz23456789'
  for (let i in '_'.repeat(10))
    newPass += txt[Math.floor(Math.random()*66)]
  if(qs("#key-password").disabled == false)
    qs("#key-password").value = newPass
}
function Input_Key_Change(){
  if (qs("#key-nameEn").value=="")
    qs("#key-name").innerText="מפתח חדש";
  else
    qs("#key-name").innerText=qs("#key-nameEn").value;
}