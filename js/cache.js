define(["JSON_storage"],function(J){
  var json_clone=(obj)=>JSON.parse(JSON.stringify(obj));
  const a_week=7*24*60*60*1000,an_hour=60*1000;
  const save_prefixes=["/images"],no_cache=["/comics?favourites"];
  var save,cache={};
  save=J.load("cache_data");
  if(!save)save={};
  var T=new Date();
  for(var i in save)
    if((new Date(save[i].time))-T>a_week)delete save[i];
  function type(name){
    for(var i of no_cache)
      if(name.indexOf(i)==0)return null;
    for(var i of save_prefixes)
      if(name.indexOf(i)==0)return save;
    return cache;
  }
  function write(name,value){
    value=json_clone(value);
    var t=type(name);
    if(!t)return;
    t[name]={
      data:value,
      time:new Date()
    }
    if(t===save)J.save("cache_data",save);
  }
  function read(name){
    var t=type(name);
    if(!(t&&t[name]))return;
    if(t===cache)if((new Date())-cache[name].time>an_hour)delete cache[name];
    return t[name]?json_clone(t[name].data):undefined;
  }
  return {
    write:write,
    read:read
  }
})
