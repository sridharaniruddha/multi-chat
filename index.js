// ChatManager is already imported in the current scope.

const baseStyle = `
    font-family: 'm6x11plus', monospace;
    font-size: 24px;
    border: 2px solid #4e342e;
    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.9);
`;

const chatLogStyle = `
    ${baseStyle}
    width: 600px;
    height: 120px;
    background-color: rgba(0, 0, 0, 0.0);
    padding: 10px;
    direction: ltr;
    box-shadow: none;
    border: none;
    overflow-y: auto;
    position: sticky;
`;

const inputStyle = `
    ${baseStyle}
    width: 370px;
    height: 30px;
    background-color: rgba(255, 255, 255, 0.4);
    box-shadow: none;
    border-radius: 10px;
    position: sticky;
`;

const sendButtonStyle = `
    ${baseStyle}
    width: 150px;
    height: 40px;
    background-color: #04AA6D;
    border: none;
    color: white;
    border: 7px solid #04AA6D;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 24px;
    margin: 4px 2px;
    transition-duration: 0.4s;
    cursor: pointer;
    border-radius: 7px;
`;

const sendButtonStyleHover = `
    background-color: #057a4d; /* Darker green on hover */
    color: white;
`;

const closeButtonStyle = `
    ${baseStyle}
    width: 30px;
    height: 30px;
    border-radius: 30px; // makes the button circular
    color: #fff; // white text color
    background-color: #ff6347; // tomato red background
    font-size: 30px; // larger font size for the 'X'
    text-align: center; // centers the 'X' in the button
    line-height: 30px; // vertically centers the 'X' in the button
`;

class NPC extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, key, characterDescription, animKey, startFrame, endFrame) {
        super(scene, x, y, key);

        this.scene = scene;
        this.characterDescription = characterDescription;
        this.isChatting = false;
        this.chatLogId = 'chatLogContent-' + characterDescription.replace(/\s+/g, '-').toLowerCase(); // Unique ID for each chat log

        scene.physics.world.enable(this);
        this.setCollideWorldBounds(true);
        this.setInteractive();

        scene.add.existing(this);

        this.directionChangeTimer = 0;
        this.direction = 'down';

        this.isChatOpen = false;
        this.chatManager = new ChatManager(characterDescription);

        this.createAnimation(animKey, 0, 20);
    }

    setCursorStyle() {
        this.on('pointerover', () => {
            if (this.playerInRange(this.scene.player)) {
                this.input.setDefaultCursor('url(https://play.rosebud.ai/assets/hand_small_point.png?zJhd), pointer');
            }
        });

        this.on('pointerout', () => {
            this.input.setDefaultCursor('url(https://play.rosebud.ai/assets/cursor.png?j0pL), pointer');
        });
    }


    update() {
        if (this.isChatting) return;

        if (this.directionChangeTimer <= 0) {
            const directions = ["up", "down", "left", "right"];
            this.direction = directions[Math.floor(Math.random() * directions.length)];
            this.directionChangeTimer = 50;
        }

        if (this.direction === "up") this.y -= 1;
        if (this.direction === "down") this.y += 1;
        if (this.direction === "left") this.x -= 1;
        if (this.direction === "right") this.x += 1;

        this.directionChangeTimer -= 1;

    }

    createAnimation(animKey, startFrame, endFrame) {
        this.scene.anims.create({
            key: animKey,
            frames: this.scene.anims.generateFrameNumbers(this.texture.key, {
                start: startFrame,
                end: endFrame
            }),
            frameRate: 20,
            repeat: -1
        });

        this.anims.play(animKey, true);
    }

    openChat() {
        this.isChatting = true;
        this.scene.openChat(this);
    }

    closeChat() {
        this.isChatting = false;
    }

    playerInRange(player) {
        const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
        return distance < 230;
    }
}

class Menu extends Phaser.Scene {
    constructor() {
        super({ key: 'menu' });
    }

