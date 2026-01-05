// ================================
// INPUT COMPONENT
// Sistema de Gestión Comercial
// ================================

import React from 'react';
import { Search, X, AlertCircle } from 'lucide-react';
import './Input.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helpText?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    isOptional?: boolean;
    inputSize?: 'sm' | 'md' | 'lg';
}

export function Input({
    label,
    error,
    helpText,
    leftIcon,
    rightIcon,
    isOptional = false,
    inputSize = 'md',
    className = '',
    id,
    required,
    ...props
}: InputProps) {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    const inputClasses = [
        'input',
        inputSize !== 'md' && `input-${inputSize}`,
        error && 'input-error',
        leftIcon && 'has-icon-left',
        rightIcon && 'has-icon-right',
        className,
    ].filter(Boolean).join(' ');

    return (
        <div className="form-group">
            {label && (
                <label htmlFor={inputId} className="form-label">
                    {label}
                    {required && <span className="form-required">*</span>}
                    {isOptional && <span className="form-label-optional"> (opcional)</span>}
                </label>
            )}

            <div className="input-wrapper">
                {leftIcon && <span className="input-icon-left">{leftIcon}</span>}
                <input
                    id={inputId}
                    className={inputClasses}
                    required={required}
                    {...props}
                />
                {rightIcon && <span className="input-icon-right">{rightIcon}</span>}
            </div>

            {error && (
                <p className="form-error">
                    <AlertCircle size={12} />
                    {error}
                </p>
            )}

            {helpText && !error && (
                <p className="form-help">{helpText}</p>
            )}
        </div>
    );
}

// Search input variant
export interface SearchInputProps extends Omit<InputProps, 'leftIcon'> {
    onClear?: () => void;
}

export function SearchInput({ onClear, value, ...props }: SearchInputProps) {
    return (
        <div className="search-input">
            <span className="search-input-icon">
                <Search size={18} />
            </span>
            <input
                type="search"
                className="input"
                value={value}
                {...props}
            />
            {value && onClear && (
                <button
                    type="button"
                    className="search-input-clear"
                    onClick={onClear}
                    aria-label="Limpiar búsqueda"
                >
                    <X size={16} />
                </button>
            )}
        </div>
    );
}

// Select component
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    helpText?: string;
    options: { value: string; label: string }[];
    placeholder?: string;
}

export function Select({
    label,
    error,
    helpText,
    options,
    placeholder,
    className = '',
    id,
    required,
    ...props
}: SelectProps) {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <div className="form-group">
            {label && (
                <label htmlFor={selectId} className="form-label">
                    {label}
                    {required && <span className="form-required">*</span>}
                </label>
            )}

            <select
                id={selectId}
                className={`input select ${error ? 'input-error' : ''} ${className}`}
                required={required}
                {...props}
            >
                {placeholder && (
                    <option value="" disabled>
                        {placeholder}
                    </option>
                )}
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>

            {error && (
                <p className="form-error">
                    <AlertCircle size={12} />
                    {error}
                </p>
            )}

            {helpText && !error && (
                <p className="form-help">{helpText}</p>
            )}
        </div>
    );
}

// Toggle component
export interface ToggleProps {
    label: string;
    description?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
}

export function Toggle({ label, description, checked, onChange, disabled }: ToggleProps) {
    return (
        <label className="toggle-label" style={{ opacity: disabled ? 0.5 : 1 }}>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                className={`toggle ${checked ? 'active' : ''}`}
                onClick={() => !disabled && onChange(!checked)}
                disabled={disabled}
            >
                <span className="toggle-knob" />
            </button>
            <div>
                <div style={{ fontWeight: 500 }}>{label}</div>
                {description && (
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                        {description}
                    </div>
                )}
            </div>
        </label>
    );
}
