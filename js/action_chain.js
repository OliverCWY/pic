class action_chain{
  constructor(action,next){
    this.action=action;
    self.next=next;
  }
  run(data){
    let now=this.action(data);
    if(this.next!=undefined)return this.next.run(now);
    return now;
  }
  then(next){
    if(typeof(next)=="action_chain")
      this.next=next;
    else
      this.next=new action_chain(next);
    return this.next;
  }
}
define([],()=>action_chain);
