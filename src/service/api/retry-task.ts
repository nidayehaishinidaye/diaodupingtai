import { request } from '../request';

/** get retry log list */
export function fetchRetryLogPageList(params?: Api.RetryTask.RetryTaskSearchParams) {
  return request<Api.RetryTask.RetryTaskList>({
    url: '/retry-task/list',
    method: 'get',
    params
  });
}

/** get retry log list */
export function fetchRetryLogById(id: string) {
  return request<Api.RetryTask.RetryTask>({
    url: `/retry-task/${id}`,
    method: 'get'
  });
}

/** delete retry log */
export function fetchDeleteRetryLog(id: number) {
  return request<boolean>({
    url: `/retry-task/${id}`,
    method: 'delete'
  });
}

/** delete retry log */
export function fetchBatchDeleteRetryLog(ids: number[]) {
  return request<boolean>({
    url: `/retry-task/ids`,
    method: 'delete',
    data: ids
  });
}
