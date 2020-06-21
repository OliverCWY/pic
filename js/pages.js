define(["components","communicate","cache","utils"],(components,B_,cache,utils)=>{
  utils.disable_log_deployed();
  json_clone=utils.json_clone;
  dict={}
  var B={};
  function loading(){
    var snackbar=global.snackbar;
    snackbar.color="info";
    snackbar.message="加载中";
    snackbar.on=true;
    snackbar.timeout=-1;
  }
  function keep_forward_alive(to,from,next){
    var url_list=global.url_list;
    if(url_list.indexOf(to.fullPath)!=-1){
      url_list.length=url_list.indexOf(to.fullPath);
      this.$route.meta.keep_alive=false;
    }else this.$route.meta.keep_alive=true;
    console.log(this.$route.fullPath,this.$route.meta.keep_alive);
    next();
  }
  for(var key in B_){
    const key_=key;
    if(key!="login"&&key!="authorised")
      B[key]=(a,b,c)=>{return B_[key_](a,b,c).then((data)=>{
        var snackbar=global.snackbar;
        if(data.code==401){
          snackbar.message="登录信息失效";
          snackbar.timeout=1000;
          snackbar.color="info";
          snackbar.on=true;
          localStorage.clear();
          location.reload();
          return;
        }
        return data;
      });}
    else B[key]=B_[key];
  }
  return{
  "login-page":{
    data:()=>{return{
      username:"",
      password:"",
      succeed:false
    }},
    methods:{
      login(){
        loading();
        var redirect=this.$route.query.redirect;
        const Router=this.$router;
        const V=global;
        B.login(this.username,this.password).then((data)=>{
          if(data.code==200){
            V.snackbar.message='登陆成功';
            V.snackbar.timeout=1000;
            V.snackbar.color='success';
            setTimeout(()=>Router.push(redirect),1000);
          }else{
            V.snackbar.message='登陆失败';
            snackbar.timeout=1000;
            V.snackbar.color='error';
          }
          V.snackbar.on=true;
        })
      },
    },
    template:`
    <v-container>
      <v-container style="position:relative;top:30px">
        <v-text-field clearable no-filter @keydown="(e)=>{if(e.keyCode==13)login();}" v-model="username" prepend-outer-icon="account" label="用户名"></v-text-field>
        <v-text-field clearable no-filter type="password" @keydown="(e)=>{if(e.keyCode==13)login();}" v-model="password" prepend-outer-icon="lock" label="密码"></v-text-field>
        <v-btn @click="login()" color="primary">登陆</v-btn>
      </v-container>
    </v-container>
    `
  },
  "main-page":{
    components:components,
    data:()=>{return{
      cats:[]
    }},
    methods:{
      load_comics(args){
        console.log(args);
        this.$router.push({name:"comics",query:args});
      },
      load(){
        loading();
        var path=this.$route.fullPath,data=cache.read(path);
        if(data){
          for(var i in data)this[i]=data[i];
          global.snackbar.on=false;
        }else{
          var V=this;
          B.categories().then((data)=>{
            if(data.code==200){
              V.cats=data.data.categories;
              cache.write(path,this.$data);
              global.snackbar.on=false;
            }else{
              var snackbar=global.snackbar;
              snackbar.message="加载失败";
              snackbar.timeout=1000;
              snackbar.color="error";
              snackbar.on=true;
            }
          });
        }
      }
    },
    beforeMount(){
      this.load()
    },
    template:`
      <v-container><v-row>
        <v-col cols="3" v-on:click="load_comics({favourites:1})" v-ripple style="text-align:center">
          <lazy-loading-img src="star.svg" aspect-ratio="1"></lazy-loading-img>
          我的收藏
        </v-col>
        <v-col cols="3" v-for="cat in cats" style="text-align:center" v-on:click="load_comics({category_name:cat.title})" v-ripple>
          <lazy-loading-img :src="cat.thumb" aspect-ratio="1"></lazy-loading-img>
          {{cat.title}}
        </v-col>
      </v-row></v-container>
      `
  },
  "comics-page":{
    components:components,
    data:()=>{return{
      comics:{
        docs:[]
      },
      loading:false,
      scrollTop:51
    }},
    methods:{
      load_next(){
          var args=json_clone(this.$route.query);
          if(!args.page)args.page=this.comics.page;
          if(args.page<this.comics.pages){
            args.page=parseInt(args.page)+1;
            this.$router.replace({query:args});
          }else{
              var snackbar=global.snackbar;
              snackbar.color="info";
              snackbar.message="已是最后一页";
              snackbar.timeout=1000;
              snackbar.on=true;
          };
      },
      load_prev(){
          var args=json_clone(this.$route.query);
          if(args.page>1){
            args.page=parseInt(args.page)-1;
            this.$router.replace({query:args});
          }else{
            var snackbar=global.snackbar;
            snackbar.color="info";
            snackbar.message="已是第一页";
            snackbar.timeout=1000;
            snackbar.on=true;
          }
      },
      load(){
        loading();
        var path=this.$route.fullPath,data=cache.read(path);
        console.log(path);
        if(data){
          for(var i in data)this[i]=data[i];
          console.log(data);
          console.log(this.$data);
          global.snackbar.on=false;
        }else{
          this.comics.docs=[];
          this.loading=true;
          if(document.getElementById("scroll-comics"))document.getElementById("scroll-comics").children[0].style.display="none";
          var args=json_clone(this.$route.query);
          if(!args.page)args.page=1;
          global.page=args.page;
          if(!args.s)args.s=global.sort;
          else {
            global.sort=args.s;
            localStorage.setItem("sort",global.sort);
          }
          B.comics(args).then((data)=>{
            console.log(data);
            if(data.code==200){
              global.snackbar.on=false;
              data=data.data.comics;
              this.comics=data;
              global.page=data.page;
              global.pages=data.pages;
              cache.write(path,this.$data);
              setTimeout(()=>{
                document.getElementById("scroll-comics").children[0].style.display="";
                document.getElementById("scroll-comics").scrollTop=51;
              })
              this.loading=false;
            }else{
              var snackbar=global.snackbar;
              snackbar.color="error";
              snackbar.timeout=1000;
              snackbar.message="加载失败";
              snackbar.on=true;
            }
          });
        }
      },
      scrollHandler(){
        this.scrollTop=document.getElementById("scroll-comics").scrollTop;
      },
      load_comic(bookId){
        this.$router.push({name:"detail",query:{bookId:bookId}})
      }
    },
    beforeRouteEnter(to,from,next){
      if(global.url_list.indexOf(from.fullPath)!=-1)next(vm=>{vm.load()})
      else next((vm)=>{if(document.getElementById("scroll-comics"))document.getElementById("scroll-comics").scrollTop=vm.scrollTop;});
    },
    beforeRouteLeave:keep_forward_alive,
    beforeRouteUpdate(to,from,next){
      next();
      this.load()
    },
    beforeMount(){
      this.load()
    },
    template:`
    <v-container class="py-0" id="scroll-comics" v-scroll.self="scrollHandler">
      <div style="display:none;margin-bottom:12px" class="drag-bar" @click="load_prev">上一页</div>
      <v-container v-for="comic in comics.docs">
        <v-row v-on:click="load_comic(comic._id)" v-ripple>
          <v-col cols="3">
            <lazy-loading-img :src="comic.thumb" aspect-ratio="0.75"></lazy-loading-img>
          </v-col>
          <v-col cols="9">
            <h3>{{comic.title}}</h3>
            <p>{{comic.author}}</p>
            <p>{{comic.chineseTeam}}</p>
            <abbr style="color:grey" v-for='cat in comic.categories'>{{cat+" "}}</abbr><br>
            <v-row>
              <v-col cols="6"><v-icon>visibility</v-icon> {{comic.totalViews}}</v-col>
              <v-col cols="6"><v-icon>favorite</v-icon> {{comic.totalLikes}}</v-col>
            </v-row>
          </v-col>
        </v-row>
        <v-divider></v-divider>
      </v-container>
      <div v-if="comics.docs.length>0" class="drag-bar" style="margin-top:12px" @click="load_next">下一页</div>
    </v-container>
    `
  },
  "detail-page":{
    components:components,
    data:()=>{return{
      detail:{},
      eps:{
        docs:[],
        page:0,
      },
      eps_loading:false
    }},
    methods:{
      load (){
        loading()
        var path=this.$route.fullPath,data=cache.read(path);
        if(data){
          for(var i in data)this[i]=data[i];
          global.snackbar.on=false;
          console.log(data);
        }else{
          this.detail={};
          this.eps.docs=[];
          B.info(this.$route.query.bookId).then((data)=>{
            if(data.code==200){
              global.snackbar.on=false;
              this.detail=data.data.comic;
              cache.write(path,this.$data);
            }else{
              var snackbar=global.snackbar;
              snackbar.color="error";
              snackbar.message="加载失败";
              snackbar.timeout=1000;
              snackbar.on=true;
            }
          });
          this.eps_loading=true;
          var V=this;
          B.episodes(this.$route.query.bookId,1).then((data)=>{
            if(data.code==200){
              this.eps=data.data.eps;
            }else{
              var snackbar=global.snackbar;
              snackbar.color="error";
              snackbar.message="加载失败";
              snackbar.timeout=1000;
              snackbar.on=true;
            }
            V.eps_loading=false;
          });
        }
      },
      like(){
        loading();
        var V=this;
        B.like(this.$route.query.bookId).then((data)=>{
          global.snackbar.on=false;
          if(data.code==200){
            V.detail.isLiked=data.data.action=="like";
          }
        })
      },
      favourite(){
        loading();
        var V=this;
        B.favourite(this.$route.query.bookId).then((data)=>{
          global.snackbar.on=false;
          if(data.code==200){
            V.detail.isFavourite=data.data.action=="favourite";
          }
        })
      },
      load_episodes(){
        loading();
        if(this.eps_loading)return;
        this.eps_loading=true;
        var V=this;
        V.eps.page+=1;
        B.episodes(this.$route.query.bookId,this.eps.page).then((data)=>{
          if(data.code==200){
            global.snackbar.on=false;
            for(ep of data.data.eps.docs)V.eps.docs.push(ep);
          }else{
            V.eps.page-=1;
            var snackbar=global.snackbar;
            snackbar.color="error";
            snackbar.message="加载失败";
            snackbar.timeout=1000;
            snackbar.on=true;
          }
          V.eps_loading=false;
        });
      },
      load_comics(args){
        this.$router.push({name:"comics",query:args})
      },
      load_images(epsId){
        this.$router.push({name:"images",query:{bookId:this.$route.query.bookId,epsId:epsId}});
      }
    },
    beforeRouteLeave:keep_forward_alive,
    beforeRouteEnter(to,from,next){
      if(global.url_list.indexOf(from.fullPath)!=-1)next(vm=>{vm.load()})
      else next();
    },
    beforeRouteUpdate(to,from,next){
      next();
      this.load()
    },
    beforeMount(){
      this.load()
    },
    template:`
    <v-container>
      <v-row>
        <v-col cols="3">
          <lazy-loading-img :src="detail.thumb"/>
        </v-col>
        <v-col cols="9">
          <h3>{{detail.title}}({{detail.pagesCount}}P)</h3>
          <p>{{detail.author}}</p>
          <p>{{detail.chineseTeam}}</p>
          <v-row><v-chip style="color:grey" v-for='cat in detail.categories' class="mx-1" x-small pill ripple @click="load_comics({category_name:cat})">{{cat}}</v-chip></v-row>
          <div style="width:100%;height:10px"></div>
          <v-row><v-chip style="color:grey" v-for='tag in detail.tags' class="mx-1" x-small pill ripple @click="load_comics({tag_name:tag})">{{tag}}</v-chip></v-row>
        </v-col>
      </v-row>
      <v-row class="detail-buttons">
        <v-col cols="4">
          <v-icon large>visibility</v-icon>
          <br>
          {{detail.totalViews}}
        </v-col>
        <v-col cols="4">
          <v-icon large color="pink" @click="like()">{{detail.isLiked?"favorite":"favorite_border"}}</v-icon>
          <br>
          {{detail.totalLikes}}
        </v-col>
        <v-col cols="4">
          <v-icon large color="#FFD700" @click="favourite()">{{detail.isFavourite?"star":"star_border"}}</v-icon>
          <br>
          {{detail.isFavourite?"已收藏":"未收藏"}}
        </v-col>
        <v-col cols="4">
        </v-col>
      </v-row>
      <v-row no-gutters>
          <v-col cols="3" v-for="ep in eps.docs" style="height:40px;">
            <v-btn style="width:100%;overflow:hidden;" @click="load_images(ep.order)">{{ep.title}}</v-btn>
          </v-col>
          <v-col v-if="eps.page<eps.pages" disabled="eps_loading" cols=12><v-btn block @click="load_episodes()">加载更多</v-btn></v-col>
      </v-row>
    </v-container>
    `
  },
  'images-page':{
    components:components,
    data:()=>{return{
      images:{
        docs:[],
        page:1,
        pages:0
      },
      loading:false,
    }},
    methods:{
      load_next(){
          var args=json_clone(this.$route.query);
          if(!args.page)args.page=this.images.page;
          if(args.page<this.images.pages){
            args.page=parseInt(args.page)+1;
            this.$router.replace({query:args});
          }else{
            args.page=1;
            args.epsId=parseInt(args.epsId)+1;
            loading();
            var Router=this.$router;
            B.images(args).then((data)=>{
              if(data.code==200){
                Router.push({query:args});
              }else{
                var snackbar=global.snackbar;
                snackbar.color="info";
                snackbar.message="已是最后一页";
                snackbar.timeout=1000;
                snackbar.on=true;
              }
            });
          }
      },
      load_prev(){
          var args=json_clone(this.$route.query);
          if(!args.page)args.page=this.images.page;
          if(args.page>1){
            args.page=parseInt(args.page)-1;
            this.$router.replace({query:args});
          }else{
            if(args.epsId>1){
              args.epsId=parseInt(args.epsId)-1;
              this.$router.replace({query:args})
            }else{
              var snackbar=global.snackbar;
              snackbar.color="info";
              snackbar.message="已是第一页";
              snackbar.timeout=1000;
              snackbar.on=true;
            }
          }
      },
      load(){
        loading();
        var path=this.$route.fullPath,data=cache.read(path);
        if(data){
          for(var i in data)this[i]=data[i];
          global.snackbar.on=false;
        }else{
          this.images.docs=[];
          if(document.getElementById("scroll-image"))document.getElementById("scroll-image").children[0].style.display="none";
          var args=json_clone(this.$route.query);
          if(!args.page)args.page=1;
          global.page=args.page;
          if(!args.quality)args.quality=global.quality;
          else{
            global.quality=args.quality;
            localStorage.setItem("quality",global.quality);
          }
          B.images(args).then((data)=>{
            if(data.code==200){
              global.snackbar.on=false;
              data=data.data.pages;
              this.images=data;
              global.page=data.page;
              global.pages=data.pages;
              cache.write(path,this.$data);
              setTimeout(()=>{
                document.getElementById("scroll-image").children[0].style.display="";
                document.getElementById("scroll-image").scrollTop=51;
              })
            }else{
              var snackbar=global.snackbar;
              snackbar.color="error";
              snackbar.timeout=1000;
              snackbar.message="加载失败";
              snackbar.on=true;
            }
            this.loading=false;
          });
        }
      }
    },
    beforeRouteLeave:keep_forward_alive,
    beforeRouteUpdate(to,from,next){
      next();
      this.load()
    },
    beforeMount(){
      this.load()
    },
    template:`
    <v-container class="py-0" id="scroll-image">
      <div class="drag-bar" style="display:none;margin-bottom:12px;" @click="load_prev">上一页</div>
      <lazy-loading-img :src="url" v-for="url in images.docs" style="min-height:60%"/>
      <div v-if="images.docs.length>0" class="drag-bar" style="margin-top:12px;" @click="load_next">下一页</div>
    </v-container>
    `
  }
}})
