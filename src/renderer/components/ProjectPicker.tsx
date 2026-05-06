import React from 'react';
import { Dropdown } from './Dropdown';
import { useLinearProjects } from '../hooks/useLinearProjects';
import { shortcodeToEmoji } from '../utils/emoji';

interface ProjectPickerProps {
  readonly value: string;
  readonly onChange: (projectId: string) => void;
  readonly variant?: 'default' | 'pill';
}

export const ProjectPicker = React.memo(ProjectPickerImpl);

function ProjectPickerImpl({ value, onChange, variant = 'default' }: ProjectPickerProps) {
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

  if (variant === 'pill') {
    const selected = projects.find((p) => p.id === value);
    const icon = selected ? shortcodeToEmoji(selected.icon) : null;

    return (
      <Dropdown
        options={options}
        value={value}
        onChange={onChange}
        placeholder="Project"
        disabled={loading}
        searchable={options.length > 5}
        panelMinWidth={280}
        renderTrigger={(selectedOpt, isOpen) => (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[12px] transition-colors cursor-pointer ${
            isOpen
              ? 'bg-surface-input border-border-hover text-content'
              : 'border-border text-content-secondary hover:border-border-hover hover:text-content'
          }`}>
            {icon && <span className="text-[13px]">{icon}</span>}
            {selected ? selected.name : 'Project'}
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
      placeholder="No project (optional)"
      disabled={loading}
      searchable={options.length > 5}
    />
  );
}
