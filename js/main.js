require.config({
  baseUrl:"js",
  paths:{
    axios:"//cdn.jsdelivr.net/npm/axios/dist/axios.min",
    communicate:"communicate",
    action_chain:"action_chain",
    components:"components"
  }
});

require(["axios","communicate","components"],(axios,Bk,components)=>{
  var comics_args={},
      images_args={},
      loading_comics=false,
      loading_images=false,
      episode_page_now=0;
      window.deliberate_change=false;
  var change_href=(href)=>{
    if(location.href==(new URL(href,location.href)).href){
      deliberate_change=false;
      return;
    }
    location.href=href;
    deliberate_change=true;
  }
  var process_url=()=>{
      if(!Bk.authorised()){
        V.type="login";
        return;
      }
      href=location.href+"";
      if(V.keywords.length==0){
        V.load_keywords();
      }
      if(deliberate_change){
        deliberate_change=false;
        return;
      }
      if(href.indexOf("#")==-1||href.indexOf("#")==href.length-1){
        if(V.cats.length==0)

            Bk.categories().then((data)=>{
              for(cat of data.data.categories){
                Vue.set(V.cats,V.cats.length,cat);
              }
              change_href("#");
              V.type="main";
              V.page=null;
            });

        else {V.type="main";V.page=null;}
        return;
      }
      href=href.substr(href.indexOf("#")+1);
      if(href.indexOf("comics_")==0){
        args=JSON.parse(unescape(href.substr(7)));
        V.sort=args.s;
        V.load_comics(args);
        return;
      }
      if(href.indexOf("comic_")==0){
        bookId=href.substr(6);
        V.load_comic(bookId);
        return;
      }
      if(href.indexOf("images_")==0){
        args=JSON.parse(unescape(href.substr(7)));
        V.load_images(args);
        return;
      }
  }
  let V=new Vue({
    el: '#app',
    vuetify: new Vuetify(),
    data:{
      type:"",
      cats:[],
      comics:{},
      detail:{},
      images:[],
      episodes:[],
      keyword:"",
      keywords:[],
      page:null,
      max_pages:0,
      logins:{
        username:"",
        password:""
      },
      sorts:{
        "dd":"新到旧",
        "da":"旧到新",
        "ld":"最多爱心",
        "vd":"最多指名"
      },
      sort:"dd",
      qualities:{
        "original":"原图",
        "high":"高",
        "medium":"中",
        "low":"低"
      },
      quality:"original",
      snackbar:{
        enabled:false,
        timeout:2000,
        color:undefined,
        text:""
      }
    },
    methods:{
      key_down_search:function(e){
        if(e.keyCode==13)this.search();
      },
      key_down_page:function(e){
        if(e.keyCode==13){
          href=location.href;
          if(href.indexOf("#")!=-1){
            args=JSON.parse(unescape(href.substr(href.indexOf("_")+1)));
            args.page=e.target.value;
            location.href=(href.substr(0,href.indexOf("_")+1)+JSON.stringify(args));
          }
        }
      },
      load_comics_func:function(clear){
        var V=this;
        if(clear)return (data)=>{
          V.page=data.data.comics.page;
          V.max_pages=data.data.comics.pages;
          V.comics=data.data.comics;
          V.type="comics";
          loading_comics=false;
        }
        else return (data)=>{
          for(comic of data.data.comics.docs){
            V.comics.docs.splice(V.comics.docs.length,0,comic);
          }
          V.type="comics";
          loading_comics=false;
        }
      },
      load_images_func:function(clear){
        var V=this;
        if(clear)return (data)=>{
          V.page=data.data.pages.page;
          V.max_pages=data.data.pages.pages;
          V.images=data.data.pages.docs;
          V.type="images";
          loading_images=false;
        }
        else return (data)=>{
          for(comic of data.data.pages.docs){
            V.images.splice(V.images.length,0,comic);
          }
          V.type="images";
          loading_images=false;
        }
      },
      on_comics_scroll:function(e){
        e=e.target;
        if(!this.loading_comics&&e.clientHeight+e.scrollTop>=e.scrollHeight)this.load_comics_next();
      },
      load_comics:function(args){
        this.comics=[];
        loading_comics=true;
        if(!args.page)args.page=1;
        if(!args.s)args.s=this.sort;else this.sort=args.s;
        comics_args=args;
        change_href(`#comics_${JSON.stringify(args)}`);
        Bk.comics(args).then(this.load_comics_func(true));
      },
      reload_comics:function(){
        let args=comics_args;
        args.s=this.sort;
        this.load_comics(args);
      },
      load_comics_next:function(){
        loading_comics=true;
        comics_args.page+=1;
        args=comics_args;
        Bk.comics(args).then(this.load_comics_func(false));
      },
      on_images_scroll:function(e){
        e=e.target;
        if(!this.loading_images&&e.clientHeight+e.scrollTop>=e.scrollHeight)this.load_images_next();
      },
      load_images:function(args){
        this.images=[];
        loading_images=true;
        if(!args.page)args.page=1;
        if(!args.quality)args.quality=this.quality;else this.quality=args.quality;
        images_args=args;
        change_href(`#images_${JSON.stringify(args)}`);
        Bk.images(args).then(this.load_images_func(true));
      },
      reload_images:function(){
        let args=images_args;
        args.quality=this.quality;
        this.load_images(args);
      },
      load_images_next:function(){
        loading_images=true;
        images_args.page+=1;
        args=images_args;
        Bk.images(args).then(this.load_images_func(false));
      },
      load_comic:function(bookId){
        this.detail=[];
        var V=this;
        V.episodes=[];
        V.episode_page_now=1;
        change_href(`#comic_${bookId}`);
        Bk.info(bookId).then((data)=>{
          V.detail=data.data.comic;
          V.page=null;
        });
        this.load_episode(bookId,1);
        V.type="detail";
      },
      load_episode:function(bookId,page){
        var V=this;
        Bk.episodes(bookId,page).then((data)=>{
          for(var ep of data.data.eps.docs){
            V.episodes.splice(V.episodes.length,0,ep);
          }
        });
      },
      search:function(){
        this.load_comics({keyword:this.keyword,search:1});
      },
      like:function(bookId){
        var V=this;
        Bk.like(bookId).then((data)=>{
          if(data.code==200){
            V.detail.isLiked=data.data.action=="like";
          }
        })
      },
      favourite:function(bookId){
          var V=this;
          Bk.favourite(bookId).then((data)=>{
            if(data.code==200){
              V.detail.isFavourite=data.data.action=="favourite";
            }
          })
      },
      load_keywords:function(){
        Bk.keywords().then((data)=>{
          if(data.code==200){
              V.keywords.splice(V.keywords.length);
              for(keyword of data.data.keywords){
                V.keywords.splice(V.keywords.length,0,keyword);
              }
          }
        })
      },
      login:function(){
        args=JSON.parse(JSON.stringify(this.logins));
        Bk.login(args.username,args.password).then((data)=>{
          if(data.code==200){
            this.snackbar.color="success";
            this.snackbar.text="登陆成功";
            this.snackbar.enabled=true;
            location.reload();
          }else{
            this.snackbar.color="error";
            this.snackbar.text="登陆失败";
            this.snackbar.enabled=true;
          }
        });
      }
    },
    components:components
  });
  document.getElementById("app").style="";
  process_url();
  window.addEventListener('hashchange', process_url);
  window.V=V;
});
