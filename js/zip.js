define(["jszip","axios"],(jszip,axios)=>{
  function zip_urls(array,threads,progress){
    if(!threads)threads=5;
    var len=array.length;
    var promise_array=new Array(len);
    var completed=0;
    var zip_file=new jszip();
    return (new Promise((resolve,rejecct)=>{
      var next=()=>{}
      next=()=>{
        completed+=1;
        if(typeof(progress)=="function")progress(completed,len);
        if(completed==len)resolve();
        if(completed+threads<=len){
          const i=completed+threads-1;
          promise_array[i]=axios.get(array[i].url,{responseType:"blob"})
            .then(data=>{promise_array[i]=data.data}).then(next);
        }
      }
      for(var i=0;i<threads&&i<len;i++){
        const i_=i;
        promise_array[i_]=axios.get(array[i_].url,{responseType:"blob"})
          .then(data=>{promise_array[i_]=data.data;}).then(next);
      }
    })).then(()=>{
      for(var i=0;i<len;i++){
        zip_file.file(array[i].name,promise_array[i]);
      }
      return zip_file.generateAsync({type:"blob"})
    });
  }
  return {
    zip_urls:zip_urls
  }
})
