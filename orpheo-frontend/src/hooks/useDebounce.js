import { useState, useEffect } from 'react';

/**
 * Hook personalizado para debounce de valores
 * @param {any} value - Valor a debounce
 * @param {number} delay - Retraso en milisegundos
 * @returns {any} - Valor con debounce aplicado
 */
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};