    preload() {
        this.load.image('background', `https://play.rosebud.ai/assets/rosebud_bg.png?yQ4J`);
        this.load.audio('backgroundmusic', `https://play.rosebud.ai/assets/bgMusic.wav.wav?ASrw`);
    
        var newFont = new FontFace('font', 'url(' + `https://play.rosebud.ai/assets/Phased.ttf?ZZiA` + ')');
        var font1 = new FontFace('font1', 'url(' + `https://play.rosebud.ai/assets/HeftyMe.ttf?OVqY` + ')');
        newFont.load().then(function(loaded_face) {
            document.fonts.add(loaded_face);
        }).catch(function(error) {
            // error occurred
            console.log(error);
        });

        font1.load().then(function(loaded_face) {
            document.fonts.add(loaded_face);
        }).catch(function(error) {
            // error occurred
            console.log(error);
        });
    }

    create() {
        const worldSize = 2048; 

        // this.bg = this.add.tileSprite(0, 0, worldSize * 10, worldSize * 10, 'background').setScale(.25, .25).setDepth(-5).setAngle(20);
        
        const title = this.add.text(1400/2, 890/4, 'Village Scholars', { fontSize: '75px', fill: '#ff9999', fontFamily: '"font"', align: 'center'}).setOrigin(.5);
        title.setTint(0x99ccff, 0x66cccc, 0x99ccff, 0x66cccc);
        title.setStroke('#2e3d3b', 16);

        const text = this.add.text(1400/2, 890/2, '* Arrow keys - Movement *\n * Approach And Click Npcs To Talk With Them *', { fontSize: '64px', fill: '#66cccc', fontFamily: '"font1"', align: 'center'}).setOrigin(0.5);
        text.setTint(0x2e3d3b, 0x0e4d63, 0x0e4d63, 0x2e3d3b);

        const start = this.add.text(1400/2, 800, 'Press Key To Start', { fontSize: '64px', fill: '#66cccc', fontFamily: '"font1"', align: 'center'}).setOrigin(0.5);

        this.tweens.add({
            targets: start,
            alpha: { start: 1, to: .1 },
            yoyo: true,
            repeat: -1,
            duration: 1000,
        });
    }

    update() {
        // this.bg.tilePositionX += 1;
        // this.bg.tilePositionY -= 1;

        this.input.keyboard.on('keydown', () => {
            this.scene.start("game");
        });
    }
}

class ChatScene extends Phaser.Scene {
    constructor() {
        super({ key: 'game' });
    }

