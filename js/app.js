//全局对象保存
window.app={
	
	serverUrl:'http://47.107.123.203:8080',
	imgServer:'http://47.107.123.203:8888',
	nettyServer:'ws://47.107.123.203:7777/ws',
	isNotNull:function(str){
		if(str!=null&&str!=""&&str!='undefined'){
			return true;
		}
		return false;
	},
	getUserGlobalInfo:function(){
		return JSON.parse(plus.storage.getItem("userInfo"));
	},
	
	setFriendsList:function(data){
		plus.storage.setItem("friendsList",JSON.stringify(data))
	},
	getFriendsList:function(){
		return JSON.parse(plus.storage.getItem("friendsList"));
	},
	
	/**
	 *聊天行为和后端的枚举对呀 
	 */
	CONNECT: 1,//连接
	CHAT: 2,  //聊天
	SIGEND: 3, //消息签收
	KEEPALIVE: 4,//保持心跳
	PULL_FRIEND: 5 ,//拉取好友列表
	
	/**
	 * 和后端的聊天对象对应起来
	 */
	ChatMsg:function(sendUserId,acceptUserId,msg,msgId){
		this.sendUserId=sendUserId;
		this.acceptUserId=acceptUserId;
		this.msg=msg;
		this.msgId=msgId;
	},
	/* 
	  *聊天转输对象
	 */
	DataContent: function(action, chatMsg, extand){
		this.action = action;
		this.chatMsg = chatMsg;
		this.extand = extand;
	},
	mySender:1,
	myFriendSender:2,
	/**
	 * 保存我和朋友的聊天记录
	 * flag  我发送还是我朋友发送
	 */
	saveChatHistory:function(myId,myFriendId,msg,flag){
		var me=this;
		//构建聊天对象
		var chatMsg={
			'myId':myId,
			'myFriendId':myFriendId,
			'msg':msg,
			'flag':flag
		}
		var historyKey="chat-"+myId+"-"+myFriendId;
		//从本地中获取聊天信息是否存在
		var historyListStr=plus.storage.getItem(historyKey);
		var historyList;
		if(me.isNotNull(historyListStr)){
			historyList=JSON.parse(historyListStr);
		}else{
			historyList=[];
		}
		historyList.push(chatMsg);
		plus.storage.setItem(historyKey,JSON.stringify(historyList));
	},
	getChatHistory:function(myId,myFriendId){
		var me=this;
		var historyKey="chat-"+myId+"-"+myFriendId;
		var historyListStr=plus.storage.getItem(historyKey);
		if(me.isNotNull(historyListStr)){
			return JSON.parse(historyListStr)
		}else{
			return [];
		}
	},
	/**
	 * 聊天记录的快照，仅仅保存最后一条消息
	 */
	saveUserChatSnapshot:function(myId,myFriendId,msg,isRead){
		var me=this;
		var key="chat-snapshot-"+myId;
		var listStr=plus.storage.getItem(key);
		var chatList;
		var snapshot={
			'myId':myId,
			'myFriendId':myFriendId,
			'msg':msg,
			'isRead':isRead
		}
		if(me.isNotNull(listStr)){
			chatList=JSON.parse(listStr);
			for(var i=0;i<chatList.length;i++){
				if(chatList[i].myFriendId==myFriendId){
					//如果该还有已有快照，则从快照列表中删除，重新添加新的快照
					chatList.splice(i,1);
					break;
				}
			}			
		}else{
			chatList=[];
		}
		//向数组中添加快照对象
		chatList.unshift(snapshot);
		plus.storage.setItem(key,JSON.stringify(chatList));
	},
	getUserChatSnapshot:function(myId){
		var me=this;
		var key="chat-snapshot-"+myId;
		var listStr=plus.storage.getItem(key);
		var chatList;
		if(me.isNotNull(listStr)){
			chatList=JSON.parse(listStr);
		}else{
			chatList=[]
		}
		
		return chatList;
	},
	getFriendInfoByFriendId: function(friendId){
		var me=this;
		var friendList=me.getFriendsList();
		if(me.isNotNull(friendList)){
		   for(var i=0;i<friendList.length;i++){
			   if(friendId==friendList[i].userId){
				   return friendList[i];
			   }
		   }
		}
		return null;
	},
	deleteWithFriendChatHistoryAndSnapshot(myId,myFriendId){
		var historyKey="chat-"+myId+"-"+myFriendId;
		//删除聊天记录
		plus.storage.removeItem(historyKey);
		//删除快照记录
		var key="chat-snapshot-"+myId;
		var list=this.getUserChatSnapshot(myId)
		
		for(var i=0;i<list.length;i++){
			if(list[i].myFriendId==myFriendId){
				list.splice(i,1);
			}
		}
		plus.storage.setItem(key,JSON.stringify(list));
	},
	//标记未读消息为已读消息
	
	changeSnopIsread(myId,myFriendId){
		var key="chat-snapshot-"+myId;
		var list=this.getUserChatSnapshot(myId);
		for(var i=0;i<list.length;i++){
			if(list[i].myFriendId==myFriendId){
				list[i].isRead=true;
			}
		}
		plus.storage.setItem(key,JSON.stringify(list));
	}
	
}