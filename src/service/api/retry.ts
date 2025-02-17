import { request } from '../request';

/** get retryTask list */
export function fetchGetRetryTaskList(params?: Api.RetryTask.RetryTaskSearchParams) {
  return request<Api.RetryTask.RetryTaskList>({
    url: '/retry/list',
    method: 'get',
    params
  });
}

/** get retryTask */
export function fetchGetRetryTaskById(id: string, groupName: string) {
  return request<Api.RetryTask.RetryTask>({
    url: `/retry/${id}?groupName=${groupName}`,
    method: 'get'
  });
}

/** add retryTask */
export function fetchAddRetryTask(data: Api.RetryTask.RetryTask) {
  return request<boolean>({
    url: '/retry',
    method: 'post',
    data
  });
}

/** batch add retryTask */
export function fetchBatchAddRetryTask(data: Api.RetryTask.RetryTaskBatchAdd) {
  return request<boolean>({
    url: '/retry/batch',
    method: 'post',
    data
  });
}

/** edit retryTask */
export function fetchEditRetryTask(data: Api.RetryTask.RetryTask) {
  return request<boolean>({
    url: '/retry',
    method: 'put',
    data
  });
}

/** update retryTask status */
export function fetchUpdateRetryTaskStatus(data: Api.RetryTask.RetryTaskUpdateStatusRequest) {
  return request<boolean>({
    url: '/retry/status',
    method: 'put',
    data
  });
}

/** manual execute retryTask */
export function fetchExecuteRetryTask(data: Api.RetryTask.ManualTriggerTaskRequestVO) {
  return request<boolean>({
    url: '/retry/manual/trigger/retry/task',
    method: 'post',
    data
  });
}

/** manual execute callbackTask */
export function fetchExecuteCallbackTask(data: Api.RetryTask.ManualTriggerTaskRequestVO) {
  return request<boolean>({
    url: '/retry/manual/trigger/callback/task',
    method: 'post',
    data
  });
}

/** batch delete retryTask */
export function fetchBatchDeleteRetryTask(data: Api.RetryTask.BatchDeleteRetryTaskVO) {
  return request<number>({
    url: '/retry/batch',
    method: 'delete',
    data
  });
}

/** generate retryTask idempotent id */
export function fetchIdempotentIdGenerate(data: Api.RetryTask.GenerateRetryIdempotentIdVO) {
  return request<string>({
    url: '/retry/generate/idempotent-id',
    method: 'post',
    data
  });
}
