// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
		basex: 0,
		basey: 0,
		stepx: 0,
		stepy: 0,
        singleMist: null,
		mistArr: null,
		cnt:0,
		map:null,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
		this.singleMist = new cc.Node();
		this.singleMist.addComponent(cc.Sprite);
		cc.loader.loadRes('迷雾',cc.SpriteFrame,function(err,spriteFrame) {
            this.getComponent(cc.Sprite).spriteFrame = spriteFrame;
	    }.bind(this.singleMist));
	},

    start () {
		
		
    },
	getMistArr: function() {
		this.map = cc.find('Canvas/map').getComponent('GetMap');
		var map_matrix = [
			[1,1,1,1,1,1,1,1,1,1,1],
			[1,1,0,0,0,1,0,0,0,1,1],
			[1,0,1,0,0,1,0,0,1,0,1],
			[1,0,0,1,1,0,1,1,0,0,1],
			[1,0,0,1,0,0,0,1,0,0,1],
			[1,1,1,1,1,1,1,1,1,1,1],
			[1,0,0,1,0,0,0,1,0,0,1],
			[1,0,0,1,1,0,1,1,0,0,1],
			[1,0,1,0,0,1,0,0,1,0,1],
			[1,1,0,0,0,1,0,0,0,1,1],
			[1,1,1,1,1,1,1,1,1,1,1],
		];
		this.mistArr = new Array();
		for (var i = 0; i < 11; i++) {
			this.mistArr[i] = new Array();
			for (var j = 0; j < 11; j++) {
				if (map_matrix[i][j] == 0)
					this.mistArr[i][j] = null;
				else {
					
					this.mistArr[i][j] = cc.instantiate(this.singleMist);
					this.mistArr[i][j].setPosition(this.basex+this.stepx*i, this.basey+this.stepy*j);
					this.mistArr[i][j].parent = this.node;
				}
			}
		}
	},

    update (dt) {
		if (this.cnt == 10) {
			this.getMistArr();
		}
		this.cnt++;
		
		
		if (this.cnt == 16) {
			this.cnt -= 5;
			var person = cc.find('Canvas/Persons/Person1').getComponent('Person');
			var dis = this.map.BfsDis(person.posX, person.posY);
			for (var i = 0; i < 11; i++) {
				for (var j = 0; j < 11; j++) {
					if (dis[i][j] == -1)
						continue;
					if (dis[i][j] <= person.sight)
						this.mistArr[i][j].active = false;
					else
						this.mistArr[i][j].active = true;
				}
			}
			for (var i=0;i<person.eyes.length;++i){
				for (var j=0;j<person.eyes[i].length;++j){
					this.mistArr[person.eyes[i][j][0]][person.eyes[i][j][1]].active=false;
				}
			}
			var index=Number(person.node.name[6]);
			var teammate=index+2>4?index-2:index+2;
			var enemy1=index+1>4?index-3:index+1;
			var enemy2=teammate+1>4?teammate-3:teammate+1;
			teammate=cc.find("Canvas/Persons/Person"+teammate).getComponent('Person');
			dis = this.map.BfsDis(teammate.posX, teammate.posY);
			for (var i = 0; i < 11; i++) {
				for (var j = 0; j < 11; j++) {
					if (dis[i][j] == -1)
						continue;
					if (dis[i][j] <= person.sight)
						this.mistArr[i][j].active = false;
				}
			}
			for (var i=0;i<teammate.eyes.length;++i){
				for (var j=0;j<teammate.eyes[i].length;++j)
					this.mistArr[teammate.eyes[i][j][0]][teammate.eyes[i][j][1]].active=false;
			}			
			
			enemy1=cc.find("Canvas/Persons/Person"+enemy1).getComponent('Person');
			enemy2=cc.find("Canvas/Persons/Person"+enemy2).getComponent('Person');
			if (enemy1.isDead == 0 && enemy1.exposed == 1)
				this.mistArr[enemy1.posX][enemy1.posY].active = false;
			if (enemy2.isDead == 0 && enemy2.exposed == 1)
				this.mistArr[enemy2.posX][enemy2.posY].active = false;
			
			var ps2 = cc.find('Canvas/Persons/Person2').getComponent('Person');
			var ps4 = cc.find('Canvas/Persons/Person4').getComponent('Person');
			if (this.mistArr[ps2.posX][ps2.posY].active == true && ps2.exposed != 1)
				ps2.avatar.opacity = 0;
			else
				ps2.avatar.opacity = 255;
			if (this.mistArr[ps4.posX][ps4.posY].active == true && ps4.exposed != 1)
				ps4.avatar.opacity = 0;
			else
				ps4.avatar.opacity = 255;
			
		}
		
	},
});


















