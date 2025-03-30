/** socket 通信 */
import { getServiceBaseURL } from '@/utils/service';
import { localStg } from './storage';
const { baseURL } = getServiceBaseURL(import.meta.env, false);
const url = baseURL.replace('http://', 'ws://');

/** 生成 token */
function generateToken(length: number) {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let token = 'SID_';
  for (let i = 0; i < length; i += 1) {
    const randomNumber = Math.floor(Math.random() * chars.length);
    token += chars.substring(randomNumber, randomNumber + 1);
  }
  return token;
}

// 初始化socket
export function initWebSocket(scene: string) {
  const token = localStg.get('token');
  if (import.meta.env.VITE_APP_WEBSOCKET === 'N' || !token) {
    return null;
  }

  const sid = generateToken(32);
  // 初始化 websocket
  return new WebSocket(`${url}/websocket?Snail-Job-Auth=${token}&sid=${sid}&scene=${scene}`);
}
