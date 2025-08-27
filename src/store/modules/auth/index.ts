import { computed, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import { defineStore } from 'pinia';
import { useLoading } from '@sa/hooks';
import { roleTypeRecord } from '@/constants/business';
import { fetchGetUserInfo, fetchLogin, fetchVersion } from '@/service/api';
import { useRouterPush } from '@/hooks/common/router';
import { localStg } from '@/utils/storage';
import { SetupStoreId } from '@/enum';
import { $t } from '@/locales';
import { useRouteStore } from '../route';
import { useTabStore } from '../tab';
import { useSearchStore } from '../search';
import { clearAuthStorage, getToken } from './shared';

export const useAuthStore = defineStore(SetupStoreId.Auth, () => {
  const route = useRoute();
  const authStore = useAuthStore();
  const routeStore = useRouteStore();
  const tabStore = useTabStore();
  const searchStore = useSearchStore();
  const { toLogin, redirectFromLogin } = useRouterPush(false);
  const { loading: loginLoading, startLoading, endLoading } = useLoading();

  const token = ref(getToken());

  const namespaceUniqueId = ref('');

  const userInfo: Api.Auth.UserInfo = reactive({
    id: '',
    userId: '',
    mode: '',
    role: 1,
    username: '',
    userName: '',
    roles: [],
    buttons: [],
    namespaceIds: [],
    deleteAlert: {}
  });

  /** is super role in static route */
  const isStaticSuper = computed(() => {
    const { VITE_AUTH_ROUTE_MODE, VITE_STATIC_SUPER_ROLE } = import.meta.env;
    return (
      VITE_AUTH_ROUTE_MODE === 'static' && userInfo.roles.map(role => role?.toString()).includes(VITE_STATIC_SUPER_ROLE)
    );
  });

  /** Is login */
  const isLogin = computed(() => Boolean(token.value));

  /** Reset auth store */
  async function resetStore() {
    recordUserId();

    clearAuthStorage();

    authStore.$reset();
    searchStore.$reset();

    if (!route.meta.constant) {
      await toLogin();
    }

    tabStore.cacheTabs();
    routeStore.resetStore();
  }

  /** Record the user ID of the previous login session Used to compare with the current user ID on next login */
  function recordUserId() {
    if (!userInfo.userId) {
      return;
    }

    // Store current user ID locally for next login comparison
    localStg.set('lastLoginUserId', userInfo.userId);
  }

  /**
   * Check if current login user is different from previous login user If different, clear all tabs
   *
   * @returns {boolean} Whether to clear all tabs
   */
  function checkTabClear(): boolean {
    if (!userInfo.userId) {
      return false;
    }

    const lastLoginUserId = localStg.get('lastLoginUserId');

    // Clear all tabs if current user is different from previous user
    if (!lastLoginUserId || lastLoginUserId !== userInfo.userId) {
      localStg.remove('globalTabs');
      tabStore.clearTabs();

      localStg.remove('lastLoginUserId');
      return true;
    }

    localStg.remove('lastLoginUserId');
    return false;
  }

  /**
   * Login
   *
   * @param userName User name
   * @param password Password
   * @param [redirect=true] Whether to redirect after login. Default is `true`
   */
  async function login(userName: string, password: string, redirect = true) {
    startLoading();

    const { data: loginToken, error } = await fetchLogin(userName, password);

    if (!error) {
      const pass = await loginByToken(loginToken);

      if (pass) {
        // Check if the tab needs to be cleared
        const isClear = checkTabClear();
        let needRedirect = redirect;

        if (isClear) {
          // If the tab needs to be cleared,it means we don't need to redirect.
          needRedirect = false;
        }
        await redirectFromLogin(needRedirect);

        window.$notification?.success({
          title: $t('page.login.common.loginSuccess'),
          content: $t('page.login.common.welcomeBack', { userName: userInfo.userName }),
          duration: 4500
        });
      }
    } else {
      resetStore();
    }

    endLoading();
  }

  async function loginByToken(loginToken: Api.Auth.LoginToken) {
    // 1. stored in the localStorage, the later requests need it in headers
    localStg.set('token', loginToken.token);
    // localStg.set('refreshToken', loginToken.refreshToken);
    const userNamespace = localStg.get('userNamespace') || {};
    const namespaceId = userNamespace[loginToken.id];
    localStg.set('namespaceId', namespaceId);

    if (!namespaceId || !loginToken.namespaceIds.map(item => item.uniqueId).includes(namespaceId)) {
      userNamespace[loginToken.id] = loginToken.namespaceIds[0].uniqueId;
      localStg.set('namespaceId', loginToken.namespaceIds[0].uniqueId);
      localStg.set('userNamespace', userNamespace);
    }

    // 2. get user info
    const pass = await getUserInfo();

    if (pass) {
      token.value = loginToken.token;

      return true;
    }

    return false;
  }

  async function getUserInfo() {
    // update user info
    const { data: info, error } = await fetchGetUserInfo();

    if (!error) {
      // update store
      info!.userId = info.id;
      info!.userName = info?.username;
      info!.roles = [roleTypeRecord[info.role]];
      localStg.set('userInfo', info);
      localStg.set('userInfo', info);
      Object.assign(userInfo, info);

      return true;
    }

    return false;
  }

  async function initUserInfo() {
    const hasToken = getToken();

    if (hasToken) {
      const pass = await getUserInfo();

      if (!pass) {
        resetStore();
      }
    }
  }

  async function initAppVersion() {
    const { data: version, error: versionError } = await fetchVersion();
    if (!versionError && version) {
      localStg.set('version', version!);
    } else {
      localStg.remove('version');
    }
  }

  function setNamespaceId(namespaceId: string) {
    namespaceUniqueId.value = namespaceId;
    const userNamespace = localStg.get('userNamespace') || {};
    userNamespace[userInfo.userId] = namespaceId;
    localStg.set('userNamespace', userNamespace);
    localStg.set('namespaceId', namespaceId);
  }

  function setDeleteAlert(type: string, value: boolean) {
    userInfo.deleteAlert[type] = value;
    localStg.set('deleteAlert', userInfo.deleteAlert);
  }

  function getDeleteAlert(type: string) {
    const deleteAlert = localStg.get('deleteAlert') || userInfo.deleteAlert;
    return deleteAlert[type];
  }

  return {
    token,
    userInfo,
    namespaceUniqueId,
    isStaticSuper,
    isLogin,
    loginLoading,
    resetStore,
    login,
    getUserInfo,
    initUserInfo,
    initAppVersion,
    setNamespaceId,
    setDeleteAlert,
    getDeleteAlert
  };
});
