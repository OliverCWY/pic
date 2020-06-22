define(["tarball","axios"],(tarball,axios)=>{
  function from_urls(array,threads,progress){
    if(!threads)threads=5;
    var len=array.length;
    var promise_array=new Array(len);
    var completed=0;
    var tar_file=new tarball.Writer();
    return (new Promise((resolve,reject)=>{
      var next=function next(){
        completed+=1;
        if(typeof(progress)=="function")progress(completed,len);
        if(completed==len)resolve();
        if(completed+threads<=len){
          const i=completed+threads-1;
          promise_array[i]=axios.get(array[i].url,{responseType:"blob"})
            .then(data=>{promise_array[i]=data.data}).then(next);
        }
      }
      progress(completed,len)
      for(var i=0;i<threads&&i<len;i++){
        const i_=i;
        promise_array[i_]=axios.get(array[i_].url,{responseType:"blob"})
          .then(data=>{promise_array[i_]=data.data;}).then(next);
      }
    })).then(()=>{
      for(var i=0;i<len;i++){
        tar_file.addFile(array[i].name,new File([promise_array[i]],""));
      }
      return tar_file.write()
    });
  }
  return {
    from_urls:from_urls
  }
})
