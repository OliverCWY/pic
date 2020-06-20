define(["axios","action_chain"],(axios,action_chain)=>{
  const api_host="//picaapis100.herokuapp.com/";
  let token=localStorage.getItem("token");
  function request(path,data){
    if(data==undefined)data={};
    data.token=token;
    let session=axios.get(api_host+"/"+path,{
      params:data
    });
    let actions=new action_chain((data)=>{
      if(data.code==401)token=null;
      return data.data;
    });
    session.then((data)=>{actions.run(data);});
    return actions;
  }
  function find_image(image){
    return ((image.fileServer!="https://wikawika.xyz/static/")?image.fileServer+"/static/":image.fileServer)+image.path;
  }
  function clean_comics(comics){
    let cleaned=new Array();
    for(var cat of comics){
      if(cat.isWeb!=true){
        let c=new Object();
        c=cat;
        c.thumb=find_image(cat.thumb);
        cleaned.push(c);
      }
    }
    return cleaned;
  }
  function categories(){
    return request("categories").then((data)=>{
      if(data.code==200){
          let cleaned=new Array();
          for(var cat of data["data"]["categories"]){
            if(cat.isWeb!=true){
              let c=new Object();
              c.title=cat.title;
              c.thumb=find_image(cat.thumb);
              cleaned.push(c);
            }
          }
          data.data.categories=cleaned;
      }
      return data;
    });
  }
  function login(username,password){
    return request("sign-in",{email:username,password:password}).then((data)=>{
      if(data.code==200)token=data.data.token;
      localStorage.setItem("token",token);
      return data;
    });
  }
  function comics(args){
    args=JSON.parse(JSON.stringify(args));
    if(args.category_name){
      args.c=args.category_name;
      delete args.category_name;
    }else if(args.tag_name){
      args.t=args.tag_name;
      delete args.tag_name;
    }
    return request("comics",args).then((data)=>{
      if(data.code==200){
          data.data.comics.docs=clean_comics(data.data.comics.docs);
      }
      return data;
    });
  }
  function keywords(){
    return request("keywords")
  }
  function info(bookId){
    return request("comics/"+bookId).then((data)=>{
      if(data.code==200){
        data_=data.data.comic;
        data_.thumb=find_image(data_.thumb);
        data.data.comic=data_;
      }
      return data;
    })
  }
  function episodes(bookId,page){
    return request(`comics/${bookId}/eps`,{page:page});
  }
  function images(args){
    console.log(args);
    bookId=args.bookId;
    epsId=args.epsId;
    args=JSON.parse(JSON.stringify(args));
    delete args.bookId;
    delete args.epsId;
    if(!args.pages)args.pages=1;
    return request(`comics/${bookId}/${epsId}/pages`,args).then((data)=>{
      console.log(data);
      if(data.code==200){
        let cleaned=new Array();
        for(var c of data.data.pages.docs){
          cleaned.push(find_image(c.media));
        }
        data.data.pages.docs=cleaned;
      }
      return data;
    });
  }
  function like(bookId){
    return request(`comics/${bookId}/like`);
  }
  function favourite(bookId){
    return request(`comics/${bookId}/favourite`);
  }
  function favourites(page){
    return request("favourites",{page:page}).then((data)=>{
      if(data.code==200){
        data.data.comics.docs=clean_comics(data.data.comics.docs);
      }
      return data;
    });
  }
  return {
    categories:categories,
    login:login,
    comics:comics,
    keywords:keywords,
    info:info,
    episodes:episodes,
    images:images,
    like:like,
    favourite:favourite,
    favourites:favourites,
    authorised:()=>{return token!=null&&token!="null";}
  }
});
