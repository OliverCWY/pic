define(["pages","communicate"],(pages,B)=>{
  const routes=[
    {name:"main",path:"/",component:pages["main-page"],meta:{keep_alive:true}},
    {name:"detail",path:"/detail",component:pages["detail-page"],meta:{keep_alive:true}},
    {name:"login",path:"/login",component:pages["login-page"],query:{redirect:"/"}},
    {name:"comics",path:"/comics",component:pages["comics-page"],meta:{keep_alive:true}},
    {name:"images",path:"/images",component:pages["images-page"]}
  ]
  const router=new VueRouter({
    routes
  });
  router.beforeEach((to, from, next) => {
    var url_list=global.url_list;
    if(url_list.indexOf(to.fullPath)!=-1)url_list.length=url_list.indexOf(to.fullPath);
    url_list.push(to.fullPath);
    if (to.name!="login") {
      if (!B.authorised()) {
        next({
          name: 'login',
          query: { redirect: to.fullPath}
        })
      } else {
        next()
      }
    } else {
      if(B.authorised()){
        if(to.query.redirect)next(to.query.redirect);
        next("/")
      }
      else{
        next()
      }
    }
  })
  return router;
});
