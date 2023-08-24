/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable @nx/enforce-module-boundaries */
import Config from 'react-native-config';
// @graph-ignore
import utilities from './tailwind.json';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { AppWrapper } from '@cigna/react-native/shared/feature/app-wrapper';
// @graph-ignore
import { mockServices } from './mock-services';
import { OnboardingHealthAssessmentStackNavigator } from '@cigna/react-native/evernorth-mobile/feature/onboarding-health-assessment';
import './init-i18n';
import { useTranslation } from '@cigna/react-native/shared/util/i18n';
import { Alert, Linking } from 'react-native';
import { UniversalLoginStackNavigator } from '@cigna/react-native/shared/feature/universal-login';
import { PaymentMethodsStackNavigator } from '@cigna/react-native/shared/feature/universal-payment-methods';
import { ShippingAddressStackNavigator } from '@cigna/react-native/shared/feature/universal-shipping-address';
import { useCallback, useState } from 'react';
import { PrimaryCareStackNavigator } from '@cigna/react-native/shared/feature/experience/primary-care';
import { MainApp } from '@cigna/react-native/evernorth-mobile/feature/dashboard';
import { ChatStackNavigator } from '@cigna/chat-native/chat';
import { useLeaf } from '@cigna/react-native/ds-mobile/util/leaf';
import { AuthType } from '@cigna/react-native/shared/util/authentication';
import { VitalsScreen } from '@cigna/react-native/evernorth-mobile/feature/vitals-screen';
import {
  notificationListeners,
  openAppNotificationHandler,
} from '@cigna/react-native/shared/util/push-notification';
import branch from 'react-native-branch';
import { FederatedWebNavigator } from '@cigna/react-native/shared/feature/federated-web';
import { analyticsConfig } from './analytics.config';
import { ShippingMethod } from '@cigna/react-native/evernorth-mobile/feature/my-medications';
import { LeafStackModalHeader } from '@cigna/react-native/leaf/ui/navigation/stack-modal-header'

const App: React.FC = () => {
  const { colors } = useLeaf();
  const { t } = useTranslation('app-evernorth-mobile', 'feature-my-medications');

  const onTokenExpired = useCallback(
    () =>
      new Promise<void>((resolve, _) => {
        Alert.alert(
          `${t('error.timeoutTitle')}`,
          `${t('error.timeoutLabel')}` || undefined,
          [
            {
              text: `${t('error.timeoutButton')}`,
              onPress: () => resolve(),
              isPreferred: true,
            },
          ],
        );
      }),
    [],
  );

  // enabling branch.io
  const linking = (
    isAuthenticated: boolean,
    setDeepLink: React.Dispatch<React.SetStateAction<string>>,
  ) => ({
    prefixes: [Config.DEEPLINK_PREFIX ?? ''],
    async getInitialURL() {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl && !isAuthenticated) {
        setDeepLink(initialUrl);
      }

      return initialUrl;
    },
    subscribe(listener: (url: string) => void) {
      const unsubscribe = Linking.addEventListener('url', ({ url }) => {
        if (url) {
          if (isAuthenticated) {
            listener(url);
          } else {
            setDeepLink(url);
          }
        }
      });

      const unsubscribeBranch = branch.subscribe({
        onOpenComplete: ({ error, params, uri }) => {
          if (error) {
            console.error(
              `subscribe onOpenComplete, Error from opening uri: ${uri} error: ${error}`,
            );
            return;
          }
          let linkUrl = uri;

          if (
            params &&
            !params['+clicked_branch_link'] &&
            params['+non_branch_link']
          ) {
            linkUrl = params['+non_branch_link'] as string;
          } else if (params?.$deeplink_path) {
            const deepLinkPath = params.$deeplink_path as string;
            linkUrl = `${Config.DEEPLINK_PREFIX}${deepLinkPath}`;
          }

          if (linkUrl) {
            if (isAuthenticated) {
              listener(linkUrl);
            } else {
              setDeepLink(linkUrl);
            }
          } else {
            openAppNotificationHandler(setDeepLink);
          }
        },
      });

      const unsubscribeNotification = notificationListeners(setDeepLink);

      return () => {
        unsubscribeNotification();
        unsubscribeBranch();
        unsubscribe.remove();
      };
    },
  });

  return (
    <AppWrapper
      analytics={analyticsConfig}
      appDebug={{ mockServices }}
      appMeta={{
        resourceRootUrls: [
          'cdn',
          'healthhub',
          'composable',
          'contentHub',
          'survey',
          'healthkit',
          'tpv',
          'fhir',
          'onboardingProfile',
        ],
      }}
      linking={linking}
      auth={{
        // authType: AuthType.Okta,
        authType: AuthType.Auth0,
        onTokenExpired,
        onGenericError: onTokenExpired,
      }}
      splashScreen={{
        image: require('../assets/bootsplash_logo.png'),
        colors: ['#035C67', '#035C67'],
      }}
      tailwind={{ utilities }}
      hasOmni={true}
      navigationContainer={{
        theme: {
          dark: false,
          colors: {
            primary: colors.content['brand-strong'],
            background: colors.bg.subtle,
            card: colors.bg.subtle,
            text: colors.content.default,
            border: colors.border.default,
            notification: colors.content.error,
          },
        },
      }}
      hasPaymentMethods
      hasShippingMethods
      appStack={{
        authScreen: {
          // name: AuthType.Okta,
          name: AuthType.Auth0,
          // component: PreLoginNavigator,
          component: UniversalLoginStackNavigator,
          props: {
            landingRouteName: 'main-login',
            showDefaultLoadingScreen: false,
          },
          gotoScreenOnDismiss: ['onboarding-health-assessment'],
          resetOnDismiss: true,
        },
        screens: [
          {
            name: 'onboarding-health-assessment',
            component: OnboardingHealthAssessmentStackNavigator,
            gotoScreenOnDismiss: ['main-app'],
            resetOnDismiss: true,
          },
          {
            name: 'federated-web',
            component: FederatedWebNavigator,
            gotoScreenOnDismiss: ['main-app'],
          },
          {
            name: 'main-app',
            component: MainApp,
          },
          {
            name: 'vitals-screen',
            component: VitalsScreen,
          },
          {
            name: 'primary-care',
            component: PrimaryCareStackNavigator,
            modal: true,
          },
          {
            name: 'chat',
            component: ChatStackNavigator,
          },
          {
            name: 'universal-payment',
            component: PaymentMethodsStackNavigator,
          },
          {
            name: 'universal-shipping-address',
            component: ShippingAddressStackNavigator,
          },
          {
            name: 'shipping-method',
            component: ShippingMethod,
            options: {
              headerTitle: t('shippingMethod.title'),
              headerShown: true,
              header: LeafStackModalHeader,
              headerStyle: { height: 150 },
              headerRight: null,
              headerLeft: null,
            }
          }
        ],
      }}
    />
  );
};

export { App };
export default App;
