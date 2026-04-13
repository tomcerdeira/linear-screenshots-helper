import React from 'react';
import { Dropdown } from './Dropdown';
import { useLinearTeams } from '../hooks/useLinearTeams';

interface TeamPickerProps {
  readonly value: string;
  readonly onChange: (teamId: string) => void;
}

export function TeamPicker({ value, onChange }: TeamPickerProps) {
  const { teams, loading, error } = useLinearTeams();

  if (error) {
    return <p className="text-red-400 text-sm">{error}</p>;
  }

  const options = teams.map((team) => ({
    value: team.id,
    label: team.name,
    secondary: team.key,
  }));

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
