define(['augment', 'phaser','game/data/levels','game/data/blocks','game/entities/block'], function(augment, Phaser, levelData, blockData, BlockEntity){
  
  var Level = augment(Phaser.Group, function(uber){
    
    this.constructor = function(){
      uber.constructor.apply(this, arguments);
      var data = this.parseTestFile(levelData.testString);
      
      var anchor = this.game.add.sprite(0,0,'origin');
      anchor.anchor.set(0.5);

      this.build(data);
    }
    
    this.build = function(list){
      for(var item in list){
        var itemData = list[item];
        var itemDefinition = blockData[itemData.definition];
        var itemName = itemData.name;
        var options = {
          offsetX: 0,
          offsetY: -500,
        }
        var block = new BlockEntity(this.game, itemName, itemData, itemDefinition, options);
        this.add(block);
      }
    }

    this.parseTestFile = function(content){
      var content = content.replace(/--.*?\n/g,'\n');
      content = content.replace(/([\n\s]*)((physicsToWorld|theme|joints|birdCameraData|castleCameraData|counts|world)\s*=)/g,",$1$2");
      content = content.replace(/^[\s\n]*,/,'');
      content = content.replace(/=/g,':');
      eval("var res = {"+content+"}");
      return res;
    }

  });

  return Level;
})