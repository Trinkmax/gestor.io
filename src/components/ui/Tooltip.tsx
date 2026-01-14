// ================================
// TOOLTIP COMPONENT
// Sistema de Gestión Comercial
// ================================

import React, { useState, useRef, useEffect } from 'react';
import './Tooltip.css';

interface TooltipProps {
    content: string;
    children: React.ReactElement;
    position?: 'top' | 'bottom' | 'left' | 'right';
    delay?: number;
}

export function Tooltip({ 
    content, 
    children, 
    position = 'top',
    delay = 200 
}: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [coords, setCoords] = useState({ x: 0, y: 0 });
    const triggerRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<number | null>(null);

    const showTooltip = () => {
        timeoutRef.current = window.setTimeout(() => {
            if (triggerRef.current) {
                const rect = triggerRef.current.getBoundingClientRect();
                setCoords({
                    x: rect.left + rect.width / 2,
                    y: position === 'bottom' ? rect.bottom : rect.top,
                });
            }
            setIsVisible(true);
        }, delay);
    };

    const hideTooltip = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsVisible(false);
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return (
        <>
            <div
                ref={triggerRef}
                className="tooltip-trigger"
                onMouseEnter={showTooltip}
                onMouseLeave={hideTooltip}
                onFocus={showTooltip}
                onBlur={hideTooltip}
            >
                {children}
            </div>
            {isVisible && (
                <div
                    className={`tooltip tooltip-${position}`}
                    style={{
                        left: coords.x,
                        top: position === 'bottom' ? coords.y + 8 : coords.y - 8,
                    }}
                    role="tooltip"
                    aria-hidden={!isVisible}
                >
                    {content}
                </div>
            )}
        </>
    );
}
