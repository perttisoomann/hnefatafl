function generateVikingName() {
    const prefixes = ["Thor", "Odin", "Freyr", "Tyr", "Loki", "Bjorn", "Ivar", "Ragnar", "Astrid", "Ingrid"];
    const suffixes = ["son", "dottir", "hammer", "axe", "shield", "helm", "blade", "fist", "stone", "wind"];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    return prefix + suffix;
}

class PlayerPiece extends Piece {
    constructor(scene, board, row, col, texture) {
        super(scene, board, row, col, texture ?? 'pawn_piece');
        this.xp = 0;
        this.name = generateVikingName();
        this.levelConfig = this.getLevelConfig(); // Get piece-specific level config

        this.sprite.on('pointerover', () => {
            if (scene.selectedPiece !== this) {
                this.sprite.setTint(0x00ff00);
            }
        });
        this.sprite.on('pointerout', () => {
            if (scene.selectedPiece !== this) {
                this.sprite.clearTint();
            }
        });

        this.updateHearts();
    }

    getLevelConfig() {
        // Base level config, can be overridden by subclasses
        return {
            1: { xpRequired: 0, texture: 'pawn_piece', bonus: {} },
            2: { xpRequired: 3, texture: 'pawn_piece_level2', bonus: { health: 1 } },
            3: { xpRequired: 6, texture: 'pawn_piece_level3', bonus: { attack: 1, moveRange: 1 } },
            // Add more levels as needed
        };
    }

    gainXP() {
        this.xp += 1;
        this.checkLevelUp();
        this.showXpGainAnimation();
    }

    checkLevelUp() {
        const nextLevel = this.level + 1;
        if (this.levelConfig[nextLevel] && this.xp >= this.levelConfig[nextLevel].xpRequired) {
            this.levelUp(nextLevel);
        }
    }

    levelUp(newLevel) {
        const config = this.levelConfig[newLevel];
        if (!config) return; // Invalid level

        this.level = newLevel;
        this.sprite.setTexture(config.texture);
        this.applyBonus(config.bonus);
        this.showLevelUpAnimation();
    }

    applyBonus(bonus) {
        // Apply level bonuses, extend in subclasses for specific bonuses
        if (bonus.health) {
            this.maxHealth = (this.maxHealth || 1) + bonus.health;
            this.createHearts();
            this.heal(bonus.health);
        }
        if (bonus.attack) {
            this.attack = (this.attack || 1) + bonus.attack;
            this.createAttackIcons();
        }
        if (bonus.moveRange) {
            this.moveRange = (this.moveRange || 1) + bonus.moveRange;
        }
    }

    showXpGainAnimation() {
        const floatingText = this.scene.add.text(
            this.sprite.x,
            this.sprite.y - 20,
            '+1',
            { fontSize: '20px', fill: '#ffff00', stroke: '#000', strokeThickness: 3 }
        ).setOrigin(0.5);

        this.scene.tweens.add({
            targets: floatingText,
            y: this.sprite.y - 60,
            alpha: 0,
            scale: 1.5,
            duration: 1000,
            ease: 'Power1',
            onComplete: () => {
                floatingText.destroy();
            }
        });
    }

    showLevelUpAnimation() {
        //Add animation for level up here, for example particle effect, or different text animation.
        const levelUpText = this.scene.add.text(
            this.sprite.x,
            this.sprite.y - 40,
            `Level Up!`,
            {fontSize: '24px', fill: '#00ff00', stroke: '#000', strokeThickness: 3}
        ).setOrigin(0.5);

        this.scene.tweens.add({
            targets: levelUpText,
            y: this.sprite.y - 80,
            alpha: 0,
            duration: 2500,
            ease: 'Power2',
            onComplete: () =>{
                levelUpText.destroy();
            }
        })
    }
}