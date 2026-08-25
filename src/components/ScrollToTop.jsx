import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop - Global React Router Scroll Restoration Component
 * Ensures every page navigation (Route, Category, Product, Cart, Checkout, Search)
 * automatically scrolls to the absolute top of the page immediately.
 */
const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Reset window scroll position instantly
    window.scrollTo(0, 0);

    // Fallback for document scrolling elements across all browser engines
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }
  }, [pathname, search]);

  return null;
};

export default ScrollToTop;
