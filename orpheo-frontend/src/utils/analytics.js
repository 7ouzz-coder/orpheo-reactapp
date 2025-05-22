// Google Analytics y tracking de eventos
export class Analytics {
  static init() {
    if (process.env.REACT_APP_GOOGLE_ANALYTICS_ID && process.env.NODE_ENV === 'production') {
      // Configurar Google Analytics
      window.gtag('config', process.env.REACT_APP_GOOGLE_ANALYTICS_ID);
    }
  }

  static trackEvent(action, category, label = null, value = null) {
    if (process.env.NODE_ENV === 'production' && window.gtag) {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
      });
    }
  }

  static trackPageView(path) {
    if (process.env.NODE_ENV === 'production' && window.gtag) {
      window.gtag('config', process.env.REACT_APP_GOOGLE_ANALYTICS_ID, {
        page_path: path,
      });
    }
  }
}