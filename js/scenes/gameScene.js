// create a new scene
let gameScene = new Phaser.Scene('Game');


// some parameters for our scene
gameScene.init = function () {
    this.stats = {
      health: 100,
      fun: 100
    }
  
    //decay peram
    this.decayRates = {
      health: -5,
      fun: -2
    }
  };
  
  // executed once, after assets were loaded
  gameScene.create = function () {
  
    //create background
    let bg = this.add.sprite(0, 0, 'backyard').setInteractive();
    bg.setOrigin(0, 0);
  
    // event listener for BG
    bg.on('pointerdown', this.placeItem, this)
    //add sprite sheet
    this.pet = this.add.sprite(100, 200, 'pet', 0).setInteractive();
    this.pet.depth = 1;
    // make pet draggable
    this.input.setDraggable(this.pet);
   
    // follow pointer when dragged
    this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
      // make sprite be located at the coords of the pointer
      gameObject.x = dragX;
      gameObject.y = dragY
    })
  
    // create ui
    this.createUi()
    //show stats to user
    this.createHud()
    //refresh hud
    this.refreshHud()
  
    //decay of health and fun
    this.timedEventStats = this.time.addEvent({
      delay: 1000,
      repeat: -1, //will repeat forever
      callback: function () {
        // update stats
        this.updateStats(this.decayRates);
      },
      callbackScope: this
    })
  };
  
  // create ui
  gameScene.createUi = function () {
    //buttons
    this.appleBtn = this.add.sprite(72, 570, 'apple').setInteractive();
    this.appleBtn.customStats = { health: 20, fun: 0 };
    this.appleBtn.on('pointerdown', this.pickItem);
  
    this.candyBtn = this.add.sprite(144, 570, 'candy').setInteractive();
    this.candyBtn.customStats = { health: -10, fun: 15 };
    this.candyBtn.on('pointerdown', this.pickItem);
  
    this.toyBtn = this.add.sprite(216, 570, 'toy').setInteractive();
    this.toyBtn.customStats = { health: 0, fun: 15 };
    this.toyBtn.on('pointerdown', this.pickItem);
  
    this.rotateBtn = this.add.sprite(288, 570, 'rotate').setInteractive();
    this.rotateBtn.customStats = { health: 0, fun: 20 };
    this.rotateBtn.on('pointerdown', this.rotatePet);
  
    // array of buttons
    this.buttons = [this.appleBtn, this.candyBtn, this.toyBtn, this.rotateBtn]
  
    // ui is not blocked
    this.uiBlocked = false;
    //refresh ui
    this.uiReady();
  };
  
  //rotate pet
  gameScene.rotatePet = function () {
    // ui cant be blocked
    if (this.scene.uiBlocked) return;
    // make sure ui is ready
    this.scene.uiReady();
    //block the ui
    this.scene.uiBlocked = true;
    //dim the rotate icon
    this.alpha = 0.5;
  
    let scene = this.scene;
  
    //rotation tween
    let rotateTween = this.scene.tweens.add({
      targets: this.scene.pet,
      duration: 800,
      angle: 720,
      pause: false,
      callbackScope: this,
      onComplete: function (tween, sprites) {
  
        // update stats
        this.scene.updateStats(this.customStats);
  
        // set ui to ready
        this.scene.uiReady();
      }
    })
  };
  
  // pick item
  gameScene.pickItem = function () {
    // ui cant be blocked
    if (this.scene.uiBlocked) return;
    // make sure ui is ready
    this.scene.uiReady();
    // select item
    this.scene.selectedItem = this;
    // change trans
    this.alpha = 0.5;
  };
  
  gameScene.uiReady = function () {
    //nothing is selected
    this.selectedItem = null
    // set all buttons to alpha 1
    for (let i = 0; i < this.buttons.length; i++) {
      this.buttons[i].alpha = 1;
    }
    //scene must be unblocked
    this.uiBlocked = false
  }
  
  // place new item on the game
  gameScene.placeItem = function (pointer, localX, localY) {
    // check that an item was selected
    if (!this.selectedItem) return
  
    // check ui is unblocked
    if (this.uiBlocked) return
  
    // create a new item in position
    let newItem = this.add.sprite(localX, localY, this.selectedItem.texture.key);
  
  
  
    // block ui
    this.uiBlocked = true;
  
    //pet movement (tween)
    let petTween = this.tweens.add({
      targets: this.pet,
      duration: 500,
      x: newItem.x,
      y: newItem.y,
      paused: false,
      callbackScope: this,
      onComplete: function (tween, sprites) {
  
        //destroy item
        newItem.destroy();
  
        // event listener for when sprite sheet ends
        this.pet.on('animationcomplete', function () {
          //set pet to frame 0
          this.pet.setFrame(0)
          // // clear ui
          this.uiReady();
        }, this)
  
        //play sprite animation
        this.pet.play('funnyfaces');
        // update stats
        this.updateStats(this.selectedItem.customStats);
        // // clear ui
        this.uiReady();
      }
    })
  }
  
  //create text elements for stats
  gameScene.createHud = function () {
    //health stat
    this.healthText = this.add.text(20, 20, 'Health: ', {
      font: '24px Arial',
      fill: '#ffffff'
    })
    //fun stat
    this.funText = this.add.text(170, 20, 'Fun: ', {
      font: '24px Arial',
      fill: '#ffffff'
    })
  }
  
  // show the current value of health and fun
  gameScene.refreshHud = function () {
    this.healthText.setText('Health: ' + this.stats.health)
    this.funText.setText('Fun: ' + this.stats.fun)
  }
  
  // update stats
  gameScene.updateStats = function (statDiff) {
    // pet stats
    // this.stats.health += this.selectedItem.customStats.health;
    // this.stats.fun += this.selectedItem.customStats.fun;
  
    // flag to check game over
    let isGameOver = false;
  
    for (stat in statDiff) {
      if (statDiff.hasOwnProperty(stat)) {
        this.stats[stat] += statDiff[stat];
  
        //stats cant be less then 0
        if (this.stats[stat] < 0) {
          isGameOver = true;
          this.stats[stat] = 0;
        }
      }
    }
    // refreshHud
    this.refreshHud();
    // check to see if game over
    if (isGameOver) this.gameOver();
  
    gameScene.gameOver = function () {
      // block ui
      this.uiBlocked = true;
  
      //kill pet
      this.pet.setFrame(4);
  
      // keep game running then move
      this.time.addEvent({
        delay: 2000,
        repeat: 0,
        callback: function () {
          this.scene.start('Home');
        },
        callbackScope: this
      })
    }
  };
  
  