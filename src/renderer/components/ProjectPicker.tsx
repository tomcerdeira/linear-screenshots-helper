import React from 'react';
import { Dropdown } from './Dropdown';
import { useLinearProjects } from '../hooks/useLinearProjects';

interface ProjectPickerProps {
  readonly value: string;
  readonly onChange: (projectId: string) => void;
}

export function ProjectPicker({ value, onChange }: ProjectPickerProps) {
  const { projects, loading, error } = useLinearProjects();

  if (error) {
    return <p className="text-red-400 text-sm">{error}</p>;
  }

  const options = [
    { value: '', label: 'No project', icon: null },
    ...projects.map((project) => ({
      value: project.id,
      label: project.name,
      icon: project.icon,
    })),
  ];

  return (
    <Dropdown
      options={options}
      value={value}
      onChange={onChange}
      placeholder="No project (optional)"
      disabled={loading}
      searchable={options.length > 5}
    />
  );
}
