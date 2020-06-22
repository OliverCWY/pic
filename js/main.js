const debug=location.href.indexOf("//localhost")!=-1;
require.config({
  baseUrl:debug?"js":"//cdn.jsdelivr.net/gh/OliverCWY/pic@latest/js/",
  paths:{
    axios:"//cdn.jsdelivr.net/npm/axios/dist/axios.min",
    jszip:"//cdn.jsdelivr.net/gh/Stuk/jszip@3.5.0/dist/jszip.min"
  }
});
require(["router","communicate","utils","tar"],(router,b,utils,tar)=>{
  var json_clone=utils.json_clone;
  var sort=localStorage.getItem("sort");
  var quality=localStorage.getItem("quality");
  if(!sort)sort="dd";
  if(!quality)quality="original";
  window.global={
    sort:sort,
    page:1,
    pages:1,
    quality:quality,
    snackbar:{
      on:false,
      timeout:1000,
      color:'success',
      message:''
    },
    url_list:["/"],
    progress_bar:{
      active:false,
      indeterminate:false,
      value:0,
      striped:false
    }
  }
  localStorage.setItem("sort",sort);
  localStorage.setItem("quality",quality);
  const app=new Vue({
    router,
    vuetify:new Vuetify(),
    data:{
      keywords:[],
      keyword:"",
      sorts:{
        "dd":"新到旧",
        "da":"旧到新",
        "ld":"最多爱心",
        "vd":"最多指名"
      },
      qualities:{
        "original":"原图",
        "high":"高",
        "medium":"中",
        "low":"低"
      },
      global:window.global
    },
    methods:{
      download_episode(){
        var args=json_clone(this.$route.query);
        args.quality=global.quality;
        args.page=99999;
        var array=new Array();
        var i=0;
        var next=()=>{};
        var pages=100,title="";
        next=(data)=>{
          if(data)pages=data.data.pages;
          global.progress_bar.value=i/pages*100;
          i+=1;
          if(i>1){
            for(var image of data.data.pages.docs)
              array.push({name:(array.length+1)+".jpg",url:"https://cors-anywhere.herokuapp.com/"+image})
          }
          args.page=i;
          if(i==1||i<=data.data.pages.pages)
            b.images(args).then(next);
          else{
            global.progress_bar.value=100;
            tar.from_urls(array,3,(i,len)=>{
              if(i==len)
                global.progress_bar={
                  active:true,
                  value:0,
                  striped:false,
                  indeterminate:true
                }
              else{
                global.progress_bar.striped=true;
                global.progress_bar.value=i/len*100;
              }
            }).then(blob=>{
              global.progress_bar.active=false;
              utils.download_blob(title+".zip",blob)
            });
          }
        }
        global.progress_bar={
          active:true,
          value:0,
          striped:true,
          indeterminate:false
        }
        b.images(args).then(data=>{
          data=data.data;;
          title=data.ep.title;pages=data.pages.pages;
          next();
        })
      },
      search (){
        const query={keyword:this.keyword,search:1};
        this.$router.push({name:"comics",query:query})
      },
      reload_comics(){
        var args=JSON.parse(JSON.stringify(this.$route.query));
        args.s=global.sort;
        localStorage.setItem("sort",global.sort);
        args.page=1;
        this.$router.replace({query:args})
      },
      reload_images(){
        localStorage.setItem("quality",global.quality);
        if(this.$route.name=="images"){
          var args=JSON.parse(JSON.stringify(this.$route.query));
          args.quality=this.global.quality;
          args.page=global.page;
          this.$router.replace({query:args})
        }
      },
      reload_page(){
        var args=JSON.parse(JSON.stringify(this.$route.query));
        args.page=global.page;
        this.$router.replace({query:args})
      }
    }
  }).$mount("#app");
  b.keywords().then((data)=>{
    if(data.code==200)app.keywords=data.data.keywords;
  });
  document.getElementById("app").style.display=null;
});
