/**
 * Componente de Input para búsqueda de puerto
 * Validación en tiempo real y diseño limpio
 */

import { type ChangeEvent } from 'react';

interface PortInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function PortInput({ value, onChange, disabled = false }: PortInputProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Solo permitir números
    if (newValue === '' || /^\d+$/.test(newValue)) {
      onChange(newValue);
    }
  };

  const portNumber = parseInt(value);
  const isInvalid = value !== '' && (isNaN(portNumber) || portNumber < 1 || portNumber > 65535);

  return (
    <div className="w-full">
      <label htmlFor="port-input" className="block text-sm font-medium text-dark-300 mb-2">
        Número de Puerto
      </label>
      <input
        id="port-input"
        type="text"
        inputMode="numeric"
        className={`input ${isInvalid ? 'border-danger-500 focus:ring-danger-500' : ''}`}
        placeholder="Ej: 8083"
        value={value}
        onChange={handleChange}
        disabled={disabled}
        maxLength={5}
        autoComplete="off"
      />
      {isInvalid && (
        <p className="mt-2 text-sm text-danger-400 animate-fade-in">
          El puerto debe estar entre 1 y 65535
        </p>
      )}
    </div>
  );
}
