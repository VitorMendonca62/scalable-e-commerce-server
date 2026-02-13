export interface SendCodeForForgotPasswordPort {
  execute: (email: string) => Promise<ExecuteReturn>;
}

export type ExecuteReturn = {
  ok: true;
};
