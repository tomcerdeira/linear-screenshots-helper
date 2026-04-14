import { useState, useEffect, useRef } from 'react';
import type { LinearWorkflowState, LinearLabel, LinearUser } from '../../shared/types';

interface TeamData {
  readonly workflowStates: LinearWorkflowState[];
  readonly labels: LinearLabel[];
  readonly members: LinearUser[];
}

const EMPTY: TeamData = { workflowStates: [], labels: [], members: [] };

export function useTeamData(teamId: string) {
  const [data, setData] = useState<TeamData>(EMPTY);
  const [loading, setLoading] = useState(false);
  const activeRequest = useRef<string | null>(null);

  useEffect(() => {
    if (!teamId) {
      setData(EMPTY);
      return;
    }

    activeRequest.current = teamId;
    setLoading(true);

    Promise.all([
      window.api.getWorkflowStates(teamId),
      window.api.getLabels(teamId),
      window.api.getMembers(teamId),
    ]).then(([statesRes, labelsRes, membersRes]) => {
      if (activeRequest.current !== teamId) return;

      setData({
        workflowStates: statesRes.success && statesRes.data ? statesRes.data : [],
        labels: labelsRes.success && labelsRes.data ? labelsRes.data : [],
        members: membersRes.success && membersRes.data ? membersRes.data : [],
      });
      setLoading(false);
    });

    return () => { activeRequest.current = null; };
  }, [teamId]);

  return { ...data, loading };
}
