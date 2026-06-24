/**
 * Role: Link Manager
 *
 * Manages energy transfers between links within a room. It identifies links
 * near sources as 'senders' and attempts to transfer their energy to a
 * 'receiver' link, typically near the controller or storage.
 */
const linkManager = {
    /**
     * @param {Room} room The room to manage links in.
     */
    run: function (room) {
        // Link system is only viable at RCL 5+
        if (room.controller.level < 5) {
            return;
        }

        const links = room.find(FIND_MY_STRUCTURES, {
            filter: { structureType: STRUCTURE_LINK }
        });

        if (links.length < 2) {
            return; // Need at least two links to do anything
        }

        let sourceLinks = [];
        let upgraderLink = null;
        let storageLink = null;

        for (let link of links) {
            // If a link is near a source, it's a sender.
            if (link.pos.findInRange(FIND_SOURCES, 2).length > 0) {
                sourceLinks.push(link);
            }
            // If a link is near the controller, it's for the upgrader.
            else if (link.pos.inRangeTo(room.controller, 3)) {
                upgraderLink = link;
            } else {
                // Otherwise, it's a general/storage link.
                storageLink = link;
            }
        }

        for (let sourceLink of sourceLinks) {
            // If a source link is nearly full, transfer to the first available target link.
            if (sourceLink.store.getUsedCapacity(RESOURCE_ENERGY) >= sourceLink.store.getCapacity(RESOURCE_ENERGY) * 0.9) {
                // Prioritize the upgrader link, then the storage link.
                if (upgraderLink && upgraderLink.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                    sourceLink.transferEnergy(upgraderLink);
                } else if (storageLink && storageLink.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                    sourceLink.transferEnergy(storageLink);
                }
            }
        }
    }
};

module.exports = linkManager;