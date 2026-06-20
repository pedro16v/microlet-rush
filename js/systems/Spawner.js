// Spawns obstacles and pickups from a level's weighted tables.
class Spawner {
    constructor(scene, level, bounds) {
        this.scene = scene;
        this.level = level;
        this.top = bounds.top + 24;
        this.bottom = bounds.bottom - 18;
    }

    _pick(table) {
        const total = table.reduce(function (s, e) { return s + e.weight; }, 0);
        let r = Phaser.Math.Between(1, total);
        for (let i = 0; i < table.length; i++) {
            r -= table[i].weight;
            if (r <= 0) return table[i];
        }
        return table[table.length - 1];
    }

    randomY() {
        return Phaser.Math.Between(this.top, this.bottom);
    }

    spawnObstacle(group, gameSpeed) {
        const def = this._pick(this.level.obstacles);
        const y = this.randomY();
        const obstacle = this.scene.physics.add.sprite(GameConfig.WIDTH + 60, y, def.key);
        const size = def.key === 'yellow_taxi' ? 64 : 48;
        obstacle.setDisplaySize(size, size * 0.7);
        obstacle.body.setSize(obstacle.width * 0.7, obstacle.height * 0.7, true);
        obstacle.setDepth(5);
        obstacle.setData('dmg', def.dmg);
        obstacle.setData('kind', def.kind);
        obstacle.setData('baseY', y);
        obstacle.setData('phase', Math.random() * Math.PI * 2);
        obstacle.setVelocityX(-gameSpeed * (def.kind === 'weave' ? 1.15 : 1));
        group.add(obstacle);
        return obstacle;
    }

    spawnPickup(group, gameSpeed) {
        const def = this._pick(this.level.pickups);
        const y = this.randomY();
        const isPower = POWERUP_KEYS.indexOf(def.key) !== -1;
        const pickup = this.scene.physics.add.sprite(GameConfig.WIDTH + 60, y, def.key);
        const size = isPower ? 40 : 34;
        pickup.setDisplaySize(size, size);
        pickup.setDepth(5);
        pickup.setData('key', def.key);
        pickup.setData('power', isPower);
        pickup.setVelocityX(-gameSpeed);
        group.add(pickup);

        // juice: bob + spin
        this.scene.tweens.add({
            targets: pickup, y: y - 10, duration: 600,
            yoyo: true, repeat: -1, ease: 'Sine.inOut'
        });
        if (def.key === 'coin' || isPower) {
            this.scene.tweens.add({
                targets: pickup, angle: 360, duration: 1400, repeat: -1, ease: 'Linear'
            });
        }
        return pickup;
    }

    // weave obstacles oscillate vertically; call each frame for the group
    updateObstacles(group, time) {
        group.children.iterate(function (o) {
            if (o && o.getData('kind') === 'weave') {
                const baseY = o.getData('baseY');
                o.y = baseY + Math.sin(time / 350 + o.getData('phase')) * 32;
            }
        });
    }
}
