/**
 * BackButtonRegistry:
 * Unified Priority-Based LIFO Back Button Stack for Android and Mobile Web.
 * Allows Modals, Drawers, Bottom Sheets, and Wizards to register handlers that
 * intercept system back navigation (hardware back button, gesture navigation, popstate).
 */

export interface BackHandlerRegistration {
  id: string;
  priority: number; // Higher number executed first (Modals: 100, Bottom Sheets: 50, Navigation: 10)
  handler: () => boolean; // Return true if event was consumed, false to pass to next handler
}

class BackButtonRegistry {
  private handlers: BackHandlerRegistration[] = [];

  /**
   * Registers a back action handler with a given priority.
   * Returns an unsubscribe cleanup function.
   */
  register(registration: BackHandlerRegistration): () => void {
    // Avoid duplicate IDs
    this.handlers = this.handlers.filter((h) => h.id !== registration.id);
    this.handlers.push(registration);
    this.handlers.sort((a, b) => b.priority - a.priority);

    return () => {
      this.handlers = this.handlers.filter((h) => h.id !== registration.id);
    };
  }

  /**
   * Dispatches the back event to the highest-priority active handler.
   * Returns true if any handler handled the event.
   */
  dispatch(): boolean {
    for (const item of this.handlers) {
      try {
        const handled = item.handler();
        if (handled) {
          return true;
        }
      } catch (err) {
        console.error(`[BackButtonRegistry] Error executing handler '${item.id}':`, err);
      }
    }
    return false;
  }

  /**
   * Returns current count of registered handlers (useful for debugging and tests)
   */
  get count(): number {
    return this.handlers.length;
  }
}

export const backButtonRegistry = new BackButtonRegistry();
