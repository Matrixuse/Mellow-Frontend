// Queue management service
class QueueService {
    constructor() {
        this.queue = [];
        this.currentIndex = 0;
        this.isShuffleMode = false;
        this.originalQueue = []; // Store original order when shuffle is active
    }

    // Add songs to queue
    addToQueue(songs, position = 'end') {
        if (!Array.isArray(songs)) {
            songs = [songs];
        }

        if (position === 'end') {
            this.queue.push(...songs);
        } else if (position === 'next') {
            this.queue.splice(this.currentIndex + 1, 0, ...songs);
        } else if (position === 'now') {
            this.queue.splice(this.currentIndex + 1, 0, ...songs);
            this.currentIndex = this.currentIndex + songs.length;
        }

        // Update original queue if not in shuffle mode
        if (!this.isShuffleMode) {
            this.originalQueue = [...this.queue];
        }
    }

    // Remove song from queue
    removeFromQueue(songId) {
        const index = this.queue.findIndex(song => song.id === songId);
        if (index !== -1) {
            this.queue.splice(index, 1);
            
            // Adjust current index if needed
            if (index < this.currentIndex) {
                this.currentIndex--;
            } else if (index === this.currentIndex && this.queue.length > 0) {
                // If we removed the current song, stay at the same position
                if (this.currentIndex >= this.queue.length) {
                    this.currentIndex = this.queue.length - 1;
                }
            }
        }
    }

    // Clear entire queue
    clearQueue() {
        this.queue = [];
        this.currentIndex = 0;
        this.originalQueue = [];
    }

    // Get current song
    getCurrentSong() {
        return this.queue[this.currentIndex] || null;
    }

    // Get next song
    getNextSong() {
        if (this.isShuffleMode) {
            return this.queue[Math.floor(Math.random() * this.queue.length)] || null;
        }
        return this.queue[this.currentIndex + 1] || null;
    }

    // Get previous song
    getPreviousSong() {
        return this.queue[this.currentIndex - 1] || null;
    }

    // Move to next song
    next() {
        if (this.isShuffleMode) {
            // In shuffle mode, pick a random song (but not the current one)
            if (this.queue.length <= 1) return this.getCurrentSong();
            let nextIndex;
            do {
                nextIndex = Math.floor(Math.random() * this.queue.length);
            } while (nextIndex === this.currentIndex && this.queue.length > 1);
            this.currentIndex = nextIndex;
        } else {
            this.currentIndex = (this.currentIndex + 1) % this.queue.length;
        }
        return this.getCurrentSong();
    }

    // Move to previous song
    previous() {
        this.currentIndex = this.currentIndex > 0 ? this.currentIndex - 1 : this.queue.length - 1;
        return this.getCurrentSong();
    }

    // Set current song by ID
    setCurrentSong(songId) {
        const index = this.queue.findIndex(song => song.id === songId);
        if (index !== -1) {
            this.currentIndex = index;
            return this.getCurrentSong();
        }
        return null;
    }

    // Toggle shuffle mode
    toggleShuffle() {
        this.isShuffleMode = !this.isShuffleMode;
        
        if (this.isShuffleMode) {
            // Store original order
            this.originalQueue = [...this.queue];
        } else {
            // Restore original order
            this.queue = [...this.originalQueue];
            // Find current song in original order
            const currentSong = this.originalQueue[this.currentIndex];
            const newIndex = this.queue.findIndex(song => song.id === currentSong?.id);
            this.currentIndex = newIndex !== -1 ? newIndex : 0;
        }
        
        return this.isShuffleMode;
    }

    // Get queue as array
    getQueue() {
        return [...this.queue];
    }

    // Get queue length
    getQueueLength() {
        return this.queue.length;
    }

    // Check if queue is empty
    isEmpty() {
        return this.queue.length === 0;
    }

    // Reorder queue (for manual reordering)
    reorderQueue(fromIndex, toIndex) {
        if (fromIndex >= 0 && fromIndex < this.queue.length && 
            toIndex >= 0 && toIndex < this.queue.length) {
            const [movedSong] = this.queue.splice(fromIndex, 1);
            this.queue.splice(toIndex, 0, movedSong);
            
            // Adjust current index if needed
            if (fromIndex === this.currentIndex) {
                this.currentIndex = toIndex;
            } else if (fromIndex < this.currentIndex && toIndex >= this.currentIndex) {
                this.currentIndex--;
            } else if (fromIndex > this.currentIndex && toIndex <= this.currentIndex) {
                this.currentIndex++;
            }
        }
    }

    // Get queue info
    getQueueInfo() {
        return {
            queue: this.getQueue(),
            currentIndex: this.currentIndex,
            currentSong: this.getCurrentSong(),
            nextSong: this.getNextSong(),
            previousSong: this.getPreviousSong(),
            isShuffleMode: this.isShuffleMode,
            length: this.getQueueLength()
        };
    }
}

// Create a singleton instance
const queueService = new QueueService();

export default queueService;
