// 진행자 현황판 분포 탭이 쓰는 데이터 형태
export interface OverviewPoint {
  company: string;
  name: string | null;
  mo: number;
  ca: number;
  quadrant: string;
  created_at: string;
}

export interface OverviewData {
  staff: OverviewPoint[];
  leaders: OverviewPoint[];
  updatedAt: string;
}
