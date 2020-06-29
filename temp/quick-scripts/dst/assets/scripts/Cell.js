
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/scripts/Cell.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, 'a088blxo9JDma4uk/IA4USI', 'Cell');
// scripts/Cell.js

"use strict";

// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html
cc.Class({
  "extends": cc.Component,
  properties: {
    mapx: 0,
    //在map[i][j]中的横坐标
    mapy: 0,
    //在map[i][j]中的纵坐标
    kind: null,
    //格子的类型，0:空白格，1:卡牌格，2:事件格
    inMonitor: 0,
    //用来判断是否处于监听中的标记
    routeID: null //记录这个cell是map中哪条route的终点，即在routes中的下标

  },
  setColor: function setColor() {
    //设置cell的颜色为绿色，表示可走
    this.node.color = cc.color(102, 255, 102, 255);
  },
  resetColor: function resetColor() {
    //还原cell的颜色
    this.node.color = cc.color(255, 255, 255, 255);
  },
  getOneCard: function getOneCard(person_js, cardName, totCardNum) {
    //随机获得1张牌
    var cardID = Math.floor(Math.random() * totCardNum);
    person_js.cards.push(cardID); //创建用来提示获得卡牌的精灵节点

    var node = cc.instantiate(window.global.cardnode[cardID]);
    node.setPosition(0, 0); //开启note节点的监听，点击后消失

    node.msg = '获得卡牌:' + cardName[cardID];
    node.on('mousedown', function (event) {
      cc.game.emit('stepOnCell-done', this.msg);
      this.destroy();
    }, node);
    node.parent = this.node.parent.parent;
  },
  chooseFromThree: function chooseFromThree(cardName, totCardNum) {
    var cd = [];
    cd[0] = Math.floor(Math.random() * totCardNum);
    cd[1] = Math.floor(Math.random() * totCardNum);
    cd[2] = Math.floor(Math.random() * totCardNum);
    console.log(cd);

    for (var i = 0; i < 3; i++) {
      var node = cc.instantiate(window.global.cardnode[cd[i]]);
      node.name = 'chooseFromThree' + i;
      node.setPosition(-500 + 500 * i, 0);
      node.cardID = cd[i];
      node.msg = '获得卡牌:' + cardName[cd[i]];
      node.on('mousedown', function (event) {
        var person_js = cc.find('Canvas').getComponent('globalGame').nowPlayer.getComponent('Person');
        console.log('得到卡牌:' + this.cardID);
        person_js.cards.push(this.cardID);
        cc.game.emit('stepOnCell-done', this.msg);

        for (var j = 0; j < 3; j++) {
          cc.find('Canvas/chooseFromThree' + j).destroy();
        }
      }, node);
      node.parent = this.node.parent.parent;
    }
  },
  eventAction: function eventAction(person_js) {
    //随机产生6个事件之一
    var rand_event = Math.floor(Math.random() * 6); //创建用来提示获得触发事件的精灵节点

    var note = new cc.Node();
    note.addComponent(cc.Sprite);
    note.setPosition(0, 0);
    note.parent = this.node.parent.parent;
    var self = note,
        event_name;

    if (rand_event == 0) {
      //陷阱
      event_name = "陷阱";
      person_js.useCardEnabled = 0; //本回合不可使用卡牌,下回合置1
      //warning: 下回合记得改变
    } else if (rand_event == 1) {
      //监狱
      event_name = "监狱"; //下回合不可走

      person_js.goEnabled = 0; //warning: 下回合记得改变
    } else if (rand_event == 2) {
      //恶魔
      event_name = "恶魔"; //损失一滴血量

      person_js.blood--;
    } else if (rand_event == 3) {
      //奥利给
      event_name = "奥利给";
      person_js.turn++; //获得回合
    } else if (rand_event == 4) {
      //视野
      event_name = "视野"; //to do
    } else if (rand_event == 5) {
      //天使
      event_name = "天使";
      person_js.blood = Math.floor(person_js.blood * 1.5);
    }

    cc.loader.loadRes('事件图片/' + event_name, cc.SpriteFrame, function (err, spriteFrame) {
      self.getComponent(cc.Sprite).spriteFrame = spriteFrame;
    }); //开启note节点的监听，点击后消失

    note.msg = '触发事件:' + event_name;
    note.on('mousedown', function (event) {
      cc.game.emit('stepOnCell-done', this.msg);
      this.destroy();
    }, note);
  },
  specialJudge: function specialJudge(role) {
    if (this.haveMine == 1) {
      role.exposed = 1;
      role.blood -= this.mineAttack;
      if (role.blood <= 0) role.isDead = 1;
      console.log('****', this.mineAttack);
      var buff = cc.find('Canvas').getComponent('Buff');
      buff.todoList.push({
        endTurn: window.global.nowTurn + 1,
        person: role,
        act: function act() {
          if (this.person != cc.find('Canvas').getComponent('globalGame').nowProperty) return false;
          this.person.exposed = 0;
          return true;
        }
      });
      this.haveMine = 0;
    }
  },
  stepOnCell: function stepOnCell(person) {
    //获取person节点的组件
    var person_js = person.getComponent('Person');
    this.specialJudge(person_js);

    if (this.kind == 0) {
      //空白格
      cc.game.emit('stepOnCell-done', ''); //发送空串

      return;
    } else if (this.kind == 1) {
      //卡牌格
      var cardName = ['炸弹', '精准导弹', '地雷', '庇护', '天使的庇护', '战神的祝福', '虚弱', '团队的力量', '治愈', '圣光普照', '望远镜', '眼睛', '猛男的祝福', '盗取', '束缚', '迷惑', '拯救'];
      var totCardNum = 17;
      var rand_val = Math.random();
      console.log('rand_val' + rand_val);

      if (rand_val < 0.5) {
        //得到一张牌
        this.getOneCard(person_js, cardName, totCardNum);
      } else {
        //三张中抽一张
        this.chooseFromThree(cardName, totCardNum);
      }
    } else if (this.kind == 2) {
      //事件格
      this.eventAction(person_js); //响应事件
    }
  },
  // LIFE-CYCLE CALLBACKS:
  onLoad: function onLoad() {},
  start: function start() {
    //设置格子图片
    var self = this;

    if (this.kind == 0) {
      //空白格
      cc.loader.loadRes("cell", cc.SpriteFrame, function (err, spriteFrame) {
        self.node.getComponent(cc.Sprite).spriteFrame = spriteFrame;
      });
    } else if (this.kind == 1) {
      //卡牌格
      cc.loader.loadRes("抽卡格", cc.SpriteFrame, function (err, spriteFrame) {
        self.node.getComponent(cc.Sprite).spriteFrame = spriteFrame;
      });
    } else {
      //事件格
      cc.loader.loadRes("事件格", cc.SpriteFrame, function (err, spriteFrame) {
        self.node.getComponent(cc.Sprite).spriteFrame = spriteFrame;
      });
    }
  } // update (dt) {},

});

