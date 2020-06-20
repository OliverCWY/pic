require.config({
  baseUrl:"js",
  paths:{
    axios:"//cdn.jsdelivr.net/npm/axios/dist/axios.min",
  }
});

require(["router","communicate"],(router,b)=>{
  window.global={
    sort:"dd",
    page:1,
    pages:1,
    quality:"original",
    snackbar:{
      on:false,
      timeout:1000,
      color:'success',
      message:''
    },
    url_list:["/"]
  }
  const app=new Vue({
    router,
    vuetify:new Vuetify(),
    data:{
      keywords:[123,3435],
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
      search (){
        const query={keyword:this.keyword,search:1};
        this.$router.push({name:"comics",query:query})
      },
      reload_comics(){
        var args=JSON.parse(JSON.stringify(this.$route.query));
        args.s=global.sort;
        args.page=global.page;
        this.$router.replace({query:args})
      },
      reload_images(){
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
  document.getElementById("app").style.display=null;
  window.V=app;
});
