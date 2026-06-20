// Wraps the player microlet: smooth (lerped) steering, fuel, armor and
// timed power-ups. GameScene owns score/damage/distance; this owns the vehicle.
class Player {
    constructor(scene, x, y, vehicle, bounds) {
        this.scene = scene;
        this.vehicle = vehicle;

        this.sprite = scene.physics.add.sprite(x, y, vehicle.key);
        this.sprite.setDisplaySize(128, 64);
        this.sprite.setDepth(6);
        this.sprite.setCollideWorldBounds(true);
        // tighter hitbox than the art so grazes feel fair
        this.sprite.body.setSize(this.sprite.width * 0.7, this.sprite.height * 0.55, true);

        this.minY = bounds.top + 18;
        this.maxY = bounds.bottom - 14;

        // steering feel (px/s), scaled by vehicle handling/speed
        this.maxVX = 320 * vehicle.speed;
        this.maxVY = 260 * vehicle.handling;
        this.accel = 0.18 * vehicle.handling; // velocity lerp factor / frame@60

        this.fuelMax = vehicle.fuelMax;
        this.fuel = vehicle.fuelMax;
        this.armor = vehicle.armor;

        this.invulnUntil = 0;
        this.powerups = {}; // key -> expiresAt (scene time ms)

        this._shield = scene.add.ellipse(x, y, 150, 90);
        this._shield.setStrokeStyle(3, 0x66e0ff, 0.9);
        this._shield.setDepth(7);
        this._shield.setVisible(false);
    }

    get x() { return this.sprite.x; }
    get y() { return this.sprite.y; }

    update(dt, input) {
        const body = this.sprite.body;

        let targetVX = 0;
        let targetVY = 0;
        if (input.left) targetVX = -this.maxVX;
        else if (input.right) targetVX = this.maxVX;
        if (input.up) targetVY = -this.maxVY;
        else if (input.down) targetVY = this.maxVY;

        // frame-rate independent smoothing toward target velocity
        const lerp = 1 - Math.pow(1 - this.accel, dt * 60);
        body.velocity.x = Phaser.Math.Linear(body.velocity.x, targetVX, lerp);
        body.velocity.y = Phaser.Math.Linear(body.velocity.y, targetVY, lerp);

        // facing
        if (targetVX < -5) this.sprite.flipX = true;
        else if (targetVX > 5) this.sprite.flipX = false;

        // depth lean (subtle tilt on vertical movement)
        const targetAngle = targetVY < 0 ? -6 : (targetVY > 0 ? 6 : 0);
        this.sprite.angle = Phaser.Math.Linear(this.sprite.angle, targetAngle, lerp);

        // clamp to road band
        if (this.sprite.y < this.minY) { this.sprite.y = this.minY; body.velocity.y = Math.max(0, body.velocity.y); }
        if (this.sprite.y > this.maxY) { this.sprite.y = this.maxY; body.velocity.y = Math.min(0, body.velocity.y); }

        // shield follows
        if (this._shield.visible) {
            this._shield.setPosition(this.sprite.x, this.sprite.y);
        }
    }

    consumeFuel(amount) {
        this.fuel = Math.max(0, this.fuel - amount);
        return this.fuel;
    }

    refuel(amount) {
        this.fuel = Math.min(this.fuelMax, this.fuel + amount);
        return this.fuel;
    }

    // damage after armor; returns the actual amount applied
    applyDamage(raw) {
        return Math.round(raw / this.armor);
    }

    isInvulnerable(time) {
        return this.isPowerupActive('pw_shield', time) || time < this.invulnUntil;
    }

    grantInvuln(time, ms) {
        this.invulnUntil = Math.max(this.invulnUntil, time + ms);
    }

    activatePowerup(key, time, ms) {
        this.powerups[key] = time + ms;
        if (key === 'pw_shield') this._shield.setVisible(true);
    }

    isPowerupActive(key, time) {
        return this.powerups[key] && time < this.powerups[key];
    }

    powerupRemaining(key, time) {
        if (!this.powerups[key]) return 0;
        return Math.max(0, this.powerups[key] - time);
    }

    // expire timed power-ups; returns list of keys that just expired
    tickPowerups(time) {
        const expired = [];
        Object.keys(this.powerups).forEach((key) => {
            if (this.powerups[key] && time >= this.powerups[key]) {
                delete this.powerups[key];
                expired.push(key);
                if (key === 'pw_shield') this._shield.setVisible(false);
            }
        });
        // flicker shield near expiry
        if (this._shield.visible) {
            const rem = this.powerupRemaining('pw_shield', time);
            this._shield.setAlpha(rem < 1200 ? (Math.sin(time / 60) > 0 ? 0.9 : 0.25) : 0.9);
        }
        return expired;
    }

    destroy() {
        this._shield.destroy();
        this.sprite.destroy();
    }
}
