define({
  download_blob:(name,blob)=>{
    var a = document.createElement('a');
    var url = window.URL.createObjectURL(blob);
    var filename = name;
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  },
  json_clone:(obj)=>JSON.parse(JSON.stringify(obj)),
  disable_log_deployed:()=>{
    if(location.href.indexOf("http://localhost")!=0)console.log=()=>{};
  }
})
