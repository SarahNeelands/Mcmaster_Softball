export type Season = {
  id: string;
  name: string;
  series: Series[];
}

export type Series = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  divisions: Division[];
  moveUpAmount: number;
  moveDownAmount: number;
}


export type Division = {
  id: string;
  name: string;
  slug: string;
  winPoints: number;
  lossPoints: number;
  tiePoints: number;
  teamIDs: string[];
  standings: Standing[];
};


export interface Standing {
  teamID: string;
  wins: number;
  losses: number;
  ties: number;
  points: number;
}
