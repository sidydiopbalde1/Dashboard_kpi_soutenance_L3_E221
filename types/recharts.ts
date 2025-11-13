export interface PieCallbackProps {
    name?: string;
    value?: number;
    percent?: number;
    payload?: any;
    [key: string]: any;
  }
  
  // Bonus: Fonctions utilitaires
  export const formatPieLabel = (props: PieCallbackProps): string => {
    const name = props.payload?.name || props.name || '';
    const percent = props.percent || 0;
    return `${name}: ${(percent * 100).toFixed(0)}%`;
  };
  
  export const formatPieValue = (props: PieCallbackProps): string => {
    const name = props.name || '';
    const value = props.value || 0;
    return `${name}: ${value}`;
  };