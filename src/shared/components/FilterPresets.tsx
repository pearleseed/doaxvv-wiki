import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

/**
 * Represents a single filter preset configuration
 */
export interface FilterPreset {
  id: string;
  name: string;
  filters: Record<string, string | string[]>;
}

/**
 * Props for the FilterPresets component
 */
export interface FilterPresetsProps {
  /** Array of preset configurations to display */
  presets: FilterPreset[];
  /** ID of the currently active preset (if any) */
  activePresetId?: string;
  /** Callback when a preset is applied */
  onApply: (filters: Record<string, string | string[]>) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * FilterPresets component displays a horizontal group of preset filter buttons.
 * Users can click a preset to quickly apply a predefined set of filters.
 * 
 * @example
 * ```tsx
 * const presets = [
 *   { id: 'ssr-only', name: 'SSR Only', filters: { rarity: 'SSR' } },
 *   { id: 'active', name: 'Active Events', filters: { status: 'Active' } },
 * ];
 * 
 * <FilterPresets
 *   presets={presets}
 *   activePresetId={activePreset}
 *   onApply={(filters) => setFilters(filters)}
 * />
 * ```
 */
export function FilterPresets({
  presets,
  activePresetId,
  onApply,
  className,
}: FilterPresetsProps) {
  const handlePresetClick = React.useCallback(
    (preset: FilterPreset) => {
      onApply(preset.filters);
    },
    [onApply]
  );

  if (presets.length === 0) {
    return null;
  }

  return (
    <div
      className={cn('flex flex-wrap gap-2', className)}
      role="group"
      aria-label="Filter presets"
    >
      {presets.map((preset) => {
        const isActive = preset.id === activePresetId;
        return (
          <Button
            key={preset.id}
            variant={isActive ? 'default' : 'outline'}
            size="sm"
            onClick={() => handlePresetClick(preset)}
            aria-pressed={isActive}
            className={cn(
              'transition-colors',
              isActive && 'ring-2 ring-primary ring-offset-2'
            )}
          >
            {preset.name}
          </Button>
        );
      })}
    </div>
  );
}

export default FilterPresets;
