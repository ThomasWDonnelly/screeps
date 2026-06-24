/**
 * Role: Visual Manager
 *
 * Draws helpful information onto the screen for a given room.
 * This includes controller progress, energy levels, creep counts, and more.
 */
const oracleAtDelphi = require('oracleAtDelphi');
const roleVisualManager = {
    /**
     * @param {Room} room The room to draw visuals for.
     * @param {object} roleCounts A count of creeps for each role.
     */
    run: function (room, roleCounts) {
        let y = 1;
        const x = 48.5;
        const align = 'right';
        const font = 0.7;

        // Room Name and Controller Level/Progress
        const rclProgress = room.controller.progress;
        const rclTotal = room.controller.progressTotal;
        const rclPercent = Math.round((rclProgress / rclTotal) * 100);
        room.visual.text(`🏛️ ${room.name} (RCL ${room.controller.level})`, x, y++, { align, font: 0.8 });
        room.visual.text(`Progress: ${Math.round(rclProgress / 1000)}k / ${Math.round(rclTotal / 1000)}k (${rclPercent}%)`, x, y++, { align, font: 0.5 });

        // Energy Status
        const energyPercent = Math.round((room.energyAvailable / room.energyCapacityAvailable) * 100);
        room.visual.text(`⚡ Energy: ${room.energyAvailable} / ${room.energyCapacityAvailable} (${energyPercent}%)`, x, y++, { align, font });

        // Creep Counts
        const totalCreeps = _.sum(Object.values(roleCounts));
        room.visual.text(`🧑‍🤝‍🧑 Creeps: ${totalCreeps}`, x, y++, { align, font });

        // Storage Status
        if (room.storage) {
            const storageUsed = _.sum(room.storage.store);
            room.visual.text(`📦 Storage: ${Math.round(storageUsed / 1000)}k`, x, y++, { align, font });
        }

        // Hostiles and Construction
        const hostiles = room.find(FIND_HOSTILE_CREEPS, { filter: c => require('diplomacy').getStatus(c.owner.username) !== 'ally' });
        const sites = room.find(FIND_CONSTRUCTION_SITES);
        room.visual.text(`⚔️ Hostiles: ${hostiles.length}`, x, y++, { align, font, color: hostiles.length > 0 ? '#ff0000' : '#ffffff' });
        room.visual.text(`🚧 Sites: ${sites.length}`, x, y++, { align, font });

        // Current Prophecy
        const prophecy = Memory.oracle ? Memory.oracle.prophecy : null;
        if (prophecy) {
            room.visual.text(`📜 Prophecy:`, x, y++, { align, font: 0.8 });
            room.visual.text(`${oracleAtDelphi.getProphecyText(prophecy)}`, x, y++, { align, font: 0.6 });
        }
    }
};

module.exports = roleVisualManager;