cc._RF.pop();
                    }
                    if (nodeEnv) {
                        __define(__module.exports, __require, __module);
                    }
                    else {
                        __quick_compile_project__.registerModuleFunc(__filename, function () {
                            __define(__module.exports, __require, __module);
                        });
                    }
                })();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcc2NyaXB0c1xcQ2VsbC5qcyJdLCJuYW1lcyI6WyJjYyIsIkNsYXNzIiwiQ29tcG9uZW50IiwicHJvcGVydGllcyIsIm1hcHgiLCJtYXB5Iiwia2luZCIsImluTW9uaXRvciIsInJvdXRlSUQiLCJzZXRDb2xvciIsIm5vZGUiLCJjb2xvciIsInJlc2V0Q29sb3IiLCJnZXRPbmVDYXJkIiwicGVyc29uX2pzIiwiY2FyZE5hbWUiLCJ0b3RDYXJkTnVtIiwiY2FyZElEIiwiTWF0aCIsImZsb29yIiwicmFuZG9tIiwiY2FyZHMiLCJwdXNoIiwiaW5zdGFudGlhdGUiLCJ3aW5kb3ciLCJnbG9iYWwiLCJjYXJkbm9kZSIsInNldFBvc2l0aW9uIiwibXNnIiwib24iLCJldmVudCIsImdhbWUiLCJlbWl0IiwiZGVzdHJveSIsInBhcmVudCIsImNob29zZUZyb21UaHJlZSIsImNkIiwiY29uc29sZSIsImxvZyIsImkiLCJuYW1lIiwiZmluZCIsImdldENvbXBvbmVudCIsIm5vd1BsYXllciIsImoiLCJldmVudEFjdGlvbiIsInJhbmRfZXZlbnQiLCJub3RlIiwiTm9kZSIsImFkZENvbXBvbmVudCIsIlNwcml0ZSIsInNlbGYiLCJldmVudF9uYW1lIiwidXNlQ2FyZEVuYWJsZWQiLCJnb0VuYWJsZWQiLCJibG9vZCIsInR1cm4iLCJsb2FkZXIiLCJsb2FkUmVzIiwiU3ByaXRlRnJhbWUiLCJlcnIiLCJzcHJpdGVGcmFtZSIsInNwZWNpYWxKdWRnZSIsInJvbGUiLCJoYXZlTWluZSIsImV4cG9zZWQiLCJtaW5lQXR0YWNrIiwiaXNEZWFkIiwiYnVmZiIsInRvZG9MaXN0IiwiZW5kVHVybiIsIm5vd1R1cm4iLCJwZXJzb24iLCJhY3QiLCJub3dQcm9wZXJ0eSIsInN0ZXBPbkNlbGwiLCJyYW5kX3ZhbCIsIm9uTG9hZCIsInN0YXJ0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBQSxFQUFF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VixRQUFBQSxJQUFJLENBQUN6QyxJQUFMLENBQVVnQyxZQUFWLENBQXVCMUMsRUFBRSxDQUFDa0QsTUFBMUIsRUFBa0NXLFdBQWxDLEdBQWdEQSxXQUFoRDtBQUNBLE9BRkQ7QUFHQSxLQUpELE1BS0ssSUFBSSxLQUFLdkQsSUFBTCxJQUFhLENBQWpCLEVBQW9CO0FBQUU7QUFDMUJOLE1BQUFBLEVBQUUsQ0FBQ3lELE1BQUgsQ0FBVUMsT0FBVixDQUFrQixLQUFsQixFQUF5QjFELEVBQUUsQ0FBQzJELFdBQTVCLEVBQXlDLFVBQVVDLEdBQVYsRUFBZUMsV0FBZixFQUE0QjtBQUNwRVYsUUFBQUEsSUFBSSxDQUFDekMsSUFBTCxDQUFVZ0MsWUFBVixDQUF1QjFDLEVBQUUsQ0FBQ2tELE1BQTFCLEVBQWtDVyxXQUFsQyxHQUFnREEsV0FBaEQ7QUFDQSxPQUZEO0FBR0EsS0FKSSxNQUtBO0FBQUU7QUFDTjdELE1BQUFBLEVBQUUsQ0FBQ3lELE1BQUgsQ0FBVUMsT0FBVixDQUFrQixLQUFsQixFQUF5QjFELEVBQUUsQ0FBQzJELFdBQTVCLEVBQXlDLFVBQVVDLEdBQVYsRUFBZUMsV0FBZixFQUE0QjtBQUNwRVYsUUFBQUEsSUFBSSxDQUFDekMsSUFBTCxDQUFVZ0MsWUFBVixDQUF1QjFDLEVBQUUsQ0FBQ2tELE1BQTFCLEVBQWtDVyxXQUFsQyxHQUFnREEsV0FBaEQ7QUFDQSxPQUZEO0FBR0E7QUFDRSxHQTdMSSxDQStMTDs7QUEvTEssQ0FBVCIsInNvdXJjZVJvb3QiOiIvIiwic291cmNlc0NvbnRlbnQiOlsiLy8gTGVhcm4gY2MuQ2xhc3M6XG4vLyAgLSBodHRwczovL2RvY3MuY29jb3MuY29tL2NyZWF0b3IvbWFudWFsL2VuL3NjcmlwdGluZy9jbGFzcy5odG1sXG4vLyBMZWFybiBBdHRyaWJ1dGU6XG4vLyAgLSBodHRwczovL2RvY3MuY29jb3MuY29tL2NyZWF0b3IvbWFudWFsL2VuL3NjcmlwdGluZy9yZWZlcmVuY2UvYXR0cmlidXRlcy5odG1sXG4vLyBMZWFybiBsaWZlLWN5Y2xlIGNhbGxiYWNrczpcbi8vICAtIGh0dHBzOi8vZG9jcy5jb2Nvcy5jb20vY3JlYXRvci9tYW51YWwvZW4vc2NyaXB0aW5nL2xpZmUtY3ljbGUtY2FsbGJhY2tzLmh0bWxcblxuY2MuQ2xhc3Moe1xuICAgIGV4dGVuZHM6IGNjLkNvbXBvbmVudCxcblxuICAgIHByb3BlcnRpZXM6IHtcblx0XHRtYXB4OiAwLCAvL+WcqG1hcFtpXVtqXeS4reeahOaoquWdkOagh1xuXHRcdG1hcHk6IDAsLy/lnKhtYXBbaV1bal3kuK3nmoTnurXlnZDmoIdcblx0XHRraW5kOiBudWxsLCAvL+agvOWtkOeahOexu+Wei++8jDA656m655m95qC877yMMTrljaHniYzmoLzvvIwyOuS6i+S7tuagvFxuXHRcdGluTW9uaXRvcjogMCwgLy/nlKjmnaXliKTmlq3mmK/lkKblpITkuo7nm5HlkKzkuK3nmoTmoIforrBcblx0XHRyb3V0ZUlEOiBudWxsLCAvL+iusOW9lei/meS4qmNlbGzmmK9tYXDkuK3lk6rmnaFyb3V0ZeeahOe7iOeCue+8jOWNs+WcqHJvdXRlc+S4reeahOS4i+agh1xuXHRcdFxuICAgIH0sXG5cdFxuXHRzZXRDb2xvcjogZnVuY3Rpb24oKSB7XG5cdFx0Ly/orr7nva5jZWxs55qE6aKc6Imy5Li657u/6Imy77yM6KGo56S65Y+v6LWwXG5cdFx0dGhpcy5ub2RlLmNvbG9yID0gY2MuY29sb3IoMTAyLDI1NSwxMDIsMjU1KTtcblx0fSxcblx0XG5cdHJlc2V0Q29sb3I6IGZ1bmN0aW9uKCkge1xuXHRcdC8v6L+Y5Y6fY2VsbOeahOminOiJslxuXHRcdHRoaXMubm9kZS5jb2xvciA9IGNjLmNvbG9yKDI1NSwyNTUsMjU1LDI1NSk7XG5cdH0sXG5cdFxuXHRnZXRPbmVDYXJkOiBmdW5jdGlvbihwZXJzb25fanMsIGNhcmROYW1lLCB0b3RDYXJkTnVtKSB7XG5cdFx0Ly/pmo/mnLrojrflvpcx5byg54mMXG5cdFx0dmFyIGNhcmRJRCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSp0b3RDYXJkTnVtKTtcblx0XHRwZXJzb25fanMuY2FyZHMucHVzaChjYXJkSUQpO1xuXHRcdC8v5Yib5bu655So5p2l5o+Q56S66I635b6X5Y2h54mM55qE57K+54G16IqC54K5XG5cdFx0dmFyIG5vZGUgPSBjYy5pbnN0YW50aWF0ZSh3aW5kb3cuZ2xvYmFsLmNhcmRub2RlW2NhcmRJRF0pO1xuXHRcdG5vZGUuc2V0UG9zaXRpb24oMCwgMCk7XG5cdFx0Ly/lvIDlkK9ub3Rl6IqC54K555qE55uR5ZCs77yM54K55Ye75ZCO5raI5aSxXG5cdFx0bm9kZS5tc2cgPSAn6I635b6X5Y2h54mMOicrY2FyZE5hbWVbY2FyZElEXTtcblx0XHRub2RlLm9uKCdtb3VzZWRvd24nLCBmdW5jdGlvbiAoIGV2ZW50ICkge1xuXHRcdFx0Y2MuZ2FtZS5lbWl0KCdzdGVwT25DZWxsLWRvbmUnLCB0aGlzLm1zZyk7XG5cdFx0XHR0aGlzLmRlc3Ryb3koKTtcblx0XHR9LCBub2RlKTtcblx0XHRub2RlLnBhcmVudCA9IHRoaXMubm9kZS5wYXJlbnQucGFyZW50O1xuXHR9LFxuXHRcblx0Y2hvb3NlRnJvbVRocmVlOiBmdW5jdGlvbihjYXJkTmFtZSwgdG90Q2FyZE51bSkge1xuXHRcdHZhciBjZCA9IFtdO1xuXHRcdGNkWzBdID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKnRvdENhcmROdW0pO1xuXHRcdGNkWzFdID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKnRvdENhcmROdW0pO1xuXHRcdGNkWzJdID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKnRvdENhcmROdW0pO1xuXHRcdFxuXHRcdGNvbnNvbGUubG9nKGNkKTtcblxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgMzsgaSsrKSB7XG5cdFx0XHR2YXIgbm9kZSA9IGNjLmluc3RhbnRpYXRlKHdpbmRvdy5nbG9iYWwuY2FyZG5vZGVbY2RbaV1dKTtcblx0XHRcdG5vZGUubmFtZSA9ICdjaG9vc2VGcm9tVGhyZWUnK2k7XG5cdFx0XHRub2RlLnNldFBvc2l0aW9uKC01MDArNTAwKmksIDApO1xuXHRcdFx0bm9kZS5jYXJkSUQgPSBjZFtpXTtcblx0XHRcdG5vZGUubXNnID0gJ+iOt+W+l+WNoeeJjDonK2NhcmROYW1lW2NkW2ldXTtcblx0XHRcdG5vZGUub24oJ21vdXNlZG93bicsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRcdHZhciBwZXJzb25fanMgPSBjYy5maW5kKCdDYW52YXMnKS5nZXRDb21wb25lbnQoJ2dsb2JhbEdhbWUnKS5ub3dQbGF5ZXIuZ2V0Q29tcG9uZW50KCdQZXJzb24nKTtcblx0XHRcdFx0Y29uc29sZS5sb2coJ+W+l+WIsOWNoeeJjDonK3RoaXMuY2FyZElEKTtcblx0XHRcdFx0cGVyc29uX2pzLmNhcmRzLnB1c2godGhpcy5jYXJkSUQpO1xuXHRcdFx0XHRjYy5nYW1lLmVtaXQoJ3N0ZXBPbkNlbGwtZG9uZScsIHRoaXMubXNnKTtcblx0XHRcdFx0Zm9yICh2YXIgaiA9IDA7IGogPCAzOyBqKyspIHtcblx0XHRcdFx0XHRjYy5maW5kKCdDYW52YXMvY2hvb3NlRnJvbVRocmVlJytqKS5kZXN0cm95KCk7XG5cdFx0XHRcdH1cblx0XHRcdH0sIG5vZGUpXG5cdFx0XHRub2RlLnBhcmVudCA9IHRoaXMubm9kZS5wYXJlbnQucGFyZW50O1xuXHRcdH1cblx0XHRcblx0fSxcblx0XG5cdGV2ZW50QWN0aW9uOiBmdW5jdGlvbihwZXJzb25fanMpIHtcblx0XHQvL+maj+acuuS6p+eUnzbkuKrkuovku7bkuYvkuIBcblx0XHR2YXIgcmFuZF9ldmVudCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSo2KTtcblx0XHQvL+WIm+W7uueUqOadpeaPkOekuuiOt+W+l+inpuWPkeS6i+S7tueahOeyvueBteiKgueCuVxuXHRcdHZhciBub3RlID0gbmV3IGNjLk5vZGUoKTtcblx0XHRub3RlLmFkZENvbXBvbmVudChjYy5TcHJpdGUpO1xuXHRcdG5vdGUuc2V0UG9zaXRpb24oMCwgMCk7XG5cdFx0bm90ZS5wYXJlbnQgPSB0aGlzLm5vZGUucGFyZW50LnBhcmVudDtcblx0XHR2YXIgc2VsZiA9IG5vdGUsIGV2ZW50X25hbWU7XG5cdFx0aWYgKHJhbmRfZXZlbnQgPT0gMCkgeyAvL+mZt+mYsVxuXHRcdFx0ZXZlbnRfbmFtZSA9IFwi6Zm36ZixXCI7XG5cdFx0XHRwZXJzb25fanMudXNlQ2FyZEVuYWJsZWQgPSAwOyAvL+acrOWbnuWQiOS4jeWPr+S9v+eUqOWNoeeJjCzkuIvlm57lkIjnva4xXG5cdFx0XHQvL3dhcm5pbmc6IOS4i+WbnuWQiOiusOW+l+aUueWPmFxuXHRcdH1cblx0XHRlbHNlIGlmIChyYW5kX2V2ZW50ID09IDEpIHsgLy/nm5Hni7Fcblx0XHRcdGV2ZW50X25hbWUgPSBcIuebkeeLsVwiOyAvL+S4i+WbnuWQiOS4jeWPr+i1sFxuXHRcdFx0cGVyc29uX2pzLmdvRW5hYmxlZCA9IDA7XG5cdFx0XHQvL3dhcm5pbmc6IOS4i+WbnuWQiOiusOW+l+aUueWPmFxuXHRcdH1cblx0XHRlbHNlIGlmIChyYW5kX2V2ZW50ID09IDIpIHsgLy/mgbbprZRcblx0XHRcdGV2ZW50X25hbWUgPSBcIuaBtumtlFwiOyAgLy/mjZ/lpLHkuIDmu7TooYDph49cblx0XHRcdHBlcnNvbl9qcy5ibG9vZC0tO1xuXHRcdH1cblx0XHRlbHNlIGlmIChyYW5kX2V2ZW50ID09IDMpIHsgLy/lpaXliKnnu5lcblx0XHRcdGV2ZW50X25hbWUgPSBcIuWlpeWIqee7mVwiO1xuXHRcdFx0cGVyc29uX2pzLnR1cm4rKzsgLy/ojrflvpflm57lkIhcblx0XHR9XG5cdFx0ZWxzZSBpZiAocmFuZF9ldmVudCA9PSA0KSB7IC8v6KeG6YeOXG5cdFx0XHRldmVudF9uYW1lID0gXCLop4bph45cIjsgIC8vdG8gZG9cblx0XHR9XG5cdFx0ZWxzZSBpZiAocmFuZF9ldmVudCA9PSA1KSB7IC8v5aSp5L2/XG5cdFx0XHRldmVudF9uYW1lID0gXCLlpKnkvb9cIjtcblx0XHRcdHBlcnNvbl9qcy5ibG9vZCA9IE1hdGguZmxvb3IocGVyc29uX2pzLmJsb29kKjEuNSk7XG5cdFx0fVxuXHRcdGNjLmxvYWRlci5sb2FkUmVzKCfkuovku7blm77niYcvJytldmVudF9uYW1lLCBjYy5TcHJpdGVGcmFtZSwgZnVuY3Rpb24gKGVyciwgc3ByaXRlRnJhbWUpIHtcblx0XHRcdHNlbGYuZ2V0Q29tcG9uZW50KGNjLlNwcml0ZSkuc3ByaXRlRnJhbWUgPSBzcHJpdGVGcmFtZTtcblx0XHR9KTtcblx0XHQvL+W8gOWQr25vdGXoioLngrnnmoTnm5HlkKzvvIzngrnlh7vlkI7mtojlpLFcblx0XHRub3RlLm1zZyA9ICfop6blj5Hkuovku7Y6JytldmVudF9uYW1lO1xuXHRcdG5vdGUub24oJ21vdXNlZG93bicsIGZ1bmN0aW9uICggZXZlbnQgKSB7XG5cdFx0XHRjYy5nYW1lLmVtaXQoJ3N0ZXBPbkNlbGwtZG9uZScsIHRoaXMubXNnKTtcblx0XHRcdHRoaXMuZGVzdHJveSgpO1xuXHRcdFx0XG5cdFx0fSwgbm90ZSk7XG5cdH0sXG5cdFxuXHRzcGVjaWFsSnVkZ2U6IGZ1bmN0aW9uKHJvbGUpIHtcblx0XHRpZiAodGhpcy5oYXZlTWluZSA9PSAxKSB7XG5cdFx0XHRyb2xlLmV4cG9zZWQgPSAxO1xuXHRcdFx0cm9sZS5ibG9vZCAtPSB0aGlzLm1pbmVBdHRhY2s7XG5cdFx0XHRpZiAocm9sZS5ibG9vZCA8PSAwKVxuXHRcdFx0XHRyb2xlLmlzRGVhZCA9IDE7XG5cdFx0XHRjb25zb2xlLmxvZygnKioqKicsIHRoaXMubWluZUF0dGFjayk7XG5cdFx0XHR2YXIgYnVmZj1jYy5maW5kKCdDYW52YXMnKS5nZXRDb21wb25lbnQoJ0J1ZmYnKTtcblx0XHRcdGJ1ZmYudG9kb0xpc3QucHVzaCh7XG5cdFx0XHRcdGVuZFR1cm46d2luZG93Lmdsb2JhbC5ub3dUdXJuKzEsXG5cdFx0XHRcdHBlcnNvbjpyb2xlLFxuXHRcdFx0XHRhY3Q6ZnVuY3Rpb24oKXtcblx0XHRcdFx0XHRpZiAodGhpcy5wZXJzb24gIT0gY2MuZmluZCgnQ2FudmFzJykuZ2V0Q29tcG9uZW50KCdnbG9iYWxHYW1lJykubm93UHJvcGVydHkpXG5cdFx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdFx0dGhpcy5wZXJzb24uZXhwb3NlZCA9IDA7XG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0XG5cdFx0XHR0aGlzLmhhdmVNaW5lID0gMDtcblx0XHR9XG5cdH0sXG5cdFxuXHRzdGVwT25DZWxsOiBmdW5jdGlvbihwZXJzb24pIHtcblx0XHRcblx0XHQvL+iOt+WPlnBlcnNvbuiKgueCueeahOe7hOS7tlxuXHRcdHZhciBwZXJzb25fanMgPSBwZXJzb24uZ2V0Q29tcG9uZW50KCdQZXJzb24nKTtcblx0XHRcblx0XHR0aGlzLnNwZWNpYWxKdWRnZShwZXJzb25fanMpO1xuXHRcdFxuXHRcdGlmICh0aGlzLmtpbmQgPT0gMCkgey8v56m655m95qC8XG5cdFx0XHRjYy5nYW1lLmVtaXQoJ3N0ZXBPbkNlbGwtZG9uZScsICcnKTsgLy/lj5HpgIHnqbrkuLJcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0ZWxzZSBpZiAodGhpcy5raW5kID09IDEpIHsvL+WNoeeJjOagvFxuXHRcdFx0dmFyIGNhcmROYW1lID0gWyfngrjlvLknLCfnsr7lh4blr7zlvLknLCflnLDpm7cnLCfluofmiqQnLCflpKnkvb/nmoTluofmiqQnLCfmiJjnpZ7nmoTnpZ3npo8nLCfomZrlvLEnLCflm6LpmJ/nmoTlipvph48nLFxuXHRcdFx0XHRcdFx0XHQn5rK75oSIJywn5Zyj5YWJ5pmu54WnJywn5pyb6L+c6ZWcJywn55y8552bJywn54yb55S355qE56Wd56aPJywn55uX5Y+WJywn5p2f57yaJywn6L+35oORJywn5ouv5pWRJ107XG5cdFx0XHR2YXIgdG90Q2FyZE51bSA9IDE3XG5cdFx0XHR2YXIgcmFuZF92YWwgPSBNYXRoLnJhbmRvbSgpO1xuXHRcdFx0Y29uc29sZS5sb2coJ3JhbmRfdmFsJytyYW5kX3ZhbCk7XG5cdFx0XHRpZiAocmFuZF92YWwgPCAwLjUpIHsgLy/lvpfliLDkuIDlvKDniYxcblx0XHRcdFx0dGhpcy5nZXRPbmVDYXJkKHBlcnNvbl9qcywgY2FyZE5hbWUsIHRvdENhcmROdW0pO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZXsgLy/kuInlvKDkuK3mir3kuIDlvKBcblx0XHRcdFx0dGhpcy5jaG9vc2VGcm9tVGhyZWUoY2FyZE5hbWUsIHRvdENhcmROdW0pO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRlbHNlIGlmICh0aGlzLmtpbmQgPT0gMikgeyAvL+S6i+S7tuagvFxuXHRcdFx0dGhpcy5ldmVudEFjdGlvbihwZXJzb25fanMpOyAvL+WTjeW6lOS6i+S7tlxuXHRcdH1cblx0fSxcblx0XG4gICAgLy8gTElGRS1DWUNMRSBDQUxMQkFDS1M6XG5cbiAgICBvbkxvYWQgKCkge1xuXHRcdFxuXHR9LFxuXG4gICAgc3RhcnQgKCkge1xuXHRcdC8v6K6+572u5qC85a2Q5Zu+54mHXG5cdFx0XG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xuXHRcdGlmICh0aGlzLmtpbmQgPT0gMCkgeyAvL+epuueZveagvFxuXHRcdFx0Y2MubG9hZGVyLmxvYWRSZXMoXCJjZWxsXCIsIGNjLlNwcml0ZUZyYW1lLCBmdW5jdGlvbiAoZXJyLCBzcHJpdGVGcmFtZSkge1xuXHRcdFx0XHRzZWxmLm5vZGUuZ2V0Q29tcG9uZW50KGNjLlNwcml0ZSkuc3ByaXRlRnJhbWUgPSBzcHJpdGVGcmFtZTtcblx0XHRcdH0pO1xuXHRcdH1cblx0XHRlbHNlIGlmICh0aGlzLmtpbmQgPT0gMSkgeyAvL+WNoeeJjOagvFxuXHRcdFx0Y2MubG9hZGVyLmxvYWRSZXMoXCLmir3ljaHmoLxcIiwgY2MuU3ByaXRlRnJhbWUsIGZ1bmN0aW9uIChlcnIsIHNwcml0ZUZyYW1lKSB7XG5cdFx0XHRcdHNlbGYubm9kZS5nZXRDb21wb25lbnQoY2MuU3ByaXRlKS5zcHJpdGVGcmFtZSA9IHNwcml0ZUZyYW1lO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdGVsc2UgeyAvL+S6i+S7tuagvFxuXHRcdFx0Y2MubG9hZGVyLmxvYWRSZXMoXCLkuovku7bmoLxcIiwgY2MuU3ByaXRlRnJhbWUsIGZ1bmN0aW9uIChlcnIsIHNwcml0ZUZyYW1lKSB7XG5cdFx0XHRcdHNlbGYubm9kZS5nZXRDb21wb25lbnQoY2MuU3ByaXRlKS5zcHJpdGVGcmFtZSA9IHNwcml0ZUZyYW1lO1xuXHRcdFx0fSk7XG5cdFx0fVxuICAgIH0sXG5cbiAgICAvLyB1cGRhdGUgKGR0KSB7fSxcbn0pO1xuXG5cblxuXG5cblxuXG5cblxuXG5cblxuIl19