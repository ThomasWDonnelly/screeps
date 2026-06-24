/**
 * Module: Heralds
 * 
 * Manages sending public messages to other players via public memory segments.
 * The term "Herald" comes from the Greek for a messenger or envoy.
 */
const heraldsManager = {

    /**
     * Sends a public message that can be read by other players.
     * @param {string} message The message to send.
     * @param {number} [segmentId=99] The public segment ID to use (0-99).
     */
    sendMessage: function (message, segmentId = 99) {
        if (typeof message !== 'string' || message.length === 0) {
            return 'Error: Invalid message provided.';
        }
        if (segmentId < 0 || segmentId > 99) {
            return 'Error: Invalid segment ID. Must be between 0 and 99.';
        }

        // Find username from any owned structure or creep
        const ownerObject = Object.values(Game.structures)[0] || Object.values(Game.creeps)[0];
        const username = ownerObject ? ownerObject.owner.username : 'Unknown';

        const formattedMessage = `[${Game.time}] ${username}: ${message}`;

        if (formattedMessage.length > 102400) { // 100 KB limit
            return 'Error: Message exceeds 100KB limit.';
        }

        // Set the segment content
        RawMemory.segments[segmentId] = formattedMessage;

        // Mark the segment as public for the next tick
        RawMemory.setPublicSegments([segmentId]);

        return `Herald sent: "${message}" on public segment ${segmentId}.`;
    }
};

module.exports = heraldsManager;
