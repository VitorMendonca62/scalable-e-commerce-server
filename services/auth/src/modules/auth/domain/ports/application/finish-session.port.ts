export interface FinishSessionPort {
  execute: (tokenID: string, userID: string) => Promise<ExecuteReturn>;
}

export type ExecuteReturn = {
  ok: true;
};
