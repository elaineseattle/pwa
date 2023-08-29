import { Card } from '@cigna/react-native/shared/ui/card';
import { useTailwind } from '@cigna/react-native/shared/ui/tailwind';
import { useFeatureTranslation } from '../../hooks';
import { InformationPane } from './information-pane';
import { View } from 'react-native';
import { useNavigation } from '@cigna/react-native/shared/util/navigation';
import { Address } from '@cigna/react-native/shared/feature/universal-shipping-address';
import {
  ShippingOptions,
  PaymentMethod,
} from '@cigna/shared/evn-nav/pharmacy/medications-util';
import { useShippingMethodContext } from '../../providers';

export interface MemberFulfillmentContainerProps {
  shippingOptions: ShippingOptions[] | undefined;
  paymentMethod: PaymentMethod | undefined;
  currentAddress: Address | undefined;
}

export const MemberFulfillmentContainer = ({
  shippingOptions,
  paymentMethod,
  currentAddress,
}: MemberFulfillmentContainerProps) => {
  const { tw } = useTailwind();
  const { t } = useFeatureTranslation();
  const { navigate } = useNavigation();

  const paymentMethodStr = () => {
    if (paymentMethod?.paymentMethodType === 'ECheck') {
      return t('checkout.echeckPaymentMethodLabel', {
        accountNumber: paymentMethod?.lastFourDigits,
      });
    }
    if (paymentMethod?.paymentMethodType === 'Credit Card') {
      return `${paymentMethod?.creditCardType} ****${paymentMethod?.lastFourDigits}`;
    }

    return t('checkout.paymentMethodRequiredText');
  };

  const address = `${currentAddress?.address}\n${currentAddress?.city}, ${currentAddress?.state} ${currentAddress?.zip}`;

  const { index: selectedShippingMethodIndex } = useShippingMethodContext();

  const getSelectedShippingMethodLabel = () => {
    let selectedShippingMethodLabel = t(
      'checkout.shippingMethod.standard.shippingLabel',
    );
    const item =
      shippingOptions &&
      shippingOptions.length >= selectedShippingMethodIndex &&
      shippingOptions[selectedShippingMethodIndex];
    if (item?.deliveryType === 'TWO_DAY') {
      selectedShippingMethodLabel = t(
        'checkout.shippingMethod.twoDay.shippingLabel',
      );
    } else if (item?.deliveryType === 'OVERNIGHT_PM') {
      selectedShippingMethodLabel = t(
        'checkout.shippingMethod.oneDay.shippingLabel',
      );
    }

    return selectedShippingMethodLabel;
  };

  const labels = {
    shippingAddressLabel: t('checkout.shippingAddressLabel'),
    paymentMethodLabel: t('checkout.paymentMethodLabel'),
    shippingMethodLabel: t('checkout.shippingMethodLabel'),
    standardShippingLabel: t('checkout.standardShippingLabel'),
  };

  const ShippingAddress: React.FC = () => (
    <InformationPane
      icon="house-line"
      heading={labels.shippingAddressLabel}
      captionText={currentAddress && address}
      testID="shipping-address-pane"
      iconTestID="house-with-line"
      onPanePress={() => navigate('universal-shipping-address')}
    />
  );

  const PaymentMethodSection: React.FC = () => (
    <InformationPane
      icon="payment-wallet"
      heading={labels.paymentMethodLabel}
      captionText={paymentMethodStr()}
      testID="payment-method-pane"
      iconTestID="wallet"
      onPanePress={() => navigate('universal-payment')}
    />
  );

  const ShippingFulfillment: React.FC = () => (
    <InformationPane
      icon="package"
      heading={labels.shippingMethodLabel}
      captionText={getSelectedShippingMethodLabel()}
      testID="shipping-fulfillment-pane"
      iconTestID="package"
      onPanePress={() => {
        navigate('shipping-method', { shippingOptions });
      }}
    />
  );

  return (
    <Card style={tw('pl-6')} testID="member-fulfillment-container">
      <ShippingAddress />
      <View style={tw('border-b border-neutral-03')} testID="separator" />
      <PaymentMethodSection />
      <View style={tw('border-b border-neutral-03')} testID="separator" />
      <ShippingFulfillment />
    </Card>
  );
};
