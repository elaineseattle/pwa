import { View, Pressable } from 'react-native';
import { useTailwind } from '@cigna/react-native/shared/ui/tailwind';
import { Card } from '@cigna/react-native/shared/ui/card';
import { LeafIcon } from '@cigna/react-native/leaf/ui/icon';
import { LeafText } from '@cigna/react-native/leaf/ui/text';
import { Order } from '@cigna/shared/evn-nav/pharmacy/medications-util';
import { useFeatureNavigation, useFeatureTranslation } from '../../hooks';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { StatusComponent } from './status-badge';
import { Group } from '@cigna/react-native/ds-mobile/ui/list/group';
import { getDateFnsLocale } from '@cigna/react-native/shared/util/localization';

export interface OrderCardProps extends Order {
  variant?: 'compact' | 'full';
  onPress?: () => void;
  testID?: string;
}
export const OrderCard = ({
  variant = 'full',
  onPress,
  testID,
  ...order
}: OrderCardProps) => {
  const { tw } = useTailwind();
  const { t } = useFeatureTranslation();
  const { navigate } = useFeatureNavigation();

  // TODO: this calculation will eventually be done in the API
  const subtitle = `$${order.orderItems
    .reduce((acc: number, itm) => acc + (itm.originalPrice || 0), 0)
    .toFixed(2)}`;

  const drugNames = order.orderItems
    .map((o) => o.prescription.drug.name || t('unavailableDrugNameText'))
    .join(', ');

  let formattedDate = '';
  const orderCreationDate = new Date(order.creationDate);
  if (!isNaN(orderCreationDate.getTime())) {
    formattedDate = format(orderCreationDate, 'PP', {
      locale: getDateFnsLocale(),
    });
  }

  const getOrderStatus = (orders: Order): string => {
    const orderStatuses = orders.orderItems.map((x) => x.orderStatus.status);
    const availableOrderStatuses = [
      t('orders.status.actionRequired.infoLabel'),
      t('orders.status.cancelled.infoLabel'),
      t('orders.status.stopped.infoLabel'),
      t('orders.status.delayed.infoLabel'),
      t('orders.status.shipped.infoLabel'),
      t('orders.status.processing.infoLabel'),
      t('orders.status.received.infoLabel'),
      t('orders.status.scheduled.infoLabel'),
      t('orders.status.miscellaneous.infoLabel'),
    ];

    for (const availableStatus of availableOrderStatuses) {
      if (
        orderStatuses.find((orderStatus) => orderStatus === availableStatus)
      ) {
        return availableStatus;
      }
    }
    return '';
  };

  if (variant === 'compact') {
    return (
      <Card
        style={tw('py-4 items-start')}
        onPress={onPress}
        testID={`compact-${testID}`}
      >
        <StatusComponent status={getOrderStatus(order)} testID={testID} />

        <Pressable
          style={[
            tw('flex-row w-full justify-between items-center gap-2 px-6 py-1'),
          ]}
          onPress={onPress}
          testID={`container-${testID}`}
        >
          <View
            style={[
              tw('py-5 pr-6 flex-row items-center justify-between gap-2'),
            ]}
          >
            <View style={tw('flex-1 gap-1 h-14')}>
              <LeafText variant="label-default" testID={`text-title-${testID}`}>
                {drugNames}
              </LeafText>
              <LeafText
                color="leaf-color-content-subtle"
                testID={`text-subtitle-${testID}`}
              >
                {subtitle}
              </LeafText>
            </View>
          </View>
        </Pressable>
        <LeafText
          variant="label-small"
          style={tw('italic px-6')}
          testID={`text-date-${testID}`}
        >
          {formattedDate}
        </LeafText>
      </Card>
    );
  }

  return (
    <Group testID={`full-${testID}`}>
      <Pressable
        style={[
          tw('flex-row w-full justify-between items-center gap-2 px-6 py-1'),
        ]}
        onPress={onPress}
        testID={`order-header`}
      >
        <View
          style={[
            tw('flex-1 py-5 pr-6 flex-row items-center justify-between gap-2'),
          ]}
        >
          <View style={tw('flex-1 gap-1 h-14')}>
            <LeafText variant="label-default" testID={`text-title-${testID}`}>
              {drugNames}
            </LeafText>
            <LeafText
              color="leaf-color-content-subtle"
              testID={`text-subtitle-${testID}`}
            >
              {subtitle}
            </LeafText>
          </View>
        </View>
      </Pressable>
      <Pressable
        key={`order-item-${order.orderItems[0].prescription.resourceId}`}
        style={tw('flex-row justify-between pl-1 pb-4 h-10 gap-1')}
        testID="container-order-item"
        onPress={onPress}
      >
        <StatusComponent status={getOrderStatus(order)} testID={testID} />
        <View
          style={tw('flex-row items-center pr-4')}
          testID={`icon-card-${testID}`}
        >
          <LeafText
            variant="label-small"
            style={tw('italic px-3')}
            testID={`text-date-${testID}`}
          >
            {formattedDate}
          </LeafText>
          <LeafIcon
            testID="icon-item-action"
            variant="caret-right"
            size={24}
            color="leaf-color-content-subtle"
          />
        </View>
      </Pressable>
    </Group>
  );
};

export default OrderCard;
