import React from 'react';
import { Dropdown } from './Dropdown';
import { useLinearTeams } from '../hooks/useLinearTeams';

interface TeamPickerProps {
  readonly value: string;
  readonly onChange: (teamId: string) => void;
  readonly variant?: 'default' | 'compact';
}

export function TeamPicker({ value, onChange, variant = 'default' }: TeamPickerProps) {
  const { teams, loading, error } = useLinearTeams();

  if (error) {
    return <p className="text-red-400 text-sm">{error}</p>;
  }

  const options = teams.map((team) => ({
    value: team.id,
    label: team.name,
    secondary: team.key,
  }));

  if (variant === 'compact') {
    const selected = teams.find((t) => t.id === value);
    return (
      <Dropdown
        options={options}
        value={value}
        onChange={onChange}
        placeholder="Team"
        disabled={loading}
        searchable={options.length > 5}
        panelMinWidth={240}
        renderTrigger={(selectedOpt, isOpen) => (
          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[13px] font-medium transition-colors ${isOpen ? 'bg-[#2a2a2e]' : 'hover:bg-[#2a2a2e]'}`}>
            <span className="w-4 h-4 rounded bg-[#5e6ad2]/20 flex items-center justify-center text-[10px] text-[#5e6ad2] font-bold shrink-0">
              {selected?.key?.[0] ?? '?'}
            </span>
            <span className="text-[#e2e2ea]">{selected?.key ?? 'Team'}</span>
          </span>
        )}
      />
    );
  }

  return (
    <Dropdown
      options={options}
      value={value}
      onChange={onChange}
      placeholder="Select a team"
      disabled={loading}
      searchable={options.length > 5}
    />
  );
}
