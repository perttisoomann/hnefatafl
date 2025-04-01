class EliminateOpposition extends GameObjective
{
    constructor(side, enemiesLeft = 0) {
        super(
            side,
            'Eliminate opposition pieces',
            side.isPlayerControlled ? 'Player Wins! All attackers are defeated!' : 'Enemy Wins! All defenders are captured!');
        this.enemiesLeft = enemiesLeft;
    }

    isAchieved() {
        const totalPieces = this.side.opposition.reduce((sum, side) => sum + side.pieces.length, 0);
        return totalPieces <= this.enemiesLeft;
    }
}