// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        title:null,
		content:null,//内容
		btnOk:null,//确认按钮
		framesIndex:null,
		count:0,
		callback:null,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
		this.title=this.node.getChildByName('title');
		this.content=this.node.getChildByName('content');
		this.btnOk=this.node.getChildByName('okBtn');
		this.node.active = false;
		this.framesIndex=this.node.getChildByName('dice').getComponent('SpriteIndex');
		
	},

    start () {
		
		
    },
	hiddenMyself:function(){
		
		this.node.active=false;
		cc.game.emit('roll-dice-done',this.framesIndex.index+1);
	},
	startRollDice: function(){
			this.node.active =true;
			this.framesIndex.schedule(function(){
				 this.next();
			},0.05,20,0);
	},
    //update (dt) {},
});
