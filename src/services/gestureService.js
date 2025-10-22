// Mobile gesture controls service
class GestureService {
    constructor() {
        this.isSupported = 'ontouchstart' in window;
        this.gestureThreshold = 50; // Minimum distance for swipe
        this.tapThreshold = 300; // Maximum time for tap
        this.startX = 0;
        this.startY = 0;
        this.startTime = 0;
        this.isListening = false;
        this.init();
    }

    init() {
        if (this.isSupported) {
            this.setupEventListeners();
        }
    }

    setupEventListeners() {
        // Add touch event listeners to the document
        document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
        document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: true });
        document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
    }

    handleTouchStart(e) {
        if (!this.isListening) return;

        const touch = e.touches[0];
        this.startX = touch.clientX;
        this.startY = touch.clientY;
        this.startTime = Date.now();
    }

    handleTouchMove(e) {
        // Prevent default scrolling during gesture detection
        if (this.isListening && e.touches.length === 1) {
            e.preventDefault();
        }
    }

    handleTouchEnd(e) {
        if (!this.isListening) return;

        const touch = e.changedTouches[0];
        const endX = touch.clientX;
        const endY = touch.clientY;
        const endTime = Date.now();

        const deltaX = endX - this.startX;
        const deltaY = endY - this.startY;
        const deltaTime = endTime - this.startTime;

        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;

        // Determine gesture type
        if (distance > this.gestureThreshold) {
            // Swipe gesture
            if (Math.abs(angle) < 30) {
                // Horizontal swipe
                if (deltaX > 0) {
                    this.onSwipeRight?.();
                } else {
                    this.onSwipeLeft?.();
                }
            } else if (Math.abs(angle - 90) < 30 || Math.abs(angle + 90) < 30) {
                // Vertical swipe
                if (deltaY > 0) {
                    this.onSwipeDown?.();
                } else {
                    this.onSwipeUp?.();
                }
            }
        } else if (deltaTime < this.tapThreshold) {
            // Tap gesture
            this.onTap?.(endX, endY);
        }
    }

    // Enable gesture listening
    enable() {
        this.isListening = true;
    }

    // Disable gesture listening
    disable() {
        this.isListening = false;
    }

    // Set event handlers
    setEventHandlers(handlers) {
        this.onSwipeLeft = handlers.onSwipeLeft;
        this.onSwipeRight = handlers.onSwipeRight;
        this.onSwipeUp = handlers.onSwipeUp;
        this.onSwipeDown = handlers.onSwipeDown;
        this.onTap = handlers.onTap;
    }

    // Set gesture threshold
    setThreshold(threshold) {
        this.gestureThreshold = threshold;
    }

    // Set tap threshold
    setTapThreshold(threshold) {
        this.tapThreshold = threshold;
    }

    isAvailable() {
        return this.isSupported;
    }
}

// Create a singleton instance
const gestureService = new GestureService();

export default gestureService;