    preload() {
        this.load.image('background', 'https://play.rosebud.ai/assets/Multi-chat2.png?sPZi');
        this.load.spritesheet('player', `https://play.rosebud.ai/assets/playerRun.png?ATPf`, {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.spritesheet('playerIdle', `https://play.rosebud.ai/assets/playerIdle.png?tjv8`, {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.spritesheet('tina', 'https://play.rosebud.ai/assets/npc3Idle.png?TWWj', {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.spritesheet('anok', 'https://play.rosebud.ai/assets/Anok yai.png?fQje', {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.spritesheet('harold', 'https://play.rosebud.ai/assets/Npc 4 ke huy.png?F58L', {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.spritesheet('sam', `https://play.rosebud.ai/assets/npc4Idle.png?YlD9`, {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.image('scroll', `https://play.rosebud.ai/assets/dialogPanel.png?NfYl`);
        this.load.audio('music', `https://play.rosebud.ai/assets/547542__bloodpixelhero__ancient-little-secret.mp3?yP9c`);
        this.load.bitmapFont('m6x11plus', 'https://play.rosebud.ai/assets/m6x11plus.ttf?grMH'); // Load the custom font
    
        this.input.setDefaultCursor('url(https://play.rosebud.ai/assets/cursor.png?j0pL), pointer');
    }

    create() {
        this.physics.world.setBounds(-140, 40, 1420, 780);

        this.add.image(550, 445, 'background').setScale(3);

        // Stick the scroll image at the bottom of the screen and rotate it 90 degrees
        this.scroll = this.add.image(700, 620, 'scroll').setScale(3);
        this.scroll.setScrollFactor(0); // Make the scroll image fixed
        this.scroll.depth = 1;


        this.anims.create({
            key: 'playerWalking', // Use a descriptive key for the animation
            frames: this.anims.generateFrameNumbers('player', {
                start: 0,
                end: 20 // Adjust according to your sprite frames
            }),
            frameRate: 20,
            repeat: -1
        });

        // Player idle animation
        this.anims.create({
            key: 'playerIdle',
            frames: this.anims.generateFrameNumbers('playerIdle', {
                start: 0,
                end: 20
            }),
            frameRate: 20,
            repeat: -1
        });


        this.player = this.physics.add.sprite(360, 300, 'player').setScale(3);
        this.player.body.setSize(25, 22);
        // this.player.body.setOffset(8, 25);
        this.player.setCollideWorldBounds(true);
        // Start with the player in idle animation
        this.player.anims.play('playerIdle', true);

        this.input.on('gameobjectdown', (pointer, gameObject) => {
            if (gameObject instanceof NPC && gameObject.playerInRange(this.player)) {
                gameObject.openChat();
            }
        });

        this.colliders = this.physics.add.staticGroup();

        this.addCollider(390, 210, 180, 140);
        this.addCollider(990, 500, 140, 135);
        this.addCollider(650, 340, 70, 90);
        this.addCollider(895, 310, 110, 30);
        this.addCollider(10, 530, 280, 175);
        this.addCollider(630, 650, 360, 160);
        this.physics.add.collider(this.player, this.colliders);

        this.chatDialogs = new Map();
        // Play the audio
        const music = this.sound.add('music', {
            volume: 0.04,
            loop: true
        });

        music.play();

        this.cursors = this.input.keyboard.createCursorKeys();

        // Create NPCs and set cursor style for hover
        this.tina = new NPC(this, 1000, 300, 'tina', 'Tina is a tech enthusiast who loves sharing her knowledge about the latest advancements in technology. With a background in software development, she can talk about coding languages, app development, and even delve into topics like artificial intelligence and machine learning. Whether youre a beginner or an experienced programmer, Tina has tips and tricks to help you level up your tech skills, and she is here to give tips and educate the player, if the player opened a conversation ask them a question and correct them, and dont stay quite at first and dont talk to much(summuraize the text)', 'tina', 0, 4).setScale(-3, 3);
        this.tina.setInteractive();
        this.tina.setCursorStyle();

        this.Anok = new NPC(this, 720, 300, 'Anok', 'Anok Yai is a model with a passion for fashion and medicine. Born a refugee during the second South Sudanese civil war, Anok is now a professonal model who studied to become a doctor. She holds the refugee cause close to her heart. From explaining her history as a refugee to discussing the future of the fashion industry, Anok is your go-to for all things fashion-related. Her practical advice and hands-on approach make learning about modelling both fun and informative, and she is here to give tips and educate the player, if the player opened a conversation ask them a question and correct them, and dont stay quite at first and dont talk to much(summuraize the text)', 'Anok', 0, 7).setScale(3);
        this.Anok.setInteractive();
        this.Anok.setCursorStyle();

        this.harold = new NPC(this, 300, 500, 'harold', 'harold is a an old man, and history buff with a deep appreciation for different cultures around the world. As a cultural curator, he loves sharing fascinating stories and insights about historical events, famous figures, and diverse traditions. From ancient civilizations to modern-day societies, harolds knowledge spans across various time periods and geographical regions. Whether youre interested in exploring ancient ruins or learning about indigenous cultures, harold is here to guide you on a journey through history and culture, and he is here to give tips and educate the player, if the player opened a conversation ask them a question and correct them, and dont stay quite at first and dont talk to much(summuraize the text)', 'harold', 0, 7).setScale(3);
        this.harold.setInteractive();
        this.harold.setCursorStyle();

        this.sam = new NPC(this, 656, 500, 'sam', 'Sam is a scientist who thrives on curiosity and exploration. With a background in astronomy and physics, hes always eager to share his passion for the wonders of the universe. From discussing the mysteries of black holes to explaining the principles of quantum mechanics, Sams conversations are out of this world. Whether youre gazing at the stars through a telescope or embarking on a virtual journey to distant galaxies, Sams enthusiasm for science will inspire you to keep exploring and learning, and he is here to give tips and educate the player, if the player opened a conversation ask them a question and correct them, and dont stay quite at first and dont talk to much(summuraize the text)', 'sam', 0, 3).setScale(-3, 3);
        this.sam.setInteractive();
        this.sam.setCursorStyle();

        this.add.text(920, 240, 'Technology', { font: 'm6x11plus'}).setScale(2.75);
        this.add.text(645, 240, 'Engineering', { font: 'm6x11plus'}).setScale(2.75);
        this.add.text(200, 440, 'History & Culture', { font: 'm6x11plus'}).setScale(2.75);
        this.add.text(530, 440, 'Science & Exploration', { font: 'm6x11plus'}).setScale(2.75);
        let ins = this.add.text(250, 160, '*Select NPCs to initiate conversation.', { font: 'm6x11plus'}).setScale(2.5);
        ins.setScrollFactor(0);
    }

    update() {
        if (this.isChatOpen) {
            if (this.cursors.up.isDown || this.cursors.down.isDown || this.cursors.left.isDown || this.cursors.right.isDown) {
                this.closeChat();
            }
            return;
        }

        const cursors = this.input.keyboard.createCursorKeys();
        const speed = 120;
        let isMoving = false;

        if (cursors.left.isDown) {
            this.player.setVelocityX(-speed);
            this.player.setFlipX(true);
            isMoving = true;
        } else if (cursors.right.isDown) {
            this.player.setVelocityX(speed);
            this.player.setFlipX(false);
            isMoving = true;
        } else {
            this.player.setVelocityX(0);
        }

        if (cursors.up.isDown) {
            this.player.setVelocityY(-speed);
            isMoving = true;
        } else if (cursors.down.isDown) {
            this.player.setVelocityY(speed);
            isMoving = true;
        } else {
            this.player.setVelocityY(0);
        }

        // Play the appropriate animation based on movement
        if (isMoving) {
            this.player.anims.play('playerWalking', true);
        } else {
            this.player.anims.play('playerIdle', true);
        }

        this.cameras.main.startFollow(this.player);
        this.cameras.main.setLerp(0.5, 0.5);
        this.cameras.main.setBounds(-200, 20, 1500, 850); // Set camera bounds to match the world size
        this.cameras.main.setZoom(1.5, 1.5); // Zoom out to make the larger world visible
        
    }

    addCollider(x, y, width, height) {
        const collider = this.colliders.create(x, y, null).setOrigin(0, 0).refreshBody().setVisible(false);
        collider.body.setInv
        collider.body.setSize(width, height);
    }

    openChat(npc) {
        console.log("LET'S OPEN CHAT");
        if (this.isChatOpen) return;
        this.isChatOpen = true;

        console.log("NPC", npc);

        const uniqueIdSuffix = npc.characterDescription.replace(/\s+/g, '-').toLowerCase();

        if (this.chatDialogs.has(npc)) {
            console.log("HAS NPC");
            const dialog = this.chatDialogs.get(npc);
            dialog.chatLog.setVisible(true);
            dialog.chatInput.setVisible(true);
            dialog.sendButton.setVisible(true);
            dialog.closeButton.setVisible(true);
            dialog.chatInput.node.focus();
        } else {
            const chatLog = this.add.dom(815, 640).createFromHTML(`
                <div id="${npc.chatLogId}" style="${chatLogStyle}"></div>`);
            chatLog.setScrollFactor(0);

            const chatInputId = `chatInput-${uniqueIdSuffix}`;
            const chatInput = this.add.dom(650, 500).createFromHTML(`
                <input type="text" id="${chatInputId}" style="${inputStyle}" placeholder="Type Here..."/>`);
            chatInput.setScrollFactor(0);

            const sendButtonId = `sendButton-${uniqueIdSuffix}`;
            const sendButton = this.add.dom(950, 500).createFromHTML(`
                <button id="${sendButtonId}" style="${sendButtonStyle}" onmouseover="this.style.cssText='${sendButtonStyleHover}'" onmouseout="this.style.cssText='${sendButtonStyle}'">Send</button>`);
            sendButton.setScrollFactor(0);

            const closeButtonId = `closeButton-${uniqueIdSuffix}`;
            const closeButton = this.add.dom(1020, 550).createFromHTML(`
                <button id="${closeButtonId}" style="${closeButtonStyle}">X</button>`);
            closeButton.setScrollFactor(0);

            chatInput.node.addEventListener('keydown', (event) => {
                event.stopPropagation();
                if (event.key === "Enter" || event.keyCode === 13) {
                    this.sendChatMessage(npc, npc.chatManager, chatInputId, npc.chatLogId);
                    document.getElementById(chatInputId).value = "";
                }
            });

            sendButton.addListener('click').on('click', () => {
                this.sendChatMessage(npc, npc.chatManager, chatInputId, npc.chatLogId);
                document.getElementById(chatInputId).value = "";
            });


            closeButton.addListener('click').on('click', () => {
                this.closeChat();
            });

            chatInput.node.focus();

            this.chatDialogs.set(npc, {
                scroll,
                chatLog,
                chatInput,
                sendButton,
                closeButton
            });

            console.log(chatLog);
        }
    }

    closeChat() {
        if (!this.isChatOpen) return;
        this.isChatOpen = false;
        //this.tina.closeChat();

        for (let dialog of this.chatDialogs.values()) {
            dialog.chatLog.setVisible(false);
            dialog.chatInput.setVisible(false);
            dialog.sendButton.setVisible(false);
            dialog.closeButton.setVisible(false);
        }
    }
    // the color of the chat font
    updateChatLog(chatLogNode, role, message) {
    const color = role === 'Player' ? '#3d1e01' : '#8a0094';
    // Use the custom font in the style attribute
    chatLogNode.innerHTML += `<p style="color: ${color}; font-family: 'm6x11plus', monospace;">${role}: ${message}</p>`;
    chatLogNode.scrollTop = chatLogNode.scrollHeight;
}

    async sendChatMessage(npc, chatManager, chatInputId, chatLogId) {
        const chatInputNode = document.getElementById(chatInputId);
        const chatLogNode = document.getElementById(chatLogId);

        if (chatInputNode && chatLogNode) {
            const inputValue = chatInputNode.value;
            if (inputValue) {
                chatManager.addMessage('user', inputValue);
                this.updateChatLog(document.getElementById(npc.chatLogId), 'You', inputValue);

                const response = await chatManager.getCharacterResponse();
                chatManager.addMessage('assistant', response);
                this.updateChatLog(document.getElementById(npc.chatLogId), 'Character', response);

                document.getElementById('chatInput').value = '';
            }
        }
    }
}

const container = document.getElementById('renderDiv');
const config = {
    parent: 'renderDiv',
    type: Phaser.AUTO,
    scene: [ChatScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1400,
        height: 890,
    },
    dom: {
        createContainer: true
    },

    render: {
        pixelArt: true
    },

    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
        }
    },
    input: {
        keyboard: {
            capture: [37, 38, 39, 40] // Capture only arrow keys
        }
    }
};

window.phaserGame = new Phaser.Game(config);