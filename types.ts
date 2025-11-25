export interface Winner {
  id: string;
  name: string;
  timestamp: number;
  aiMessage?: string;
}

export enum AppState {
  IDLE = 'IDLE',
  ROLLING = 'ROLLING',
  WINNER = 'WINNER',
}

export interface FileUploadProps {
  onFileLoaded: (names: string[]) => void;
}

export interface WinnerModalProps {
  winner: Winner | null;
  onClose: () => void;
  isGeneratingMessage: boolean;
}

export interface NameListProps {
  title: string;
  names: string[] | Winner[];
  type: 'remaining' | 'drawn';
  onReset?: () => void;
}