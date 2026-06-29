export type ActionSuccess<TData> = {
  success: true;
  data: TData;
};

export type ActionFailure = {
  success: false;
  error: string;
};

export type ActionResponse<TData> = ActionSuccess<TData> | ActionFailure;

export function actionSuccess<TData>(data: TData): ActionSuccess<TData> {
  return {
    success: true,
    data,
  };
}

export function actionFailure(error: string): ActionFailure {
  return {
    success: false,
    error,
  };
}
