// Selectable microlets. Stats are multipliers/values applied over level bases.
//   speed    - top-speed & acceleration multiplier
//   handling - steering responsiveness multiplier
//   armor    - higher = takes less damage per hit (damage divided by armor)
//   fuelMax  - tank size (also the fuel HUD scale)
window.VEHICLES = [
    {
        id: 'silver',
        key: 'microlet_silver',
        name: 'Silver Omega',
        blurb: 'All-rounder. Balanced and forgiving.',
        speed: 1.0, handling: 1.0, armor: 1.0, fuelMax: 100,
        accent: 0x4ec3ff
    },
    {
        id: 'esperansa',
        key: 'microlet_esperansa',
        name: 'Esperança',
        blurb: 'Fast but thirsty. For the bold.',
        speed: 1.18, handling: 0.92, armor: 0.9, fuelMax: 88,
        accent: 0xff6fae
    },
    {
        id: 'kuitadu',
        key: 'microlet_kuitadu',
        name: 'Kuitadu',
        blurb: 'Nimble cruiser with a big tank.',
        speed: 0.9, handling: 1.22, armor: 1.0, fuelMax: 115,
        accent: 0x7be06b
    },
    {
        id: 'realize',
        key: 'microlet_realize',
        name: 'Realize Dream',
        blurb: 'Built like a tank. Shrugs off potholes.',
        speed: 0.95, handling: 0.95, armor: 1.3, fuelMax: 105,
        accent: 0xffcf4d
    }
];

window.getVehicle = function (id) {
    return window.VEHICLES.find(function (v) { return v.id === id; }) || window.VEHICLES[0];
};
