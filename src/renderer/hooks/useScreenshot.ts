import { useAsyncData } from './useAsyncData';
import type { ScreenshotData } from '../../shared/types';

export function useScreenshot() {
  const { data: screenshot, loading, error } = useAsyncData<ScreenshotData>(
    () => window.api.getScreenshot(),
  );
  return { screenshot, loading, error };
}
