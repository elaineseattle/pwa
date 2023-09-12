import { View, Pressable } from 'react-native';
import { ListItem } from '@cigna/react-native/ds-mobile/ui/list/list-item';
import { useTailwind } from '@cigna/react-native/shared/ui/tailwind';
import { Icon } from '@cigna/react-native/shared/ui/icon';
import { Text } from '@cigna/react-native/ds-mobile/ui/text';
import {
  Payment,
  Balances,
  PrescriptionAlert,
} from '@cigna/shared/evn-nav/pharmacy/medications-util';
import {
  useFeatureTranslation,
  useFeatureNavigation,
  mapPrescriptionResponse,
} from '../../hooks';

export interface PharmacyMessagesProps {
  alerts: PrescriptionAlert[];
  payment?: Payment;
  balances?: Balances;
}
export const PharmacyMessages = ({
  alerts,
  balances,
}: PharmacyMessagesProps) => {
  const { tw } = useTailwind();
  const { t } = useFeatureTranslation();
  const balance =
    balances?.financialAccount?.accountBalances?.currentBalanceAmount;
  const { navigate } = useFeatureNavigation();

  const navigateToPrescription = (alert: PrescriptionAlert) => {
    if (alert.count > 1) {
      navigate('prescriptions-list');
    } else {
      const prescription = mapPrescriptionResponse(alert.prescription);
      navigate('refill-renew-preorder', {
        prescription,
      });
    }
  };

  const getTilte = (alert: PrescriptionAlert) => {
    let status = alert.status.toLowerCase();
    if (status === 'renew') {
      status = 'renewal';
    }
    const count = alert.count;
    if (count > 1) {
      return t('pharmacyLandingPage.alerts.multiPrescriptionTitle', {
        count,
        status,
      });
    }
    const name = alert.prescription?.drugName ?? t('unavailableDrugNameText');
    return t('pharmacyLandingPage.alerts.signlePrescriptionTitle', {
      name,
      status,
    });
  };

  const getColor = (status: string, isIcon: boolean) => {
    if (status === 'Renew') {
      return 'warning-dark';
    }
    return isIcon ? 'primary' : 'brand-strong';
  };

  const getBackground = (status: string) => {
    if (status === 'Renew') {
      return 'border-warning  bg-warning-light';
    }
    return 'border-primary-light bg-primary-xlight';
  };

  return (
    <View style={tw('gap-2 mt-4')}>
      {alerts.map((alert: PrescriptionAlert, index: number) => (
        <Pressable
          testID={`pharmacy-message-${index}`}
          key={index}
          onPress={() => navigateToPrescription(alert)}
        >
          <View
            style={[
              tw('flex-row items-center rounded-lg border py-5 px-6'),
              tw(getBackground(alert.status)),
            ]}
          >
            <View style={tw('flex-row flex-1 gap-2')}>
              <Icon
                variant="info"
                filled={true}
                size="xs"
                color={getColor(alert.status, true)}
              />
              <View style={tw('flex-1')}>
                <Text
                  variant="body"
                  isStrong
                  color={getColor(alert.status, false)}
                >
                  {getTilte(alert)}
                </Text>
                <Text variant="body" style={tw('mt-1')}>
                  {t('pharmacyLandingPage.alerts.secondaryLabel')}
                </Text>
              </View>
            </View>
            <View style={[tw('flex-row items-center')]}>
              <Icon variant="chevron-right" color="black" size="sm" />
            </View>
          </View>
        </Pressable>
      ))}
      {balance > 0 ? (
        <ListItem
          testID={`pharmacy-balance`}
          title={t('messages.balanceTitle', { balance })}
          metadata={t('messages.payLabel')}
          onPress={() => navigate('make-payment', { balances })}
          style={tw('rounded-lg border border-primary-light bg-primary-xlight')}
          icon={{
            variant: 'info',
            filled: true,
            size: 'xs',
          }}
        />
      ) : null}
    </View>
  );
};
