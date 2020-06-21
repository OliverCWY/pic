define({
  load:(name)=>{return JSON.parse(localStorage.getItem(name));},
  save:(name,value)=>{return localStorage.setItem(name,JSON.stringify(value))}
});
